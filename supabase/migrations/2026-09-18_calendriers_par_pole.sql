-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : un calendrier par pôle (18/09/2026)
--
-- PROBLÈME RAPPORTÉ PAR NAFI le 18/09 : bloquer une indisponibilité dans
-- /gestion rendait le créneau indisponible chez LES DEUX pôles. Quand Kandy
-- n'est pas là, ce sont ses prestations à elle qui doivent disparaître, pas
-- celles de Naftali.
--
-- En vérifiant, le même défaut touchait les RENDEZ-VOUS eux-mêmes : une
-- cliente chez Kandy à 14h faisait disparaître 14h chez Naftali. Le site
-- traitait le showroom comme une seule place. Or Kandy et Nafi travaillent
-- en parallèle (confirmé par Gradi le 18/09) : chacune sa cliente.
--
-- CE QUE FAIT CETTE MIGRATION :
--   1. `blocked_slots` gagne une colonne `brand` — NULL = les deux pôles
--      (fermeture du showroom), sinon le pôle concerné.
--   2. `get_taken_slots` gagne une variante à deux arguments qui ne rend que
--      l'occupation D'UN pôle. L'ancienne version à un argument est CONSERVÉE
--      telle quelle : si le site est redéployé en arrière, il continue de
--      fonctionner exactement comme avant.
--   3. `create_booking` n'oppose plus que les blocages du pôle concerné.
--   4. La contrainte anti-chevauchement de `bookings` devient « par pôle ».
--
-- ⚠️ POINT LE PLUS SENSIBLE : l'étape 4 remplace une contrainte existante
-- dont la définition n'était pas versionnée dans le dépôt. Elle est donc
-- retrouvée dynamiquement et recréée à l'identique, plus la dimension `brand`.
-- Le bloc vérifie lui-même son résultat et échoue bruyamment plutôt que de
-- laisser la table sans protection : une migration à moitié appliquée ici
-- signifierait des doubles réservations sur de vraies clientes.
--
-- RÉVERSIBILITÉ : le script de retour en arrière est en commentaire tout en
-- bas du fichier.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. Prérequis : comparer un texte avec « = » dans un index GiST ────────
--     (btree_gist permet de mêler `brand with =` et `tsrange with &&`.)
create extension if not exists btree_gist;

-- ── 1. Le pôle concerné par une indisponibilité ────────────────────────────
alter table public.blocked_slots
  add column if not exists brand text;

comment on column public.blocked_slots.brand is
  'Pôle concerné : ''kandylove'', ''naftali'', ou NULL = les deux (showroom fermé).';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.blocked_slots'::regclass
      and conname = 'blocked_slots_brand_check'
  ) then
    alter table public.blocked_slots
      add constraint blocked_slots_brand_check
      check (brand is null or brand in ('kandylove', 'naftali'));
  end if;
end $$;

-- Les indisponibilités déjà enregistrées restent volontairement à NULL :
-- elles ont été posées quand le blocage valait pour tout le monde, on ne
-- devine pas rétroactivement l'intention.

-- ── 2. Occupation d'un pôle donné ──────────────────────────────────────────
-- Surcharge à deux arguments. L'ancienne `get_taken_slots(date)` n'est PAS
-- touchée : elle reste la vue « tous pôles confondus », utile si l'on doit
-- redéployer une version antérieure du site.
create or replace function public.get_taken_slots(p_date date, p_brand text)
returns table (start_time time, end_time time)
language sql
security definer
set search_path = public
as $$
  select b.start_time, b.end_time
  from public.bookings b
  where b.booking_date = p_date
    and b.brand = p_brand
    and b.status <> 'cancelled'
    and not (
      b.status = 'awaiting_payment'
      and b.expires_at is not null
      and b.expires_at < now()
    )
  union all
  select coalesce(s.start_time, time '00:00'),
         coalesce(s.end_time,   time '23:59')
  from public.blocked_slots s
  where s.day = p_date
    -- NULL = showroom fermé : vaut pour les deux pôles.
    and (s.brand is null or s.brand = p_brand);
$$;

-- ── 3. create_booking : seuls les blocages du pôle s'opposent ──────────────
create or replace function public.create_booking(
  p_service_id    text,
  p_service_name  text,
  p_brand         text,
  p_price_label   text,
  p_duration_min  int,
  p_date          date,
  p_start_time    time,
  p_end_time      time,
  p_first_name    text,
  p_last_name     text,
  p_email         text,
  p_phone         text,
  p_notes         text,
  p_status        text default 'pending',
  p_deposit_cents int default 0,
  p_expires_at    timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_status not in ('pending', 'awaiting_payment') then
    raise exception 'BAD_STATUS';
  end if;

  -- Créneau dans une plage bloquée → refus immédiat. Seuls comptent les
  -- blocages de CE pôle, et ceux qui ferment tout le showroom (brand NULL).
  if exists (
    select 1
    from public.blocked_slots s
    where s.day = p_date
      and (s.brand is null or s.brand = p_brand)
      and coalesce(s.start_time, time '00:00') < p_end_time
      and coalesce(s.end_time,   time '23:59') > p_start_time
  ) then
    raise exception 'SLOT_TAKEN';
  end if;

  -- Libère les blocages de paiement expirés qui chevauchent ce créneau —
  -- sinon la contrainte d'exclusion refuserait un créneau pourtant libre.
  -- Restreint au même pôle, comme la contrainte elle-même.
  update public.bookings
     set status = 'cancelled'
   where status = 'awaiting_payment'
     and expires_at is not null
     and expires_at < now()
     and booking_date = p_date
     and brand = p_brand
     and tsrange(booking_date + start_time, booking_date + end_time)
         && tsrange(p_date + p_start_time, p_date + p_end_time);

  insert into public.bookings (
    service_id, service_name, brand, price_label, duration_min,
    booking_date, start_time, end_time,
    first_name, last_name, email, phone, notes,
    status, deposit_cents, expires_at
  )
  values (
    p_service_id, p_service_name, p_brand, p_price_label, p_duration_min,
    p_date, p_start_time, p_end_time,
    p_first_name, p_last_name, p_email, p_phone, nullif(p_notes, ''),
    p_status, p_deposit_cents, p_expires_at
  )
  returning id into v_id;

  return v_id;
exception
  when exclusion_violation then
    raise exception 'SLOT_TAKEN';
end;
$$;

-- ── 4. Anti-chevauchement : par pôle, plus par showroom ────────────────────
-- La contrainte d'exclusion d'origine n'est pas versionnée ici : on la
-- retrouve par son type (contype = 'x' sur public.bookings) avant de la
-- remplacer. Tout se passe dans une seule transaction implicite : en cas
-- d'échec, rien n'est appliqué et l'ancienne contrainte reste en place.
do $$
declare
  v_ancienne text;
  v_nb       int;
begin
  select count(*), min(conname)
    into v_nb, v_ancienne
  from pg_constraint
  where conrelid = 'public.bookings'::regclass
    and contype = 'x';

  -- Déjà migré (relance du script) : on ne fait rien.
  if v_ancienne = 'bookings_sans_chevauchement_par_pole' then
    raise notice 'Contrainte par pôle déjà en place — rien à faire.';
    return;
  end if;

  if v_nb > 1 then
    raise exception
      'Plusieurs contraintes d''exclusion sur bookings (%) — migration interrompue, à traiter à la main.',
      v_nb;
  end if;

  if v_ancienne is not null then
    execute format('alter table public.bookings drop constraint %I', v_ancienne);
    raise notice 'Ancienne contrainte % supprimée.', v_ancienne;
  else
    raise warning 'Aucune contrainte d''exclusion trouvée sur bookings — elle va être créée.';
  end if;

  -- Deux rendez-vous ne peuvent se chevaucher que s'ils sont sur le MÊME
  -- pôle : Kandy et Nafi reçoivent chacune une cliente en parallèle.
  alter table public.bookings
    add constraint bookings_sans_chevauchement_par_pole
    exclude using gist (
      brand with =,
      tsrange(booking_date + start_time, booking_date + end_time) with &&
    ) where (status <> 'cancelled');

  -- Garde-fou : ne jamais laisser la table sans protection.
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_sans_chevauchement_par_pole'
  ) then
    raise exception 'La nouvelle contrainte n''a pas été créée — migration annulée.';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- RETOUR EN ARRIÈRE (à exécuter tel quel si besoin) :
--
--   alter table public.bookings
--     drop constraint if exists bookings_sans_chevauchement_par_pole;
--   alter table public.bookings
--     add constraint bookings_sans_chevauchement
--     exclude using gist (
--       tsrange(booking_date + start_time, booking_date + end_time) with &&
--     ) where (status <> 'cancelled');
--   drop function if exists public.get_taken_slots(date, text);
--   alter table public.blocked_slots drop column if exists brand;
--
-- (create_booking retrouve son comportement d'avant en réappliquant la
--  version du 03/09 : le `and (s.brand is null or s.brand = p_brand)` et le
--  `and brand = p_brand` sont les deux seules lignes à retirer.)
-- ═══════════════════════════════════════════════════════════════════════════
