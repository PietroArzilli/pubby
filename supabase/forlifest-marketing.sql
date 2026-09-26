-- Forlì Fest × Pubby — consenso a essere ricontattati per nuovi eventi
-- Da incollare nel SQL Editor DOPO forlifest.sql e forlifest-admin.sql.
--
-- Il consenso al marketing e' separato da quello per la lista e facoltativo
-- (art. 7 GDPR): nel form e' una seconda casella, non spuntata. Qui si
-- salva se l'ha dato e quando, che e' la prova da conservare.
-- Chi si e' iscritto prima di questa modifica resta a false: non l'ha dato.
--
-- Supabase avvisa "destructive operations" per il drop function: toglie la
-- vecchia versione della funzione e la ricrea con un parametro in piu'.
-- E' tutto in una transazione, quindi il form non resta mai senza funzione.
-- Le iscrizioni non vengono toccate.

begin;

alter table public.forlifest_iscrizioni
  add column if not exists consenso_marketing boolean not null default false,
  add column if not exists consenso_marketing_il timestamptz;

drop function if exists public.iscriviti_forlifest(text, text, text, text, text, date[]);

create or replace function public.iscriviti_forlifest(
  p_lista     text,
  p_nome      text,
  p_cognome   text,
  p_telefono  text,
  p_email     text,
  p_serate    date[],
  p_marketing boolean default false
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
  mk    boolean := coalesce(p_marketing, false);
begin
  if p_serate is null or cardinality(p_serate) = 0 then
    raise exception 'serate mancanti' using errcode = '22023';
  end if;

  for s in select distinct x from unnest(p_serate) as x order by 1 loop
    insert into public.forlifest_iscrizioni
      (serata, lista, nome, cognome, telefono, email, consenso_marketing, consenso_marketing_il)
    values
      (s, p_lista, trim(p_nome), trim(p_cognome), p_telefono, lower(trim(p_email)),
       mk, case when mk then now() end)
    on conflict (email, serata) do nothing;

    if found then nuove := nuove || s; else gia := gia || s; end if;
  end loop;

  -- chi era gia' in lista e ora da' il consenso: lo registro. Il contrario
  -- no: togliere il consenso e' una richiesta esplicita, non una casella
  -- lasciata vuota a un secondo invio.
  if mk then
    update public.forlifest_iscrizioni
       set consenso_marketing = true, consenso_marketing_il = now()
     where email = lower(trim(p_email)) and not consenso_marketing;
  end if;

  return jsonb_build_object('nuove', nuove, 'gia', gia);
end;
$$;

revoke all on function public.iscriviti_forlifest(text, text, text, text, text, date[], boolean) from public;
grant execute on function public.iscriviti_forlifest(text, text, text, text, text, date[], boolean) to anon;

-- dall'admin si puo' anche togliere il consenso a chi lo chiede
grant update (consenso_marketing, consenso_marketing_il) on table public.forlifest_iscrizioni to authenticated;
drop policy if exists "admin aggiorna consenso" on public.forlifest_iscrizioni;
create policy "admin aggiorna consenso" on public.forlifest_iscrizioni
  for update to authenticated
  using (public.forlifest_is_admin()) with check (public.forlifest_is_admin());

commit;
