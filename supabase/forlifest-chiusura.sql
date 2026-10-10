-- Forlì Fest × Pubby — chiusura della lista
-- Da incollare nel SQL Editor DOPO forlifest.sql e forlifest-admin.sql,
-- nel progetto "pubby generico".
--
-- Un interruttore solo: la lista e' aperta o chiusa. Lo gira l'admin col
-- tasto rosso di www.pubby.it/forlifest-admin; la pagina pubblica lo legge
-- e, a lista chiusa, al posto del form mostra l'offerta del botteghino.
-- La chiusura vale anche nel database: iscriviti_forlifest rifiuta le
-- iscrizioni, cosi' non passa niente da una pagina rimasta aperta.

begin;

-- una riga sola (id = 1)
create table if not exists public.forlifest_stato (
  id        smallint primary key default 1 check (id = 1),
  chiusa    boolean not null default false,
  chiusa_il timestamptz
);
insert into public.forlifest_stato (id) values (1) on conflict do nothing;
alter table public.forlifest_stato enable row level security;
revoke all on table public.forlifest_stato from anon, authenticated;

-- lettura per tutti, anche con la chiave pubblica: dice solo aperta/chiusa
create or replace function public.forlifest_stato()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('chiusa', chiusa, 'chiusa_il', chiusa_il)
    from public.forlifest_stato where id = 1;
$$;
revoke all on function public.forlifest_stato() from public;
grant execute on function public.forlifest_stato() to anon, authenticated;

-- apri/chiudi: solo chi e' in forlifest_admin
create or replace function public.forlifest_chiudi(p_chiusa boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.forlifest_is_admin() then
    raise exception 'solo admin' using errcode = '42501';
  end if;
  update public.forlifest_stato
     set chiusa = p_chiusa,
         chiusa_il = case when p_chiusa then now() end
   where id = 1;
  return public.forlifest_stato();
end;
$$;
revoke all on function public.forlifest_chiudi(boolean) from public;
grant execute on function public.forlifest_chiudi(boolean) to authenticated;

-- iscriviti_forlifest come in forlifest.sql, piu' il controllo della chiusura:
-- a lista chiusa risponde { chiusa: true } e non inserisce niente
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
  if (select chiusa from public.forlifest_stato where id = 1) then
    return jsonb_build_object('chiusa', true);
  end if;

  insert into public.forlifest_iscrizioni
    (lista, nome, cognome, telefono, email, consenso_marketing, consenso_marketing_il)
  values
    (p_lista, trim(p_nome), trim(p_cognome), p_telefono, lower(trim(p_email)),
     mk, case when mk then now() end)
  on conflict (email) do nothing;
  nuova := found;

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
