CREATE TABLE public.attendances (
  id uuid default gen_random_uuid() primary key,
  colaborador text not null,
  data date not null,
  hora time not null,
  hora_faixa time not null,
  qtd integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
