-- ═══════════════════════════════════════════════════════════════════════════
-- Maison Kanali — schéma de la base de réservations (Supabase / Postgres)
--
-- Principes :
--   · Aucun accès direct aux tables depuis le navigateur (RLS sans policy).
--   · Toutes les opérations passent par des fonctions RPC `security definer`
--     appelées par les routes API du site.
--   · Une contrainte d'exclusion garantit qu'aucun rendez-vous ne peut en
--     chevaucher un autre, même en cas de réservations simultanées.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists btree_gist;

-- ── Rendez-vous ────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  service_id    text not null,
  service_name  text not null,
  brand         text not null,
  price_label   text not null,
  duration_min  int  not null check (duration_min between 15 and 480),
  booking_date  date not null,
  start_time    time not null,
  end_time      time not null,
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text not null,
  notes         text,
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled')),
  constraint bookings_time_valid check (end_time > start_time),
  -- Deux rendez-vous actifs ne peuvent jamais se chevaucher.
  constraint bookings_no_overlap exclude using gist (
    tsrange(booking_date + start_time, booking_date + end_time) with &&
  ) where (status <> 'cancelled')
);

alter table public.bookings enable row level security;

-- ── Demandes de formation ──────────────────────────────────────────────────
create table if not exists public.formation_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  formation_id   text not null,
  formation_name text not null,
  kit_option     text,
  first_name     text not null,
  last_name      text not null,
  email          text not null,
  phone          text not null,
  message        text,
  status         text not null default 'pending'
                 check (status in ('pending', 'contacted', 'closed'))
);

alter table public.formation_requests enable row level security;

-- ── RPC : créneaux occupés d'une journée (aucune donnée personnelle) ──────
create or replace function public.get_taken_slots(p_date date)
returns table (start_time time, end_time time)
language sql
security definer
set search_path = public
as $$
  select b.start_time, b.end_time
  from public.bookings b
  where b.booking_date = p_date
    and b.status <> 'cancelled';
$$;

-- ── RPC : création atomique d'un rendez-vous ───────────────────────────────
create or replace function public.create_booking(
  p_service_id   text,
  p_service_name text,
  p_brand        text,
  p_price_label  text,
  p_duration_min int,
  p_date         date,
  p_start_time   time,
  p_end_time     time,
  p_first_name   text,
  p_last_name    text,
  p_email        text,
  p_phone        text,
  p_notes        text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.bookings (
    service_id, service_name, brand, price_label, duration_min,
    booking_date, start_time, end_time,
    first_name, last_name, email, phone, notes
  )
  values (
    p_service_id, p_service_name, p_brand, p_price_label, p_duration_min,
    p_date, p_start_time, p_end_time,
    p_first_name, p_last_name, p_email, p_phone, nullif(p_notes, '')
  )
  returning id into v_id;

  return v_id;
exception
  when exclusion_violation then
    raise exception 'SLOT_TAKEN';
end;
$$;

-- ── RPC : demande d'inscription à une formation ────────────────────────────
create or replace function public.create_formation_request(
  p_formation_id   text,
  p_formation_name text,
  p_kit_option     text,
  p_first_name     text,
  p_last_name      text,
  p_email          text,
  p_phone          text,
  p_message        text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.formation_requests (
    formation_id, formation_name, kit_option,
    first_name, last_name, email, phone, message
  )
  values (
    p_formation_id, p_formation_name, nullif(p_kit_option, ''),
    p_first_name, p_last_name, p_email, p_phone, nullif(p_message, '')
  )
  returning id into v_id;

  return v_id;
end;
$$;
