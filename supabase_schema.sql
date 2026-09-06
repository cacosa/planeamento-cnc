-- Planeamento CNC V1
-- Execute este ficheiro no SQL Editor do Supabase quando formos ligar a aplicação.

create table if not exists machines (
  id bigint generated always as identity primary key,
  code text unique not null,
  machine_group text not null,
  exclusive_operator boolean default false,
  active boolean default true
);

create table if not exists employees (
  id bigint generated always as identity primary key,
  name text not null,
  shift text not null check (shift in ('Manhã','Tarde','Noite')),
  active boolean default true
);

create table if not exists parts (
  id bigint generated always as identity primary key,
  part_code text unique not null,
  designation text
);

create table if not exists operations (
  id bigint generated always as identity primary key,
  part_id bigint not null references parts(id) on delete cascade,
  operation_code text not null,
  minutes_per_piece numeric not null check (minutes_per_piece > 0),
  setup_hours numeric not null default 0,
  unique(part_id, operation_code)
);

create table if not exists operation_machine_groups (
  id bigint generated always as identity primary key,
  operation_id bigint not null references operations(id) on delete cascade,
  machine_group text not null,
  unique(operation_id, machine_group)
);

create table if not exists planning (
  id bigint generated always as identity primary key,
  machine_id bigint not null references machines(id),
  operation_id bigint not null references operations(id),
  quantity integer not null check (quantity > 0),
  start_date date not null,
  morning_employee_id bigint references employees(id),
  afternoon_employee_id bigint references employees(id),
  night_employee_id bigint references employees(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Para a primeira ligação, podemos começar com RLS desativado enquanto testamos.
-- Antes de uso mais amplo, configuraremos autenticação e políticas RLS.
