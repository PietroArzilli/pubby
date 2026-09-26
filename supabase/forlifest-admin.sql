-- Forlì Fest × Pubby — accesso admin alle iscrizioni
-- Da incollare nel SQL Editor DOPO forlifest.sql.
--
-- La pagina www.pubby.it/forlifest-admin fa login con Supabase Auth
-- (email + password) e con quel token legge e cancella le iscrizioni.
-- Non basta essere loggati: l'email deve essere in forlifest_admin.
-- Cosi' anche se qualcuno riuscisse a registrarsi, non vede niente.

create table if not exists public.forlifest_admin (
  email text primary key check (email = lower(email))
);
alter table public.forlifest_admin enable row level security;
revoke all on table public.forlifest_admin from anon, authenticated;

-- chi puo' entrare: aggiungi una riga per ogni persona che deve vedere le liste
insert into public.forlifest_admin (email) values ('p.arzilli@pubby.sm')
on conflict do nothing;

create or replace function public.forlifest_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.forlifest_admin
    where email = lower(auth.jwt() ->> 'email')
  );
$$;
revoke all on function public.forlifest_is_admin() from public;
grant execute on function public.forlifest_is_admin() to authenticated;

grant select, delete on table public.forlifest_iscrizioni to authenticated;

drop policy if exists "admin legge" on public.forlifest_iscrizioni;
create policy "admin legge" on public.forlifest_iscrizioni
  for select to authenticated using (public.forlifest_is_admin());

drop policy if exists "admin cancella" on public.forlifest_iscrizioni;
create policy "admin cancella" on public.forlifest_iscrizioni
  for delete to authenticated using (public.forlifest_is_admin());
