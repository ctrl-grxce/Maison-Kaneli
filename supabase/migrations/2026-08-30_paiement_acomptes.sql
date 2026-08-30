-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : paiement des acomptes en ligne (30/08/2026)
-- Voir docs/PAIEMENT.md — architecture Checkout Stripe + webhook.
--
-- ADDITIVE ET RÉTROCOMPATIBLE : le site en production continue de fonctionner
-- exactement pareil tant que PAYMENTS_ENABLED n'est pas allumé. Les appels
-- existants de create_booking restent valides (nouveaux paramètres optionnels).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Nouveau statut « awaiting_payment » + colonnes de paiement ──────────
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'awaiting_payment', 'confirmed', 'cancelled'));

alter table public.bookings
  add column if not exists deposit_cents     int not null default 0
                           check (deposit_cents >= 0),
  add column if not exists stripe_session_id text,
  add column if not exists expires_at        timestamptz,
  add column if not exists paid_at           timestamptz,
  add column if not exists invoice_number    text;

-- Numérotation continue des factures d'acompte (obligation légale).
create sequence if not exists public.facture_acompte_seq;

-- ── 2. Les créneaux ignorent les blocages de paiement expirés ──────────────
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
    );
$$;

-- ── 3. create_booking : paramètres de paiement optionnels + purge ──────────
-- Postgres ne permet pas d'ajouter des paramètres via « or replace » (cela
-- créerait une seconde fonction et rendrait l'appel ambigu) : on remplace.
drop function if exists public.create_booking(
  text, text, text, text, int, date, time, time, text, text, text, text, text
);

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

-- ── 4. Relier une réservation à sa session de paiement Stripe ──────────────
create or replace function public.attach_stripe_session(
  p_id         uuid,
  p_session_id text
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.bookings
     set stripe_session_id = p_session_id
   where id = p_id
     and status = 'awaiting_payment';
$$;

-- ── 5. Confirmation après paiement — IDEMPOTENTE ───────────────────────────
-- Ne confirme qu'une seule fois (si Stripe notifie deux fois, le second appel
-- ne renvoie aucune ligne → aucun email en double). Attribue le numéro de
-- facture d'acompte à ce moment-là (séquence continue).
create or replace function public.confirm_paid_booking(
  p_id         uuid,
  p_session_id text
)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.bookings
     set status  = 'confirmed',
         paid_at = now(),
         invoice_number = coalesce(
           invoice_number,
           'FA-' || to_char(now() at time zone 'Europe/Paris', 'YYYY') || '-'
                 || lpad(nextval('public.facture_acompte_seq')::text, 4, '0')
         )
   where id = p_id
     and status = 'awaiting_payment'
     and (stripe_session_id is null or stripe_session_id = p_session_id)
  returning *;
end;
$$;

-- ── 6. Libérer un blocage de paiement (abandon ou expiration) ──────────────
-- N'agit QUE sur « awaiting_payment » : une réservation confirmée ou payée
-- ne peut jamais être annulée par ce chemin.
create or replace function public.cancel_payment_hold(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
     set status = 'cancelled'
   where id = p_id
     and status = 'awaiting_payment';
  return found;
end;
$$;

-- ── 7. Statut d'une réservation (page de merci — aucune donnée personnelle) ─
create or replace function public.get_booking_status(p_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select b.status from public.bookings b where b.id = p_id;
$$;
