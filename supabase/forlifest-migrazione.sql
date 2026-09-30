-- Forlì Fest — trasloco delle iscrizioni dal vecchio progetto
-- (kntjqcusvqrstjeruffq) a "pubby generico". Si usa una volta sola.
--
-- 1. Incolla questa query nel SQL Editor del VECCHIO progetto e lanciala.
--    Non modifica niente: legge e basta.
-- 2. Esce una sola cella con dentro un "insert ...": copiala tutta.
-- 3. Incollala nel SQL Editor del NUOVO progetto e lanciala.
--
-- Le due righe per persona (una per sera) diventano una: resta la prima
-- iscrizione, e il consenso ai nuovi eventi se l'aveva dato su una delle due.
-- Chi era ancora in SpottedUni passa in Younivibes, che ne ha preso il posto.
-- "on conflict do nothing": si puo' rilanciare quante volte serve, chi e'
-- gia' nel nuovo progetto non viene toccato. Serve per chi si iscrive nel
-- frattempo, prima che il sito punti al nuovo progetto.

with persone as (
  select distinct on (email)
    email, creata_il, nome, cognome, telefono,
    case when lista = 'SpottedUni' then 'Younivibes' else lista end as lista
  from public.forlifest_iscrizioni
  order by email, creata_il
),
consensi as (
  select email, max(consenso_marketing_il) as il
  from public.forlifest_iscrizioni
  where consenso_marketing
  group by email
)
select
  'insert into public.forlifest_iscrizioni (creata_il, lista, nome, cognome, telefono, email, consenso_marketing, consenso_marketing_il) values '
  || string_agg(
       format('(%L, %L, %L, %L, %L, %L, %L, %L)',
         p.creata_il, p.lista, p.nome, p.cognome, p.telefono, p.email,
         c.email is not null, c.il),
       ', ' order by p.creata_il)
  || ' on conflict (email) do nothing;' as da_copiare,
  count(*) as persone
from persone p
left join consensi c using (email);
