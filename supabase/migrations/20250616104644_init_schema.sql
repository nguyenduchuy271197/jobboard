-- ============================================================================
-- Migration Schema Ban Đầu cho MVP Job Board
-- Tạo ngày: 2025-06-16 10:46:44 UTC
-- Mục đích: Tạo schema cơ sở dữ liệu đầy đủ cho ứng dụng job board
-- Tính năng: Vai trò người dùng, Công ty, Việc làm, Đơn ứng tuyển, Danh mục, Storage
-- ============================================================================

-- =================================
-- ENUMS
-- =================================

-- Enum vai trò người dùng được lưu trong bảng profiles
create type public.user_role as enum ('job_seeker', 'employer', 'admin');

-- Enum trạng thái đơn ứng tuyển
create type public.application_status as enum (
  'pending',
  'reviewing', 
  'interviewing',
  'accepted',
  'rejected',
  'withdrawn'
);

-- Enum trạng thái việc làm
create type public.job_status as enum ('draft', 'pending_approval', 'published', 'closed', 'archived');

-- Enum loại hình công việc
create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'internship', 'freelance');

-- Enum cấp độ kinh nghiệm
create type public.experience_level as enum ('entry_level', 'mid_level', 'senior_level', 'executive');

-- Enum quy mô công ty
create type public.company_size as enum ('startup', 'small', 'medium', 'large', 'enterprise');

-- =================================
-- TABLES
-- =================================

-- Bảng địa điểm (tỉnh/thành phố)
create table public.locations (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.locations is 'Danh sách tỉnh/thành phố Việt Nam cho việc phân loại địa điểm công việc';

-- Bảng ngành nghề/danh mục cho phân loại việc làm
create table public.industries (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.industries is 'Danh mục ngành nghề cho phân loại và lọc việc làm';

-- Bảng hồ sơ người dùng mở rộng từ Supabase auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role user_role not null,
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Hồ sơ người dùng mở rộng từ Supabase auth với thông tin dựa trên vai trò';

-- Bảng công ty cho các tổ chức nhà tuyển dụng
create table public.companies (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  website_url text,
  logo_url text,
  industry_id bigint references public.industries (id),
  location_id bigint references public.locations (id),
  size company_size,
  address text,
  founded_year integer,
  employee_count integer,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint companies_founded_year_check check (founded_year >= 1800 and founded_year <= extract(year from now())),
  constraint companies_employee_count_check check (employee_count >= 0)
);

comment on table public.companies is 'Hồ sơ công ty cho nhà tuyển dụng đăng việc làm';

-- Bảng hồ sơ ứng viên với thông tin bổ sung
create table public.job_seeker_profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade unique,
  headline text,
  summary text,
  experience_level experience_level,
  preferred_salary_min integer,
  preferred_salary_max integer,
  preferred_location_id bigint references public.locations (id),
  skills text[], -- Mảng kỹ năng
  cv_file_path text, -- Đường dẫn CV được upload trong storage
  portfolio_url text,
  linkedin_url text,
  github_url text,
  is_looking_for_job boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint job_seeker_profiles_salary_check check (
    (preferred_salary_min is null and preferred_salary_max is null) or
    (preferred_salary_min <= preferred_salary_max)
  )
);

comment on table public.job_seeker_profiles is 'Hồ sơ mở rộng cho ứng viên với thông tin nghề nghiệp';

-- Bảng việc làm cho tin tuyển dụng
create table public.jobs (
  id bigint generated always as identity primary key,
  company_id bigint not null references public.companies (id) on delete cascade,
  posted_by uuid not null references public.profiles (id),
  title text not null,
  description text not null,
  requirements text,
  benefits text,
  employment_type employment_type not null,
  experience_level experience_level,
  industry_id bigint references public.industries (id),
  location_id bigint references public.locations (id),
  address text, -- Địa chỉ cụ thể
  is_remote boolean not null default false,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'VND',
  skills_required text[], -- Mảng kỹ năng yêu cầu
  status job_status not null default 'draft',
  application_deadline timestamptz,
  published_at timestamptz,
  views_count integer not null default 0,
  applications_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint jobs_salary_check check (
    (salary_min is null and salary_max is null) or
    (salary_min <= salary_max)
  ),
  constraint jobs_application_deadline_check check (
    application_deadline is null or application_deadline > created_at
  )
);

comment on table public.jobs is 'Tin tuyển dụng được tạo bởi nhà tuyển dụng';

-- Bảng đơn ứng tuyển việc làm
create table public.applications (
  id bigint generated always as identity primary key,
  job_id bigint not null references public.jobs (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  cover_letter text,
  custom_cv_path text, -- CV tùy chỉnh cho đơn ứng tuyển này
  status application_status not null default 'pending',
  applied_at timestamptz not null default now(),
  status_updated_at timestamptz not null default now(),
  status_updated_by uuid references public.profiles (id),
  notes text, -- Ghi chú nội bộ từ nhà tuyển dụng
  
  unique (job_id, applicant_id) -- Ngăn chặn ứng tuyển trùng lặp
);

comment on table public.applications is 'Đơn ứng tuyển được nộp bởi ứng viên';

-- Bảng lịch sử trạng thái đơn ứng tuyển để theo dõi thay đổi
create table public.application_status_history (
  id bigint generated always as identity primary key,
  application_id bigint not null references public.applications (id) on delete cascade,
  old_status application_status,
  new_status application_status not null,
  changed_by uuid not null references public.profiles (id),
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.application_status_history is 'Theo dõi thay đổi trạng thái cho đơn ứng tuyển';

-- =================================
-- STORAGE BUCKETS
-- =================================

-- Bucket cho CV files (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 52428800, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Bucket cho company logos (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-logos', 'company-logos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

-- Bucket cho avatars (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- =================================
-- INDEXES
-- =================================

create index idx_locations_slug on public.locations (slug);
create index idx_profiles_role on public.profiles (role);
create index idx_profiles_email on public.profiles (email);
create index idx_companies_owner_id on public.companies (owner_id);
create index idx_companies_industry_id on public.companies (industry_id);
create index idx_companies_location_id on public.companies (location_id);
create index idx_job_seeker_profiles_user_id on public.job_seeker_profiles (user_id);
create index idx_job_seeker_profiles_location_id on public.job_seeker_profiles (preferred_location_id);
create index idx_jobs_company_id on public.jobs (company_id);
create index idx_jobs_status on public.jobs (status);
create index idx_jobs_industry_id on public.jobs (industry_id);
create index idx_jobs_location_id on public.jobs (location_id);
create index idx_jobs_published_at on public.jobs (published_at desc) where status = 'published';
create index idx_applications_job_id on public.applications (job_id);
create index idx_applications_applicant_id on public.applications (applicant_id);
create index idx_applications_status on public.applications (status);
create index idx_application_status_history_application_id on public.application_status_history (application_id);

-- =================================
-- ROW LEVEL SECURITY
-- =================================

-- Bật RLS cho tất cả bảng
alter table public.locations enable row level security;
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.job_seeker_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.industries enable row level security;

-- Chính sách cho bảng locations
create policy "Locations có thể xem bởi mọi người"
  on public.locations
  for select
  to authenticated, anon
  using (true);

create policy "Admin có thể tạo locations"
  on public.locations
  for insert
  to authenticated
  with check (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

create policy "Admin có thể cập nhật locations"
  on public.locations
  for update
  to authenticated
  using (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  )
  with check (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

create policy "Admin có thể xóa locations"
  on public.locations
  for delete
  to authenticated
  using (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- Chính sách cho bảng profiles
create policy "Profiles có thể xem bởi mọi người"
  on public.profiles
  for select
  to authenticated, anon
  using (true);

create policy "Người dùng có thể tạo hồ sơ của mình"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Người dùng có thể cập nhật hồ sơ của mình"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Người dùng không thể xóa profiles"
  on public.profiles
  for delete
  to authenticated
  using (false);

-- Chính sách cho bảng companies
create policy "Companies có thể xem bởi mọi người"
  on public.companies
  for select
  to authenticated, anon
  using (true);

create policy "Nhà tuyển dụng có thể tạo companies"
  on public.companies
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id and
    (select role from public.profiles where id = (select auth.uid())) = 'employer'
  );

create policy "Chủ sở hữu công ty có thể cập nhật companies của mình"
  on public.companies
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Chủ sở hữu công ty có thể xóa companies của mình"
  on public.companies
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Chính sách cho bảng job seeker profiles
create policy "Hồ sơ ứng viên có thể xem bởi nhà tuyển dụng và admin"
  on public.job_seeker_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id or
    (select role from public.profiles where id = (select auth.uid())) in ('employer', 'admin')
  );

create policy "Ứng viên có thể tạo hồ sơ của mình"
  on public.job_seeker_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id and
    (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'
  );

create policy "Ứng viên có thể cập nhật hồ sơ của mình"
  on public.job_seeker_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Ứng viên có thể xóa hồ sơ của mình"
  on public.job_seeker_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Chính sách cho bảng jobs
create policy "Việc làm đã xuất bản có thể xem bởi mọi người"
  on public.jobs
  for select
  to authenticated, anon
  using (status = 'published' or (select auth.uid()) = posted_by);

create policy "Nhà tuyển dụng có thể tạo việc làm"
  on public.jobs
  for insert
  to authenticated
  with check (
    (select auth.uid()) = posted_by and
    (select role from public.profiles where id = (select auth.uid())) = 'employer' and
    exists (select 1 from public.companies where id = company_id and owner_id = (select auth.uid()))
  );

create policy "Người tạo việc làm có thể cập nhật việc làm của mình"
  on public.jobs
  for update
  to authenticated
  using ((select auth.uid()) = posted_by)
  with check ((select auth.uid()) = posted_by);

create policy "Người tạo việc làm có thể xóa việc làm của mình"
  on public.jobs
  for delete
  to authenticated
  using ((select auth.uid()) = posted_by);

-- Chính sách cho bảng applications
create policy "Đơn ứng tuyển có thể xem bởi ứng viên và nhà tuyển dụng"
  on public.applications
  for select
  to authenticated
  using (
    (select auth.uid()) = applicant_id or
    (select auth.uid()) in (
      select posted_by from public.jobs where id = job_id
    )
  );

create policy "Ứng viên có thể tạo đơn ứng tuyển"
  on public.applications
  for insert
  to authenticated
  with check (
    (select auth.uid()) = applicant_id and
    (select role from public.profiles where id = (select auth.uid())) = 'job_seeker'
  );

create policy "Ứng viên có thể cập nhật đơn ứng tuyển của mình"
  on public.applications
  for update
  to authenticated
  using ((select auth.uid()) = applicant_id)
  with check ((select auth.uid()) = applicant_id);

create policy "Ứng viên có thể xóa đơn ứng tuyển của mình"
  on public.applications
  for delete
  to authenticated
  using ((select auth.uid()) = applicant_id);

-- Chính sách cho bảng application status history
create policy "Lịch sử trạng thái có thể xem bởi các bên liên quan"
  on public.application_status_history
  for select
  to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = application_id and (
        (select auth.uid()) = a.applicant_id or
        (select auth.uid()) in (
          select posted_by from public.jobs where id = a.job_id
        )
      )
    )
  );

create policy "Người dùng được ủy quyền có thể tạo lịch sử trạng thái"
  on public.application_status_history
  for insert
  to authenticated
  with check (
    (select auth.uid()) = changed_by and
    exists (
      select 1 from public.applications a
      where a.id = application_id and (
        (select auth.uid()) = a.applicant_id or
        (select auth.uid()) in (
          select posted_by from public.jobs where id = a.job_id
        )
      )
    )
  );

create policy "Không được cập nhật lịch sử trạng thái"
  on public.application_status_history
  for update
  to authenticated
  using (false);

create policy "Không được xóa lịch sử trạng thái"
  on public.application_status_history
  for delete
  to authenticated
  using (false);

-- Chính sách cho bảng industries (đọc công khai, admin viết)
create policy "Industries có thể xem bởi mọi người"
  on public.industries
  for select
  to authenticated, anon
  using (true);

create policy "Admin có thể tạo industries"
  on public.industries
  for insert
  to authenticated
  with check (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

create policy "Admin có thể cập nhật industries"
  on public.industries
  for update
  to authenticated
  using (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  )
  with check (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

create policy "Admin có thể xóa industries"
  on public.industries
  for delete
  to authenticated
  using (
    (select role from public.profiles where id = (select auth.uid())) = 'admin'
  );

-- =================================
-- CHÍNH SÁCH STORAGE
-- =================================

-- Chính sách storage CV
create policy "Người dùng đã xác thực có thể upload CV"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'cvs' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Chủ sở hữu CV có thể xem CV của mình"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'cvs' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Chủ sở hữu CV có thể cập nhật CV của mình"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'cvs' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Chủ sở hữu CV có thể xóa CV của mình"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cvs' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- Chính sách storage logo công ty
create policy "Mọi người có thể xem logo công ty"
  on storage.objects
  for select
  to authenticated, anon
  using (bucket_id = 'company-logos');

create policy "Chủ sở hữu công ty có thể upload logo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'company-logos' and
    exists (
      select 1 from public.companies 
      where owner_id = (select auth.uid()) and id::text = (storage.foldername(name))[1]
    )
  );

create policy "Chủ sở hữu công ty có thể cập nhật logo của mình"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'company-logos' and
    exists (
      select 1 from public.companies 
      where owner_id = (select auth.uid()) and id::text = (storage.foldername(name))[1]
    )
  );

create policy "Chủ sở hữu công ty có thể xóa logo của mình"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'company-logos' and
    exists (
      select 1 from public.companies 
      where owner_id = (select auth.uid()) and id::text = (storage.foldername(name))[1]
    )
  );

-- Chính sách storage avatar
create policy "Mọi người có thể xem avatar"
  on storage.objects
  for select
  to authenticated, anon
  using (bucket_id = 'avatars');

create policy "Người dùng có thể upload avatar của mình"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Người dùng có thể cập nhật avatar của mình"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Người dùng có thể xóa avatar của mình"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- =================================
-- FUNCTIONS
-- =================================

-- Function tự động tạo profile khi người dùng đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role_value user_role;
begin
  -- Trích xuất role từ app_metadata hoặc mặc định là job_seeker
  user_role_value := coalesce(
    (new.raw_app_meta_data->>'role')::user_role,
    'job_seeker'::user_role
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    user_role_value
  );
  
  return new;
end;
$$;

-- Trigger tạo profile khi người dùng đăng ký
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function cập nhật số lượng đơn ứng tuyển khi có đơn mới
create or replace function public.increment_application_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.jobs
  set applications_count = applications_count + 1
  where id = new.job_id;
  
  return new;
end;
$$;

-- Function cập nhật số lượng đơn ứng tuyển khi đơn bị xóa
create or replace function public.decrement_application_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.jobs
  set applications_count = applications_count - 1
  where id = old.job_id;
  
  return old;
end;
$$;

-- Triggers cho số lượng đơn ứng tuyển
create trigger on_application_created
  after insert on public.applications
  for each row execute procedure public.increment_application_count();

create trigger on_application_deleted
  after delete on public.applications
  for each row execute procedure public.decrement_application_count();

-- Function theo dõi thay đổi trạng thái đơn ứng tuyển
create or replace function public.track_application_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Chỉ theo dõi nếu trạng thái thực sự thay đổi
  if old.status != new.status then
    insert into public.application_status_history (
      application_id,
      old_status,
      new_status,
      changed_by,
      notes
    ) values (
      new.id,
      old.status,
      new.status,
      coalesce(new.status_updated_by, (select auth.uid())),
      new.notes
    );
    
    -- Cập nhật status_updated_at
    new.status_updated_at = now();
  end if;
  
  return new;
end;
$$;

-- Trigger theo dõi trạng thái đơn ứng tuyển
create trigger on_application_status_changed
  before update on public.applications
  for each row execute procedure public.track_application_status_change();

-- =================================
-- DỮ LIỆU KHỞI TẠO
-- =================================

-- Chèn dữ liệu locations mặc định (Tỉnh/Thành phố Việt Nam)
insert into public.locations (name, slug) values
  ('Hà Nội', 'ha-noi'),
  ('TP. Hồ Chí Minh', 'tp-ho-chi-minh'),
  ('Đà Nẵng', 'da-nang'),
  ('Cần Thơ', 'can-tho'),
  ('Hải Phòng', 'hai-phong'),
  ('Huế', 'hue'),
  ('Nha Trang', 'nha-trang'),
  ('Vũng Tàu', 'vung-tau'),
  ('Đà Lạt', 'da-lat'),
  ('Quảng Ninh', 'quang-ninh'),
  ('Bình Dương', 'binh-duong'),
  ('Đồng Nai', 'dong-nai'),
  ('An Giang', 'an-giang'),
  ('Bà Rịa - Vũng Tàu', 'ba-ria-vung-tau'),
  ('Bắc Giang', 'bac-giang'),
  ('Bắc Kạn', 'bac-kan'),
  ('Bạc Liêu', 'bac-lieu'),
  ('Bắc Ninh', 'bac-ninh'),
  ('Bến Tre', 'ben-tre'),
  ('Bình Định', 'binh-dinh'),
  ('Bình Phước', 'binh-phuoc'),
  ('Bình Thuận', 'binh-thuan'),
  ('Cà Mau', 'ca-mau'),
  ('Cao Bằng', 'cao-bang'),
  ('Đắk Lắk', 'dak-lak'),
  ('Đắk Nông', 'dak-nong'),
  ('Điện Biên', 'dien-bien'),
  ('Gia Lai', 'gia-lai'),
  ('Hà Giang', 'ha-giang'),
  ('Hà Nam', 'ha-nam'),
  ('Hà Tĩnh', 'ha-tinh'),
  ('Hải Dương', 'hai-duong'),
  ('Hậu Giang', 'hau-giang'),
  ('Hòa Bình', 'hoa-binh'),
  ('Hưng Yên', 'hung-yen'),
  ('Khánh Hòa', 'khanh-hoa'),
  ('Kiên Giang', 'kien-giang'),
  ('Kon Tum', 'kon-tum'),
  ('Lai Châu', 'lai-chau'),
  ('Lâm Đồng', 'lam-dong'),
  ('Lạng Sơn', 'lang-son'),
  ('Lào Cai', 'lao-cai'),
  ('Long An', 'long-an'),
  ('Nam Định', 'nam-dinh'),
  ('Nghệ An', 'nghe-an'),
  ('Ninh Bình', 'ninh-binh'),
  ('Ninh Thuận', 'ninh-thuan'),
  ('Phú Thọ', 'phu-tho'),
  ('Phú Yên', 'phu-yen'),
  ('Quảng Bình', 'quang-binh'),
  ('Quảng Nam', 'quang-nam'),
  ('Quảng Ngãi', 'quang-ngai'),
  ('Quảng Trị', 'quang-tri'),
  ('Sóc Trăng', 'soc-trang'),
  ('Sơn La', 'son-la'),
  ('Tây Ninh', 'tay-ninh'),
  ('Thái Bình', 'thai-binh'),
  ('Thái Nguyên', 'thai-nguyen'),
  ('Thanh Hóa', 'thanh-hoa'),
  ('Thừa Thiên Huế', 'thua-thien-hue'),
  ('Tiền Giang', 'tien-giang'),
  ('Trà Vinh', 'tra-vinh'),
  ('Tuyên Quang', 'tuyen-quang'),
  ('Vĩnh Long', 'vinh-long'),
  ('Vĩnh Phúc', 'vinh-phuc'),
  ('Yên Bái', 'yen-bai');

-- Chèn dữ liệu ngành nghề mặc định
insert into public.industries (name, description, slug) values
  ('Công nghệ thông tin', 'Phát triển phần mềm, dịch vụ IT và các công ty công nghệ', 'cong-nghe-thong-tin'),
  ('Tài chính - Ngân hàng', 'Ngân hàng, bảo hiểm và dịch vụ tài chính', 'tai-chinh-ngan-hang'),
  ('Y tế - Chăm sóc sức khỏe', 'Dịch vụ y tế, dược phẩm và công nghệ sức khỏe', 'y-te-cham-soc-suc-khoe'),
  ('Giáo dục - Đào tạo', 'Trường học, đại học và công nghệ giáo dục', 'giao-duc-dao-tao'),
  ('Marketing - Quảng cáo', 'Marketing kỹ thuật số, quảng cáo và quan hệ công chúng', 'marketing-quang-cao'),
  ('Bán hàng - Kinh doanh', 'Phát triển kinh doanh, quản lý tài khoản và vận hành bán hàng', 'ban-hang-kinh-doanh'),
  ('Thiết kế - Sáng tạo', 'Thiết kế UI/UX, thiết kế đồ họa và dịch vụ sáng tạo', 'thiet-ke-sang-tao'),
  ('Kỹ thuật - Xây dựng', 'Cơ khí, dân dụng, điện và các lĩnh vực kỹ thuật khác', 'ky-thuat-xay-dung'),
  ('Nhân sự - Tuyển dụng', 'Thu hút nhân tài, quan hệ nhân viên và quản lý nhân sự', 'nhan-su-tuyen-dung'),
  ('Vận hành - Logistics', 'Vận hành kinh doanh, quản lý dự án và logistics', 'van-hanh-logistics'),
  ('Du lịch - Khách sạn', 'Dịch vụ du lịch, khách sạn và nhà hàng', 'du-lich-khach-san'),
  ('Sản xuất - Công nghiệp', 'Sản xuất, chế tạo và công nghiệp nặng', 'san-xuat-cong-nghiep'),
  ('Bán lẻ - Thương mại', 'Bán lẻ, thương mại điện tử và dịch vụ khách hàng', 'ban-le-thuong-mai'),
  ('Truyền thông - Media', 'Báo chí, truyền hình, radio và truyền thông số', 'truyen-thong-media'),
  ('Luật - Tư vấn', 'Dịch vụ pháp lý, tư vấn luật và tuân thủ', 'luat-tu-van');

