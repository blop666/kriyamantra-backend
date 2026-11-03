create type public.conversation_channel as enum ('web', 'whatsapp');
create type public.conversation_state as enum (
  'collect_context', 'ask_missing_data', 'confirm_generation', 'generating',
  'review_output', 'revision', 'approved'
);
create type public.message_role as enum ('user', 'assistant', 'system');

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  channel public.conversation_channel not null default 'web',
  state public.conversation_state not null default 'collect_context',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role public.message_role not null,
  content text not null check (char_length(content) between 1 and 12000),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index conversations_business_id_updated_at_idx on public.conversations (business_id, updated_at desc);
create index messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "owners can read their conversations" on public.conversations for select
  using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can create their conversations" on public.conversations for insert
  with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can update their conversations" on public.conversations for update
  using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));

create policy "owners can read their messages" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    join public.businesses b on b.id = c.business_id
    where c.id = conversation_id and b.owner_id = auth.uid()
  ));
create policy "owners can create their messages" on public.messages for insert
  with check (exists (
    select 1 from public.conversations c
    join public.businesses b on b.id = c.business_id
    where c.id = conversation_id and b.owner_id = auth.uid()
  ));

create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();
