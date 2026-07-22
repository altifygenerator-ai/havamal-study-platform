-- The Hávamál Archive: relational source archive, private study tools, discussion, moderation, and audit controls.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.content_status as enum ('draft','needs_review','approved','published','rejected','archived');
create type public.user_role as enum ('reader','moderator','admin');
create type public.thread_status as enum ('open','locked','archived');
create type public.post_status as enum ('pending','published','hidden','deleted');
create type public.correction_status as enum ('new','under_review','needs_source','accepted','rejected','published');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  avatar_path text,
  bio text check (char_length(bio) <= 500),
  discussion_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'reader',
  granted_by uuid references auth.users(id), granted_at timestamptz not null default now(),
  primary key(user_id,role)
);

create table public.works (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  title text not null, original_language text, description text,
  status public.content_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.license_records (
  id uuid primary key default gen_random_uuid(), name text unique not null,
  status text not null, attribution_required boolean not null default false,
  public_display_allowed boolean not null default false,
  noncommercial_reuse_allowed boolean not null default false,
  commercial_reuse_allowed boolean not null default false,
  excerpts_allowed boolean not null default false,
  full_text_display_allowed boolean not null default false,
  adaptations_allowed boolean not null default false,
  quote_card_export_allowed boolean not null default false,
  downloadable_export_allowed boolean not null default false,
  reference_url text, jurisdiction_notes text, verified_at date, verified_by text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.source_records (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade,
  title text not null, provider text not null, source_location text not null,
  creator text, publication_year int, original_publisher text, language text not null,
  license_id uuid not null references public.license_records(id), attribution_text text not null,
  source_notes text, enabled boolean not null default false, date_last_verified date, verified_by text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(work_id,source_location)
);
create table public.editions (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade,
  source_record_id uuid not null references public.source_records(id), slug text unique not null,
  edition_title text not null, translator text, editor text, publication_year int not null,
  language text not null, description text, numbering_notes text,
  status public.content_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.canonical_passages (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade,
  slug text unique not null, internal_reference text not null, printed_order int not null,
  section_label text, editorial_note text, status public.content_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(work_id,printed_order)
);
create table public.edition_passages (
  id uuid primary key default gen_random_uuid(), edition_id uuid not null references public.editions(id) on delete cascade,
  source_stanza_number text not null, section_heading text, printed_order int not null,
  text_lines text[] not null check (cardinality(text_lines)>0), old_norse_lines text[] not null default '{}', normalized_search_text text not null default '',
  prose_note text, footnotes jsonb not null default '[]'::jsonb, source_page text,
  source_reference text not null, license_reference text, review_status public.content_status not null default 'draft',
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(edition_id,source_stanza_number)
);
create index edition_passages_search_idx on public.edition_passages using gin(to_tsvector('simple',normalized_search_text));
create index edition_passages_trgm_idx on public.edition_passages using gin(normalized_search_text gin_trgm_ops);
create table public.passage_alignments (
  id uuid primary key default gen_random_uuid(), canonical_passage_id uuid not null references public.canonical_passages(id) on delete cascade,
  edition_passage_id uuid not null references public.edition_passages(id) on delete cascade,
  confidence numeric(4,3) check(confidence between 0 and 1), editorial_notes text,
  spans_multiple_canonical boolean not null default false, multiple_source_to_one boolean not null default false,
  reviewed_by uuid references auth.users(id), reviewed_at timestamptz, unique(canonical_passage_id,edition_passage_id)
);
create table public.passage_sections (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade,
  slug text not null, title text not null, description text, sort_order int not null default 0,
  status public.content_status not null default 'draft', unique(work_id,slug)
);

create table public.themes (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text,
  status public.content_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.passage_themes (
  canonical_passage_id uuid not null references public.canonical_passages(id) on delete cascade,
  theme_id uuid not null references public.themes(id) on delete cascade,
  assigned_by uuid references auth.users(id), reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
  primary key(canonical_passage_id,theme_id)
);

create table public.commentary_sources (
  id uuid primary key default gen_random_uuid(), author text not null, work_title text not null,
  publication_year int, page_location text, source_reference text, license_basis text not null,
  created_at timestamptz not null default now()
);
create table public.commentary_entries (
  id uuid primary key default gen_random_uuid(), source_id uuid not null references public.commentary_sources(id),
  entry_type text not null check(entry_type in ('quotation','paraphrase','editorial_summary','historical_context')),
  body text not null, interpretation_category text, status public.content_status not null default 'draft',
  reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.commentary_passages (
  commentary_entry_id uuid not null references public.commentary_entries(id) on delete cascade,
  canonical_passage_id uuid not null references public.canonical_passages(id) on delete cascade,
  primary key(commentary_entry_id,canonical_passage_id)
);

create table public.study_guides (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text,
  owner_id uuid references auth.users(id) on delete set null, is_public boolean not null default false,
  status public.content_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.study_guide_items (
  id uuid primary key default gen_random_uuid(), guide_id uuid not null references public.study_guides(id) on delete cascade,
  canonical_passage_id uuid references public.canonical_passages(id), item_type text not null,
  prompt text, notes text, sort_order int not null, unique(guide_id,sort_order)
);
create table public.user_study_guides (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null, slug text not null, preferred_edition_id uuid references public.editions(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id,slug)
);
create table public.user_study_items (
  id uuid primary key default gen_random_uuid(), guide_id uuid not null references public.user_study_guides(id) on delete cascade,
  canonical_passage_id uuid references public.canonical_passages(id), notes text, personal_tags text[] not null default '{}',
  sort_order int not null, unique(guide_id,sort_order)
);
create table public.user_notes (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  canonical_passage_id uuid not null references public.canonical_passages(id) on delete cascade,
  body text not null, personal_tags text[] not null default '{}', study_question text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id,canonical_passage_id)
);
create table public.bookmarks (
  owner_id uuid not null references auth.users(id) on delete cascade,
  canonical_passage_id uuid not null references public.canonical_passages(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(owner_id,canonical_passage_id)
);

create table public.quote_templates (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  configuration jsonb not null, approved boolean not null default false, approved_by uuid references auth.users(id),
  approved_at timestamptz, created_at timestamptz not null default now()
);
create table public.quote_template_assets (
  id uuid primary key default gen_random_uuid(), template_id uuid not null references public.quote_templates(id) on delete cascade,
  title text not null, creator text, creation_date text, institution text, source_reference text,
  license text not null, attribution text not null, alt_text text not null, historical_context_note text,
  approval_status public.content_status not null default 'draft', storage_path text
);
create table public.saved_quote_cards (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  edition_passage_id uuid not null references public.edition_passages(id), template_id uuid references public.quote_templates(id),
  configuration jsonb not null, created_at timestamptz not null default now()
);

create table public.forum_categories (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text,
  sort_order int not null default 0, status public.content_status not null default 'published'
);
create table public.forum_threads (
  id uuid primary key default gen_random_uuid(), slug text unique not null, category_id uuid not null references public.forum_categories(id),
  canonical_passage_id uuid unique references public.canonical_passages(id) on delete cascade,
  canonical_slug text unique, title text not null, author_id uuid references auth.users(id) on delete set null,
  status public.thread_status not null default 'open', is_locked boolean not null default false,
  is_pinned boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_post_id uuid references public.forum_posts(id) on delete cascade,
  body_text text not null check(char_length(body_text) between 3 and 12000), status public.post_status not null default 'pending',
  edited_at timestamptz, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index forum_posts_thread_created_idx on public.forum_posts(thread_id,created_at);
create table public.forum_post_revisions (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.forum_posts(id) on delete cascade,
  body_text text not null, revised_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.forum_reports (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.forum_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null, details text, status text not null default 'new', created_at timestamptz not null default now(), unique(post_id,reporter_id)
);
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(), moderator_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id), post_id uuid references public.forum_posts(id), thread_id uuid references public.forum_threads(id),
  action text not null, reason text not null, appeal_status text, created_at timestamptz not null default now()
);
create table public.user_sanctions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  action text not null, reason text not null, starts_at timestamptz not null default now(), ends_at timestamptz,
  active boolean not null default true, issued_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);

create table public.correction_reports (
  id uuid primary key default gen_random_uuid(), submitted_by uuid references auth.users(id) on delete set null,
  category text not null, affected_source text not null, affected_passage text,
  description text not null, suggested_correction text, supporting_source text not null, contact_email text,
  status public.correction_status not null default 'new', reviewer_id uuid references auth.users(id), review_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.text_revisions (
  id uuid primary key default gen_random_uuid(), edition_passage_id uuid not null references public.edition_passages(id),
  correction_report_id uuid references public.correction_reports(id), previous_text_lines text[] not null,
  new_text_lines text[] not null, change_note text not null, changed_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.import_jobs (
  id uuid primary key default gen_random_uuid(), filename text not null, checksum text not null,
  status text not null default 'pending', validation_report jsonb not null default '{}'::jsonb,
  started_by uuid references auth.users(id), started_at timestamptz not null default now(), completed_at timestamptz,
  unique(filename,checksum)
);
create table public.import_errors (
  id uuid primary key default gen_random_uuid(), import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  severity text not null, record_reference text, message text not null, created_at timestamptz not null default now()
);
create table public.site_settings (
  key text primary key, value jsonb not null, description text, updated_by uuid references auth.users(id), updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id),
  action text not null, entity_type text not null, entity_id text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_has_role(required_role public.user_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=auth.uid() and role=required_role)
$$;
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path=public as $$
  select public.current_user_has_role('moderator') or public.current_user_has_role('admin')
$$;
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create or replace function public.create_profile_for_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1)));insert into public.user_roles(user_id,role) values(new.id,'reader') on conflict do nothing;return new;end $$;
create trigger auth_user_profile after insert on auth.users for each row execute procedure public.create_profile_for_new_user();
create or replace function public.delete_own_account() returns void language sql security definer set search_path=public as $$ delete from auth.users where id=auth.uid() $$;
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;


create or replace function public.project_commercial_mode()
returns boolean language sql stable security definer set search_path=public as $$
  select coalesce((select (value #>> '{}')::boolean from public.site_settings where key='project_commercial_mode'),false)
$$;

create or replace function public.source_allows_public_full_text(target_source uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1
    from public.source_records sr
    join public.license_records lr on lr.id=sr.license_id
    where sr.id=target_source
      and sr.enabled
      and lr.public_display_allowed
      and lr.full_text_display_allowed
      and case
        when public.project_commercial_mode() then lr.commercial_reuse_allowed
        else lr.noncommercial_reuse_allowed
      end
  )
$$;

revoke all on function public.project_commercial_mode() from public;
revoke all on function public.source_allows_public_full_text(uuid) from public;
grant execute on function public.project_commercial_mode() to anon,authenticated;
grant execute on function public.source_allows_public_full_text(uuid) to anon,authenticated;

create or replace function public.forum_post_status_for_current_user()
returns public.post_status language sql stable security definer set search_path=public,auth as $$
  select case
    when coalesce((select (value #>> '{}')::boolean from public.site_settings where key='first_post_requires_approval'),false)
      and not exists(select 1 from public.forum_posts where author_id=auth.uid() and status='published')
    then 'pending'::public.post_status
    else 'published'::public.post_status
  end
$$;

create or replace function public.can_post_to_thread(target_thread uuid)
returns boolean language sql stable security definer set search_path=public,auth as $$
  select auth.uid() is not null
    and exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null)
    and exists(select 1 from public.forum_threads t where t.id=target_thread and t.status='open' and not t.is_locked)
    and not exists(
      select 1 from public.user_sanctions s
      where s.user_id=auth.uid() and s.active
        and s.action in ('posting_restriction','suspension','ban')
        and s.starts_at<=now() and (s.ends_at is null or s.ends_at>now())
    )
    and (select count(*) from public.forum_posts p where p.author_id=auth.uid() and p.created_at>now()-interval '10 minutes')<5
$$;

create or replace function public.can_start_forum_thread()
returns boolean language sql stable security definer set search_path=public,auth as $$
  select auth.uid() is not null
    and exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null)
    and not exists(
      select 1 from public.user_sanctions s
      where s.user_id=auth.uid() and s.active
        and s.action in ('posting_restriction','suspension','ban')
        and s.starts_at<=now() and (s.ends_at is null or s.ends_at>now())
    )
    and (select count(*) from public.forum_threads t where t.author_id=auth.uid() and t.created_at>now()-interval '1 hour')<3
$$;

revoke all on function public.forum_post_status_for_current_user() from public;
revoke all on function public.can_post_to_thread(uuid) from public;
revoke all on function public.can_start_forum_thread() from public;
grant execute on function public.forum_post_status_for_current_user() to authenticated;
grant execute on function public.can_post_to_thread(uuid) to authenticated;
grant execute on function public.can_start_forum_thread() to authenticated;


create or replace function public.search_havamal(query_text text, max_results int default 50)
returns table(
  canonical_slug text,
  internal_reference text,
  edition_slug text,
  edition_title text,
  translator text,
  editor text,
  source_stanza_number text,
  section_heading text,
  text_lines text[],
  themes text[],
  match_rank real
)
language sql stable security invoker set search_path=public as $$
  with query_values as (
    select
      nullif(trim(query_text),'') as raw_query,
      websearch_to_tsquery('simple',nullif(trim(query_text),'')) as ts_query,
      lower(nullif(trim(query_text),'')) as normalized_query
  )
  select
    cp.slug,
    cp.internal_reference,
    e.slug,
    e.edition_title,
    e.translator,
    e.editor,
    ep.source_stanza_number,
    ep.section_heading,
    ep.text_lines,
    coalesce(array_agg(distinct th.slug) filter(where th.slug is not null),'{}'::text[]),
    greatest(
      ts_rank(to_tsvector('simple',ep.normalized_search_text),q.ts_query),
      similarity(ep.normalized_search_text,q.normalized_query),
      case when lower(ep.source_stanza_number)=q.normalized_query then 1 else 0 end,
      case when lower(coalesce(e.translator,e.editor,'')) like '%'||q.normalized_query||'%' then .8 else 0 end
    )::real as match_rank
  from query_values q
  join public.edition_passages ep on q.raw_query is not null
  join public.editions e on e.id=ep.edition_id
  join public.passage_alignments pa on pa.edition_passage_id=ep.id
  join public.canonical_passages cp on cp.id=pa.canonical_passage_id
  left join public.passage_themes pt on pt.canonical_passage_id=cp.id
  left join public.themes th on th.id=pt.theme_id and th.status='published'
  where ep.review_status='published'
    and e.status='published'
    and public.source_allows_public_full_text(e.source_record_id)
    and cp.status='published'
    and (
      to_tsvector('simple',ep.normalized_search_text) @@ q.ts_query
      or ep.normalized_search_text % q.normalized_query
      or lower(ep.source_stanza_number)=q.normalized_query
      or lower(coalesce(e.translator,e.editor,'')) like '%'||q.normalized_query||'%'
      or exists(
        select 1 from public.passage_themes pt2
        join public.themes th2 on th2.id=pt2.theme_id
        where pt2.canonical_passage_id=cp.id and th2.status='published'
          and (lower(th2.slug)=q.normalized_query or lower(th2.title) like '%'||q.normalized_query||'%')
      )
    )
  group by cp.slug,cp.internal_reference,e.slug,e.edition_title,e.translator,e.editor,
    ep.source_stanza_number,ep.section_heading,ep.text_lines,ep.normalized_search_text,q.ts_query,q.normalized_query,e.publication_year
  order by match_rank desc,cp.slug,e.publication_year
  limit least(greatest(max_results,1),100)
$$;

revoke all on function public.search_havamal(text,int) from public;
grant execute on function public.search_havamal(text,int) to anon,authenticated;

create or replace view public.public_forum_posts with (security_invoker=true) as
select p.id,p.body_text,p.created_at,p.parent_post_id,t.canonical_slug,t.slug as thread_slug,coalesce(pr.display_name,'Community member') as author_name
from public.forum_posts p join public.forum_threads t on t.id=p.thread_id left join public.profiles pr on pr.id=p.author_id
where p.status='published' and t.status in ('open','locked');

-- Update timestamps.
do $$ declare r record; begin for r in select unnest(array['profiles','works','license_records','source_records','editions','canonical_passages','edition_passages','themes','commentary_entries','study_guides','user_study_guides','user_notes','forum_threads','forum_posts','correction_reports']) as t loop execute format('create trigger %I_touch before update on public.%I for each row execute procedure public.touch_updated_at()',r.t,r.t); end loop; end $$;

-- Row-level security.
do $$ declare r text; begin foreach r in array array['profiles','user_roles','works','license_records','source_records','editions','canonical_passages','edition_passages','passage_alignments','passage_sections','themes','passage_themes','commentary_sources','commentary_entries','commentary_passages','study_guides','study_guide_items','user_study_guides','user_study_items','user_notes','bookmarks','quote_templates','quote_template_assets','saved_quote_cards','forum_categories','forum_threads','forum_posts','forum_post_revisions','forum_reports','moderation_actions','user_sanctions','correction_reports','text_revisions','import_jobs','import_errors','site_settings','audit_logs'] loop execute format('alter table public.%I enable row level security',r); end loop; end $$;

-- Public, published archive reads.
create policy works_public_read on public.works for select using(status='published' or public.is_staff());
create policy licenses_public_read on public.license_records for select using(true);
create policy sources_public_read on public.source_records for select using(public.source_allows_public_full_text(id) or public.is_staff());
create policy editions_public_read on public.editions for select using((status='published' and public.source_allows_public_full_text(source_record_id)) or public.is_staff());
create policy canonical_public_read on public.canonical_passages for select using(status='published' or public.is_staff());
create policy edition_passages_public_read on public.edition_passages for select using((review_status='published' and exists(select 1 from public.editions e where e.id=edition_id and e.status='published' and public.source_allows_public_full_text(e.source_record_id))) or public.is_staff());
create policy alignments_public_read on public.passage_alignments for select using(true);
create policy sections_public_read on public.passage_sections for select using(status='published' or public.is_staff());
create policy themes_public_read on public.themes for select using(status='published' or public.is_staff());
create policy passage_themes_public_read on public.passage_themes for select using(true);
create policy commentary_sources_public_read on public.commentary_sources for select using(true);
create policy commentary_public_read on public.commentary_entries for select using(status='published' or public.is_staff());
create policy commentary_passages_public_read on public.commentary_passages for select using(true);
create policy public_guides_read on public.study_guides for select using((is_public and status='published') or owner_id=auth.uid() or public.is_staff());
create policy public_guide_items_read on public.study_guide_items for select using(exists(select 1 from public.study_guides g where g.id=guide_id and ((g.is_public and g.status='published') or g.owner_id=auth.uid() or public.is_staff())));
create policy quote_templates_public_read on public.quote_templates for select using(approved or public.is_staff());
create policy quote_assets_public_read on public.quote_template_assets for select using(approval_status='published' or public.is_staff());
create policy forum_categories_public_read on public.forum_categories for select using(status='published' or public.is_staff());
create policy forum_threads_public_read on public.forum_threads for select using(status in ('open','locked') or public.is_staff());
create policy forum_posts_public_read on public.forum_posts for select using(status='published' or author_id=auth.uid() or public.is_staff());

-- Owner-only private study data.
create policy profiles_read on public.profiles for select using(true);
create policy profiles_update on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());
create policy roles_self_read on public.user_roles for select using(user_id=auth.uid() or public.is_staff());
create policy own_guides_all on public.user_study_guides for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy own_guide_items_all on public.user_study_items for all using(exists(select 1 from public.user_study_guides g where g.id=guide_id and g.owner_id=auth.uid())) with check(exists(select 1 from public.user_study_guides g where g.id=guide_id and g.owner_id=auth.uid()));
create policy own_notes_all on public.user_notes for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy own_bookmarks_all on public.bookmarks for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy own_saved_quotes_all on public.saved_quote_cards for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());

-- Community writes. API additionally enforces verified email, lock state, length, and sanitization.
create policy threads_insert_own on public.forum_threads for insert with check(author_id=auth.uid() and canonical_passage_id is null and public.can_start_forum_thread());
create policy threads_delete_own_empty on public.forum_threads for delete using(author_id=auth.uid() and canonical_passage_id is null and not exists(select 1 from public.forum_posts p where p.thread_id=forum_threads.id));
create policy posts_insert_own on public.forum_posts for insert with check(author_id=auth.uid() and public.can_post_to_thread(thread_id) and status=public.forum_post_status_for_current_user() and not exists(select 1 from public.forum_posts prior where prior.author_id=auth.uid() and prior.body_text=forum_posts.body_text and prior.created_at>now()-interval '10 minutes'));
create policy posts_update_own on public.forum_posts for update using(author_id=auth.uid() and created_at>now()-interval '30 minutes') with check(author_id=auth.uid());
create policy reports_insert_own on public.forum_reports for insert with check(reporter_id=auth.uid());
create policy reports_read_own on public.forum_reports for select using(reporter_id=auth.uid() or public.is_staff());
create policy corrections_insert_public on public.correction_reports for insert with check(submitted_by is null or submitted_by=auth.uid());
create policy corrections_read_own on public.correction_reports for select using(submitted_by=auth.uid() or public.is_staff());

-- Staff management policies.
do $$ declare r text; begin foreach r in array array['works','license_records','source_records','editions','canonical_passages','edition_passages','passage_alignments','passage_sections','themes','passage_themes','commentary_sources','commentary_entries','commentary_passages','study_guides','study_guide_items','quote_templates','quote_template_assets','forum_categories','forum_threads','forum_posts','forum_post_revisions','forum_reports','moderation_actions','user_sanctions','correction_reports','text_revisions','import_jobs','import_errors','site_settings'] loop execute format('create policy %I_staff_all on public.%I for all using(public.is_staff()) with check(public.is_staff())',r,r); end loop; end $$;
create policy roles_admin_all on public.user_roles for all using(public.current_user_has_role('admin')) with check(public.current_user_has_role('admin'));
create policy audit_staff_read on public.audit_logs for select using(public.is_staff());
create policy audit_staff_insert on public.audit_logs for insert with check(public.is_staff() and actor_id=auth.uid());

grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles,public.user_roles,public.works,public.license_records,public.source_records,public.editions,public.canonical_passages,public.edition_passages,public.passage_alignments,public.passage_sections,public.themes,public.passage_themes,public.commentary_sources,public.commentary_entries,public.commentary_passages,public.study_guides,public.study_guide_items,public.user_study_guides,public.user_study_items,public.user_notes,public.bookmarks,public.quote_templates,public.quote_template_assets,public.saved_quote_cards,public.forum_categories,public.forum_threads,public.forum_posts,public.forum_post_revisions,public.forum_reports,public.moderation_actions,public.user_sanctions,public.correction_reports,public.text_revisions,public.import_jobs,public.import_errors,public.site_settings,public.audit_logs to anon, authenticated;
grant insert on public.correction_reports to anon, authenticated;
grant insert,update,delete on public.profiles,public.user_study_guides,public.user_study_items,public.user_notes,public.bookmarks,public.saved_quote_cards,public.forum_threads,public.forum_posts,public.forum_reports to authenticated;
grant all privileges on public.profiles,public.user_roles,public.works,public.license_records,public.source_records,public.editions,public.canonical_passages,public.edition_passages,public.passage_alignments,public.passage_sections,public.themes,public.passage_themes,public.commentary_sources,public.commentary_entries,public.commentary_passages,public.study_guides,public.study_guide_items,public.user_study_guides,public.user_study_items,public.user_notes,public.bookmarks,public.quote_templates,public.quote_template_assets,public.saved_quote_cards,public.forum_categories,public.forum_threads,public.forum_posts,public.forum_post_revisions,public.forum_reports,public.moderation_actions,public.user_sanctions,public.correction_reports,public.text_revisions,public.import_jobs,public.import_errors,public.site_settings,public.audit_logs to service_role;

insert into public.site_settings(key,value,description) values
('project_commercial_mode','false'::jsonb,'When true, exclude sources without confirmed commercial reuse rights.'),
('first_post_requires_approval','false'::jsonb,'Optional first-post moderation switch.'),
('posting_rate_limit','{"posts":5,"minutes":10}'::jsonb,'Application-enforced posting limit.')
on conflict do nothing;
