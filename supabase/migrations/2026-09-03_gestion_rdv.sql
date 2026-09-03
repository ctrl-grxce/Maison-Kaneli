-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : espace de gestion des rendez-vous (03/09/2026)
--
-- 1. Table des indisponibilités (jours ou plages bloqués par Kandy & Nafi).
-- 2. get_taken_slots inclut les plages bloquées → elles disparaissent du
--    calendrier public sans changer une ligne du site.
-- 3. create_booking refuse un créneau qui chevauche une plage bloquée
--    (défense en profondeur : même un appel direct ne peut pas réserver).
--
-- ADDITIVE ET RÉTROCOMPATIBLE : sans blocage enregistré, tout fonctionne
-- exactement comme avant. Les opérations d'administration (liste, annulation,
-- déplacement, blocages) passent par la clé service_role côté serveur
-- uniquement — aucune fonction supplémentaire exposée à la clé anonyme.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Indisponibilités ────────────────────────────────────────────────────
create table if not exists public.blocked_slots (
  id         uuid primary key default gen_random_uuid(),
  day        date not null,
  -- NULL des deux côtés = jour entier bloqué.
  start_time time,
  end_time   time,
  reason     text,
  created_at timestamptz not null default now(),
  constraint blocked_slots_pair_check
    check ((start_time is null) = (end_time is null)),
  constraint blocked_slots_order_check
    check (start_time is null or start_time < end_time)
);

create index if not exists blocked_slots_day_idx on public.blocked_slots (day);

-- Verrouillée comme les autres tables : RLS sans aucune policy publique.
alter table public.blocked_slots enable row level security;

-- ── 2. Les créneaux bloqués apparaissent comme occupés ─────────────────────
create or replace function public.get_taken_slots(p_date date)
returns table (start_time time, end_time time)
language sql
security definer
set search_path = public
as $$
  select b.start_time, b.end_time
  from public.bookings b
  where b.booking_date = p_date
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
  where s.day = p_date;
$$;

-- ── 3. create_booking refuse les plages bloquées ───────────────────────────
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

  -- Créneau dans une plage bloquée par la maison → refus immédiat.
  if exists (
    select 1
    from public.blocked_slots s
    where s.day = p_date
      and coalesce(s.start_time, time '00:00') < p_end_time
      and coalesce(s.end_time,   time '23:59') > p_start_time
  ) then
    raise exception 'SLOT_TAKEN';
  end if;

  -- Libère les blocages de paiement expirés qui chevauchent ce créneau —
  -- sinon la contrainte d'exclusion refuserait un créneau pourtant libre.
  update public.bookings
     set status = 'cancelled'
   where status = 'awaiting_payment'
     and expires_at is not null
     and expires_at < now()
     and booking_date = p_date
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
