-- Forlì Fest × Pubby — iscrizioni alle liste
-- Progetto Supabase: "pubby generico" (a pagamento, da fine settembre 2026).
-- Il vecchio progetto era kntjqcusvqrstjeruffq: questo file sostituisce
-- forlifest.sql + forlifest-marketing.sql di allora (vedi la storia git).
-- Da incollare una volta nel SQL Editor, PRIMA di forlifest-admin.sql.
--
-- Una riga per persona: chi si iscrive e' in lista per tutte e due le sere
-- (sab 10 e dom 11 ottobre 2026), quindi la sera non si salva. Prima c'era
-- una riga per sera, cioe' ogni persona due volte.
--
-- La pagina www.pubby.it/forlifest usa la chiave pubblica (publishable/anon),
-- che chiunque puo' leggere nel sorgente. Per questo:
--   - la tabella ha RLS attivo e, per anon, nessuna policy: con la chiave
--     pubblica non si legge e non si scrive niente direttamente;
--   - l'unica porta e' la funzione iscriviti_forlifest, che inserisce e dice
--     solo se l'iscrizione e' nuova o se l'email era gia' in lista.

begin;

create table if not exists public.forlifest_iscrizioni (
  id        bigint generated always as identity primary key,
  creata_il timestamptz not null default now(),
  lista     text not null check (lista in ('Locali', 'Younivibes', 'Baila Bonita')),
  nome      text not null check (char_length(nome) between 1 and 60),
  cognome   text not null check (char_length(cognome) between 1 and 60),
  telefono  text not null check (telefono ~ '^\+?[0-9]{8,15}$'),
  -- una persona, una riga: e' il controllo dei doppioni
  email     text not null unique check (char_length(email) <= 120 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  -- consenso a essere ricontattati per nuovi eventi: separato da quello per
  -- la lista e facoltativo (art. 7 GDPR). La data e' la prova da conservare.
  consenso_marketing    boolean not null default false,
  consenso_marketing_il timestamptz
);

alter table public.forlifest_iscrizioni enable row level security;
revoke all on table public.forlifest_iscrizioni from anon, authenticated;

create or replace function public.iscriviti_forlifest(
  p_lista     text,
  p_nome      text,
  p_cognome   text,
  p_telefono  text,
  p_email     text,
  p_marketing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  mk    boolean := coalesce(p_marketing, false);
  nuova boolean;
begin
  insert into public.forlifest_iscrizioni
    (lista, nome, cognome, telefono, email, consenso_marketing, consenso_marketing_il)
  values
    (p_lista, trim(p_nome), trim(p_cognome), p_telefono, lower(trim(p_email)),
     mk, case when mk then now() end)
  on conflict (email) do nothing;
  nuova := found;

  -- chi era gia' in lista e ora da' il consenso: lo registro. Il contrario
  -- no: togliere il consenso e' una richiesta esplicita, non una casella
  -- lasciata vuota a un secondo invio.
  if mk and not nuova then
    update public.forlifest_iscrizioni
       set consenso_marketing = true, consenso_marketing_il = now()
     where email = lower(trim(p_email)) and not consenso_marketing;
  end if;

  return jsonb_build_object('nuova', nuova);
end;
$$;

revoke all on function public.iscriviti_forlifest(text, text, text, text, text, boolean) from public;
grant execute on function public.iscriviti_forlifest(text, text, text, text, text, boolean) to anon;

commit;
