-- Forlì Fest × Pubby — iscrizioni alle liste
-- Progetto Supabase: kntjqcusvqrstjeruffq
-- Da incollare una volta nel SQL Editor del progetto.
--
-- La pagina www.pubby.it/forlifest usa la chiave pubblica (publishable/anon),
-- che chiunque puo' leggere nel sorgente. Per questo:
--   - la tabella ha RLS attivo e nessuna policy: con la chiave pubblica non
--     si legge e non si scrive niente direttamente;
--   - l'unica porta e' la funzione iscriviti_forlifest, che inserisce e
--     restituisce solo quali sere erano nuove e quali gia' prese.
-- Le iscrizioni si leggono dal pannello Supabase (Table Editor) o con la
-- chiave secret, mai dalla pagina.

create table if not exists public.forlifest_iscrizioni (
  id        bigint generated always as identity primary key,
  creata_il timestamptz not null default now(),
  serata    date not null check (serata in ('2026-10-10', '2026-10-11')),
  lista     text not null check (lista in ('Locali', 'SpottedUni', 'Younivibes', 'Baila Bonita')),
  nome      text not null check (char_length(nome) between 1 and 60),
  cognome   text not null check (char_length(cognome) between 1 and 60),
  telefono  text not null check (telefono ~ '^\+?[0-9]{8,15}$'),
  email     text not null check (char_length(email) <= 120 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  -- una persona, una riga per sera: e' il controllo dei doppioni
  unique (email, serata)
);

alter table public.forlifest_iscrizioni enable row level security;
revoke all on table public.forlifest_iscrizioni from anon, authenticated;

create or replace function public.iscriviti_forlifest(
  p_lista    text,
  p_nome     text,
  p_cognome  text,
  p_telefono text,
  p_email    text,
  p_serate   date[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s     date;
  nuove date[] := '{}';
  gia   date[] := '{}';
begin
  if p_serate is null or cardinality(p_serate) = 0 then
    raise exception 'serate mancanti' using errcode = '22023';
  end if;

  for s in select distinct x from unnest(p_serate) as x order by 1 loop
    insert into public.forlifest_iscrizioni (serata, lista, nome, cognome, telefono, email)
    values (s, p_lista, trim(p_nome), trim(p_cognome), p_telefono, lower(trim(p_email)))
    on conflict (email, serata) do nothing;

    if found then nuove := nuove || s; else gia := gia || s; end if;
  end loop;

  return jsonb_build_object('nuove', nuove, 'gia', gia);
end;
$$;

revoke all on function public.iscriviti_forlifest(text, text, text, text, text, date[]) from public;
grant execute on function public.iscriviti_forlifest(text, text, text, text, text, date[]) to anon;
