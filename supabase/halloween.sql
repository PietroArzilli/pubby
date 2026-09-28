-- Halloween × Pubby (sabato 31 ottobre 2026) — lista d'ingresso
-- Da incollare nel SQL Editor DOPO forlifest-admin.sql (usa forlifest_is_admin).
--
-- Il form www.pubby.it/halloween e' la copia del repo di Riccardo
-- (github.com/RiccardoDeMedio/FormHalloween): la tabella ha le stesse colonne
-- e gli stessi vincoli del suo supabase/schema.sql, cosi' il form funziona
-- identico. Cambiano solo il nome (halloween_prenotazioni, perche' qui ci sono
-- anche altri eventi) e la data del consenso marketing, che si aggiunge da sola.
--
-- Chi vede cosa:
--   anon (il form)            solo inserire, nessuna lettura
--   admin Pubby               leggere, cancellare, togliere il consenso
--                             (le email in forlifest_admin: sono gli admin
--                             di tutte le liste, il nome e' rimasto quello)
--   staff (BAILABONITA)       solo leggere nome, cognome, telefono e data,
--                             tramite halloween_lista_staff(). Niente consenso
--                             marketing: quello l'hanno dato a Pubby.
--
-- Supabase avvisa "destructive operations" per i revoke e i drop policy:
-- tolgono permessi che Supabase da' di default, non toccano dati.

begin;

create table if not exists public.halloween_prenotazioni (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null check (char_length(trim(nome)) between 1 and 60),
  cognome text not null check (char_length(trim(cognome)) between 1 and 60),
  telefono text not null check (telefono ~ '^\+?[0-9 ]{6,20}$'),
  consenso_privacy boolean not null check (consenso_privacy = true),
  consenso_marketing boolean not null default false,
  consenso_marketing_il timestamptz
);

-- un numero si puo' mettere in lista una volta sola (spazi e "+" non contano).
-- Il doppione torna al form come 409, e il form lo dice all'utente.
create unique index if not exists halloween_prenotazioni_telefono_unique
  on public.halloween_prenotazioni (regexp_replace(telefono, '[^0-9]', '', 'g'));

-- la data del consenso e' la prova da conservare: la mette il database,
-- il form non la manda
create or replace function public.halloween_data_consenso()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.consenso_marketing_il := case when new.consenso_marketing then now() end;
  return new;
end;
$$;

drop trigger if exists halloween_data_consenso on public.halloween_prenotazioni;
create trigger halloween_data_consenso
  before insert on public.halloween_prenotazioni
  for each row execute function public.halloween_data_consenso();

alter table public.halloween_prenotazioni enable row level security;

-- Supabase da' tutto ad anon e authenticated sulle tabelle nuove: si toglie
-- e si ridà solo il necessario. Il form puo' scrivere solo queste colonne
-- (non id, created_at o la data del consenso).
revoke all on table public.halloween_prenotazioni from anon, authenticated;
grant insert (nome, cognome, telefono, consenso_privacy, consenso_marketing)
  on table public.halloween_prenotazioni to anon, authenticated;

drop policy if exists "chiunque puo' mettersi in lista" on public.halloween_prenotazioni;
create policy "chiunque puo' mettersi in lista" on public.halloween_prenotazioni
  for insert to anon, authenticated
  with check (consenso_privacy = true);

-- ---------- admin Pubby (www.pubby.it/forlifest-admin) ----------
grant select, delete on table public.halloween_prenotazioni to authenticated;
grant update (consenso_marketing, consenso_marketing_il) on table public.halloween_prenotazioni to authenticated;

drop policy if exists "admin legge" on public.halloween_prenotazioni;
create policy "admin legge" on public.halloween_prenotazioni
  for select to authenticated using (public.forlifest_is_admin());

drop policy if exists "admin cancella" on public.halloween_prenotazioni;
create policy "admin cancella" on public.halloween_prenotazioni
  for delete to authenticated using (public.forlifest_is_admin());

drop policy if exists "admin aggiorna consenso" on public.halloween_prenotazioni;
create policy "admin aggiorna consenso" on public.halloween_prenotazioni
  for update to authenticated
  using (public.forlifest_is_admin()) with check (public.forlifest_is_admin());

-- ---------- staff degli organizzatori (www.pubby.it/halloween-staff) ----------
-- Si entra con un nome utente: la pagina lo trasforma in
-- <nome>@staff.pubby.it, che e' l'email dell'utente in Supabase Auth.
-- Il sottodominio staff.pubby.it non riceve posta: e' solo un'etichetta.
create table if not exists public.halloween_staff (
  email text primary key check (email = lower(email))
);
alter table public.halloween_staff enable row level security;
revoke all on table public.halloween_staff from anon, authenticated;

insert into public.halloween_staff (email) values ('bailabonita@staff.pubby.it')
on conflict do nothing;

-- lo staff non ha accesso alla tabella: legge solo da qui, e solo le colonne
-- che servono alla porta
create or replace function public.halloween_lista_staff()
returns table (cognome text, nome text, telefono text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.halloween_staff
    where email = lower(auth.jwt() ->> 'email')
  ) then
    raise exception 'non autorizzato' using errcode = '42501';
  end if;

  return query
    select p.cognome, p.nome, p.telefono, p.created_at
    from public.halloween_prenotazioni p
    order by lower(p.cognome), lower(p.nome);
end;
$$;
revoke all on function public.halloween_lista_staff() from public, anon;
grant execute on function public.halloween_lista_staff() to authenticated;

commit;
