-- ============================================================================
-- Seed Data cho Job Board MVP
-- Tạo ngày: 2025-01-16
-- Mục đích: Tạo dữ liệu mẫu cho development và testing
-- ============================================================================

-- =================================
-- SEED DATA CHO AUTH USERS & PROFILES
-- =================================

-- Tạo users trong auth.users trước (profiles sẽ được tạo tự động qua trigger)
-- Note: Chỉ dùng cho development/testing, không dùng trong production
INSERT INTO auth.users (
  id, 
  instance_id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  invited_at, 
  confirmation_token, 
  confirmation_sent_at, 
  recovery_token, 
  recovery_sent_at, 
  email_change_token_new, 
  email_change, 
  email_change_sent_at, 
  last_sign_in_at, 
  raw_app_meta_data, 
  raw_user_meta_data, 
  is_super_admin, 
  created_at, 
  updated_at, 
  phone, 
  phone_confirmed_at, 
  phone_change, 
  phone_change_token, 
  phone_change_sent_at, 
  email_change_token_current, 
  email_change_confirm_status, 
  banned_until, 
  reauthentication_token, 
  reauthentication_sent_at
) VALUES 
  -- Admin user
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@jobboard.vn', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "admin"}', '{"full_name": "Quản trị viên"}', false, now(), now(), '+84901234567', now(), '', '', null, '', 0, null, '', null),
  
  -- Employers  
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr@fpt.vn', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "employer"}', '{"full_name": "Nguyễn Thị Hương"}', false, now(), now(), '+84987654321', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'talent@vng.com.vn', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "employer"}', '{"full_name": "Trần Văn Minh"}', false, now(), now(), '+84976543210', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'recruiter@tiki.vn', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "employer"}', '{"full_name": "Lê Thị Mai"}', false, now(), now(), '+84965432109', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr@techcombank.com.vn', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "employer"}', '{"full_name": "Phạm Đức Thành"}', false, now(), now(), '+84954321098', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jobs@vingroup.net', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "employer"}', '{"full_name": "Hoàng Thị Lan"}', false, now(), now(), '+84943210987', now(), '', '', null, '', 0, null, '', null),
  
  -- Job Seekers
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dev1@example.com', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "job_seeker"}', '{"full_name": "Nguyễn Văn Tú"}', false, now(), now(), '+84912345678', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'designer1@example.com', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "job_seeker"}', '{"full_name": "Trần Thị Linh"}', false, now(), now(), '+84923456789', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marketing1@example.com', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "job_seeker"}', '{"full_name": "Lê Văn Hùng"}', false, now(), now(), '+84934567890', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'finance1@example.com', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "job_seeker"}', '{"full_name": "Phạm Thị Hoa"}', false, now(), now(), '+84945678901', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sales1@example.com', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "job_seeker"}', '{"full_name": "Đỗ Văn Nam"}', false, now(), now(), '+84956789012', now(), '', '', null, '', 0, null, '', null),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'engineer1@example.com', crypt('password123', gen_salt('bf')), now(), null, '', null, '', null, '', '', null, now(), '{"role": "job_seeker"}', '{"full_name": "Vũ Thị Kim"}', false, now(), now(), '+84967890123', now(), '', '', null, '', 0, null, '', null);

-- Cập nhật thêm thông tin cho profiles (avatar_url và phone được set từ auth.users)
UPDATE public.profiles SET 
  avatar_url = CASE 
    WHEN email = 'admin@jobboard.vn' THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    WHEN email = 'hr@fpt.vn' THEN 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
    WHEN email = 'talent@vng.com.vn' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    WHEN email = 'recruiter@tiki.vn' THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    WHEN email = 'hr@techcombank.com.vn' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    WHEN email = 'jobs@vingroup.net' THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    WHEN email = 'dev1@example.com' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    WHEN email = 'designer1@example.com' THEN 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
    WHEN email = 'marketing1@example.com' THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    WHEN email = 'finance1@example.com' THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    WHEN email = 'sales1@example.com' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    WHEN email = 'engineer1@example.com' THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  END,
  phone = CASE 
    WHEN email = 'admin@jobboard.vn' THEN '+84901234567'
    WHEN email = 'hr@fpt.vn' THEN '+84987654321'
    WHEN email = 'talent@vng.com.vn' THEN '+84976543210'
    WHEN email = 'recruiter@tiki.vn' THEN '+84965432109'
    WHEN email = 'hr@techcombank.com.vn' THEN '+84954321098'
    WHEN email = 'jobs@vingroup.net' THEN '+84943210987'
    WHEN email = 'dev1@example.com' THEN '+84912345678'
    WHEN email = 'designer1@example.com' THEN '+84923456789'
    WHEN email = 'marketing1@example.com' THEN '+84934567890'
    WHEN email = 'finance1@example.com' THEN '+84945678901'
    WHEN email = 'sales1@example.com' THEN '+84956789012'
         WHEN email = 'engineer1@example.com' THEN '+84967890123'
   END;

-- =================================
-- SEED DATA CHO COMPANIES
-- =================================

INSERT INTO public.companies (owner_id, name, description, website_url, logo_url, industry_id, location_id, size, address, founded_year, employee_count, is_verified) VALUES
  ('00000000-0000-0000-0000-000000000010', 'FPT Corporation', 'Tập đoàn FPT là một trong những công ty công nghệ thông tin hàng đầu Việt Nam, chuyên về phát triển phần mềm, dịch vụ CNTT và giáo dục.', 'https://fpt.com.vn', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', 1, 1, 'enterprise', 'Tòa nhà FPT, 17 Duy Tân, Cầu Giấy, Hà Nội', 1988, 48000, true),
  
  ('00000000-0000-0000-0000-000000000011', 'VNG Corporation', 'VNG là công ty internet và công nghệ hàng đầu Việt Nam, được biết đến với các sản phẩm như Zalo, ZaloPay, và nhiều game online.', 'https://vng.com.vn', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400', 1, 2, 'large', '182 Lê Đại Hành, Quận 11, TP. Hồ Chí Minh', 2004, 3000, true),
  
  ('00000000-0000-0000-0000-000000000012', 'Tiki', 'Tiki là một trong những sàn thương mại điện tử hàng đầu Việt Nam, cung cấp dịch vụ mua sắm online với hàng triệu sản phẩm.', 'https://tiki.vn', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 13, 2, 'large', '52 Út Tịch, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh', 2010, 2500, true),
  
  ('00000000-0000-0000-0000-000000000013', 'Techcombank', 'Ngân hàng Thương mại Cổ phần Kỹ thương Việt Nam (Techcombank) là một trong những ngân hàng thương mại tư nhân hàng đầu Việt Nam.', 'https://techcombank.com.vn', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', 2, 1, 'large', '191 Bà Triệu, Hai Bà Trưng, Hà Nội', 1993, 15000, true),
  
  ('00000000-0000-0000-0000-000000000014', 'Vingroup', 'Vingroup là tập đoàn kinh tế tư nhân đa ngành lớn nhất Việt Nam, hoạt động trong các lĩnh vực bất động sản, bán lẻ, công nghiệp, nông nghiệp và dịch vụ.', 'https://vingroup.net', 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400', 12, 1, 'enterprise', 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh', 1993, 70000, true);

-- =================================
-- SEED DATA CHO JOB SEEKER PROFILES
-- =================================

INSERT INTO public.job_seeker_profiles (user_id, headline, summary, experience_level, preferred_salary_min, preferred_salary_max, preferred_location_id, skills, portfolio_url, linkedin_url, github_url, is_looking_for_job) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Full-stack Developer với 3 năm kinh nghiệm', 'Tôi là một lập trình viên full-stack với 3 năm kinh nghiệm phát triển web application sử dụng React, Node.js và PostgreSQL. Đam mê tìm hiểu công nghệ mới và xây dựng sản phẩm có tác động tích cực.', 'mid_level', 20000000, 35000000, 1, ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'], 'https://portfolio-tu.vercel.app', 'https://linkedin.com/in/nguyen-van-tu', 'https://github.com/nguyenvantu', true),
  
  ('00000000-0000-0000-0000-000000000021', 'UI/UX Designer với kinh nghiệm thiết kế app mobile', 'Tôi có 2 năm kinh nghiệm thiết kế giao diện người dùng cho web và mobile app. Thành thạo Figma, Adobe Creative Suite và có hiểu biết về front-end development.', 'entry_level', 15000000, 25000000, 2, ARRAY['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Prototyping', 'User Research'], 'https://behance.net/tranthilinh', 'https://linkedin.com/in/tran-thi-linh', NULL, true),
  
  ('00000000-0000-0000-0000-000000000022', 'Digital Marketing Specialist', 'Chuyên gia marketing số với 4 năm kinh nghiệm trong SEO, SEM, Social Media Marketing và Content Marketing. Đã giúp nhiều doanh nghiệp tăng trưởng doanh thu qua các kênh digital.', 'mid_level', 18000000, 30000000, 1, ARRAY['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Analytics', 'Email Marketing'], NULL, 'https://linkedin.com/in/le-van-hung', NULL, true),
  
  ('00000000-0000-0000-0000-000000000023', 'Financial Analyst', 'Phân tích tài chính với 3 năm kinh nghiệm trong lĩnh vực ngân hàng và đầu tư. Thành thạo Excel, PowerBI và có chứng chỉ CFA Level 1.', 'mid_level', 20000000, 35000000, 1, ARRAY['Excel', 'PowerBI', 'Financial Modeling', 'Risk Analysis', 'Investment Analysis', 'SQL'], NULL, 'https://linkedin.com/in/pham-thi-hoa', NULL, true),
  
  ('00000000-0000-0000-0000-000000000024', 'Sales Executive trong lĩnh vực công nghệ', 'Sales Executive với 5 năm kinh nghiệm bán hàng trong lĩnh vực công nghệ B2B. Có track record mạnh về việc đạt và vượt target bán hàng.', 'senior_level', 25000000, 45000000, 2, ARRAY['B2B Sales', 'CRM', 'Negotiation', 'Account Management', 'Lead Generation', 'Presentation'], NULL, 'https://linkedin.com/in/do-van-nam', NULL, true),
  
  ('00000000-0000-0000-0000-000000000025', 'DevOps Engineer', 'DevOps Engineer với 4 năm kinh nghiệm trong việc xây dựng và duy trì hệ thống CI/CD, quản lý infrastructure trên cloud AWS và Azure.', 'mid_level', 25000000, 40000000, 1, ARRAY['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python', 'Bash'], NULL, 'https://linkedin.com/in/vu-thi-kim', 'https://github.com/vuthikim', true);

-- =================================
-- SEED DATA CHO JOBS
-- =================================

INSERT INTO public.jobs (company_id, posted_by, title, description, requirements, benefits, employment_type, experience_level, industry_id, location_id, address, is_remote, salary_min, salary_max, salary_currency, skills_required, status, application_deadline, published_at, views_count) VALUES
  (1, '00000000-0000-0000-0000-000000000010', 'Senior Frontend Developer', 
   'Chúng tôi đang tìm kiếm một Senior Frontend Developer tài năng để tham gia vào đội ngũ phát triển sản phẩm của FPT. Bạn sẽ chịu trách nhiệm phát triển các ứng dụng web hiện đại với React và TypeScript.',
   'Tối thiểu 4 năm kinh nghiệm với React; Thành thạo TypeScript, HTML5, CSS3; Kinh nghiệm với state management (Redux, Zustand); Hiểu biết về responsive design và cross-browser compatibility; Kinh nghiệm làm việc với REST APIs và GraphQL',
   'Lương cạnh tranh + thưởng hiệu suất; Bảo hiểm sức khỏe toàn diện; 14 ngày phép năm; Cơ hội đào tạo và phát triển nghề nghiệp; Môi trường làm việc năng động',
   'full_time', 'senior_level', 1, 1, 'Tòa nhà FPT, 17 Duy Tân, Cầu Giấy, Hà Nội', false, 30000000, 50000000, 'VND', 
   ARRAY['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Redux'], 'published', now() + interval '30 days', now() - interval '2 days', 156),

  (2, '00000000-0000-0000-0000-000000000011', 'Mobile App Developer (React Native)',
   'VNG đang tìm kiếm Mobile App Developer để phát triển các ứng dụng di động cho hệ sinh thái Zalo. Bạn sẽ làm việc với team quốc tế trong môi trường startup năng động.',
   'Tối thiểu 2 năm kinh nghiệm React Native; Kinh nghiệm với iOS và Android development; Thành thạo JavaScript/TypeScript; Hiểu biết về mobile UI/UX principles; Kinh nghiệm với native modules',
   'Lương từ 25-45 triệu + equity; Bảo hiểm sức khỏe premium; Flexible working hours; Budget học tập 20 triệu/năm; Team building quý',
   'full_time', 'mid_level', 1, 2, '182 Lê Đại Hành, Quận 11, TP. Hồ Chí Minh', true, 25000000, 45000000, 'VND',
   ARRAY['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Mobile Development'], 'published', now() + interval '25 days', now() - interval '1 day', 89),

  (3, '00000000-0000-0000-0000-000000000012', 'Product Manager',
   'Tiki đang tìm kiếm Product Manager để quản lý và phát triển các tính năng mới cho platform e-commerce. Bạn sẽ làm việc chặt chẽ với engineering, design và business teams.',
   'Tối thiểu 3 năm kinh nghiệm Product Management; Kinh nghiệm trong e-commerce hoặc tech startup; Kỹ năng phân tích dữ liệu mạnh; Kinh nghiệm với agile methodology; Tư duy chiến lược và execution',
   'Package cạnh tranh 30-55 triệu; Stock options; Bảo hiểm cao cấp; Cơ hội làm việc với millions of users; Career development path rõ ràng',
   'full_time', 'mid_level', 1, 2, '52 Út Tịch, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh', false, 30000000, 55000000, 'VND',
   ARRAY['Product Management', 'Data Analysis', 'Agile', 'SQL', 'Strategy', 'User Research'], 'published', now() + interval '20 days', now() - interval '3 days', 203),

  (4, '00000000-0000-0000-0000-000000000013', 'Risk Analyst',
   'Techcombank cần Risk Analyst để phân tích và đánh giá rủi ro tín dụng, hỗ trợ việc ra quyết định cho các khoản vay doanh nghiệp và cá nhân.',
   'Bằng đại học Finance/Economics/Math; Tối thiểu 2 năm kinh nghiệm risk analysis; Thành thạo Excel, SQL, Python; Hiểu biết về banking regulations; Kỹ năng thuyết trình tốt',
   'Lương 20-35 triệu + KPI bonus; Bảo hiểm toàn diện; 16 ngày phép/năm; Training chuyên sâu về banking; Cơ hội thăng tiến nhanh',
   'full_time', 'entry_level', 2, 1, '191 Bà Triệu, Hai Bà Trưng, Hà Nội', false, 20000000, 35000000, 'VND',
   ARRAY['Risk Analysis', 'Excel', 'SQL', 'Python', 'Financial Modeling', 'Banking'], 'published', now() + interval '15 days', now() - interval '5 days', 67),

  (5, '00000000-0000-0000-0000-000000000014', 'Marketing Manager',
   'Vingroup tuyển Marketing Manager để phát triển chiến lược marketing cho các thương hiệu retail. Đây là cơ hội tuyệt vời để làm việc với largest conglomerate ở Việt Nam.',
   'Tối thiểu 4 năm kinh nghiệm marketing; Kinh nghiệm trong retail/FMCG; Kỹ năng digital marketing mạnh; Leadership và team management; Strategic thinking và creativity',
   'Lương cạnh tranh 35-60 triệu; Bonus theo performance; Bảo hiểm VIP; Company car; Cơ hội làm việc với top brands',
   'full_time', 'senior_level', 5, 1, 'Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh', false, 35000000, 60000000, 'VND',
   ARRAY['Marketing Strategy', 'Digital Marketing', 'Brand Management', 'Team Leadership', 'Campaign Management'], 'published', now() + interval '18 days', now() - interval '4 days', 124),

  (1, '00000000-0000-0000-0000-000000000010', 'DevOps Engineer',
   'FPT Software đang mở rộng đội ngũ DevOps để hỗ trợ các dự án outsourcing quốc tế. Bạn sẽ làm việc với cutting-edge technologies và cloud platforms.',
   'Tối thiểu 3 năm kinh nghiệm DevOps; Thành thạo AWS/Azure; Kinh nghiệm với Docker, Kubernetes; CI/CD pipeline; Infrastructure as Code; Linux system administration',
   'Lương 25-45 triệu; Allowance dự án nước ngoài; Training certification AWS/Azure; Remote working options; International exposure',
   'full_time', 'mid_level', 1, 1, 'FPT Software, Keangnam Landmark Tower, Hà Nội', true, 25000000, 45000000, 'VND',
   ARRAY['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'], 'published', now() + interval '22 days', now() - interval '1 day', 78),

  (2, '00000000-0000-0000-0000-000000000011', 'Data Scientist',
   'VNG cần Data Scientist để phân tích behavior của users trên Zalo platform và phát triển recommendation systems. Tham gia vào việc xây dựng AI-powered features.',
   'MS/PhD in Computer Science/Statistics; 3+ năm kinh nghiệm data science; Thành thạo Python, R, SQL; Kinh nghiệm ML/AI; Big data technologies; Problem-solving skills',
   'Lương top market 40-70 triệu; Research budget; Conference participation; Publishing opportunities; Stock options',
   'full_time', 'senior_level', 1, 2, 'VNG Campus, Quận 7, TP. Hồ Chí Minh', false, 40000000, 70000000, 'VND',
   ARRAY['Python', 'Machine Learning', 'SQL', 'Statistics', 'Big Data', 'AI', 'R'], 'published', now() + interval '28 days', now() - interval '6 days', 145);

-- =================================
-- SEED DATA CHO APPLICATIONS
-- =================================

INSERT INTO public.applications (job_id, applicant_id, cover_letter, status, applied_at, status_updated_by) VALUES
  (1, '00000000-0000-0000-0000-000000000020', 
   'Kính chào Anh/Chị,

Tôi rất hứng thú với vị trí Senior Frontend Developer tại FPT Corporation. Với 3 năm kinh nghiệm phát triển web application sử dụng React và TypeScript, tôi tin rằng mình có thể đóng góp tích cực cho team.

Trong quá trình làm việc tại các startup, tôi đã:
- Phát triển và maintain 5+ web applications với React
- Implement responsive design cho mobile và desktop
- Optimize performance và SEO cho web apps
- Collaborate với team design và backend để deliver high-quality products

Tôi rất mong có cơ hội được thảo luận thêm về vị trí này.

Trân trọng,
Nguyễn Văn Tú', 
   'reviewing', now() - interval '2 days', '00000000-0000-0000-0000-000000000010'),

  (2, '00000000-0000-0000-0000-000000000020', 
   'Dear VNG Team,

I am excited to apply for the Mobile App Developer position. My experience with React Native and passion for mobile development make me a strong candidate for this role.

Key highlights:
- 2+ years developing cross-platform mobile apps
- Published 3 apps on both iOS and Android stores
- Experience with native modules and performance optimization
- Strong collaboration skills working with international teams

I would love to contribute to Zalo''s continued success and innovation.

Best regards,
Nguyễn Văn Tú',
   'pending', now() - interval '1 day', NULL),

  (3, '00000000-0000-0000-0000-000000000022',
   'Chào team Tiki,

Tôi quan tâm đến vị trí Product Manager và muốn chia sẻ passion của mình về e-commerce và product development.

Trong 4 năm làm digital marketing, tôi đã:
- Phân tích user behavior và conversion funnel
- Collaborate với product team để optimize user experience
- Manage campaigns với budgets lên đến 2 tỷ VND
- A/B testing và data-driven decision making

Tôi tin rằng background marketing sẽ help mình understand user needs better và build products that users truly love.

Looking forward to hearing from you!
Lê Văn Hùng',
   'interviewing', now() - interval '5 days', '00000000-0000-0000-0000-000000000012'),

  (4, '00000000-0000-0000-0000-000000000023',
   'Kính chào Techcombank,

Với background về financial analysis và đam mê về risk management, tôi rất interested trong vị trí Risk Analyst.

Achievements relevant:
- 3 năm experience analyzing investment portfolios
- Proficient in Excel financial modeling và SQL
- CFA Level 1 certification
- Experience với regulatory compliance

Tôi eager để apply analytical skills trong banking environment và contribute to Techcombank''s risk management excellence.

Best regards,
Phạm Thị Hoa',
   'accepted', now() - interval '10 days', '00000000-0000-0000-0000-000000000013'),

  (6, '00000000-0000-0000-0000-000000000025',
   'Dear FPT Software Team,

I am writing to express my strong interest in the DevOps Engineer position. My 4 years of experience building and maintaining cloud infrastructure aligns perfectly with your requirements.

Technical expertise:
- AWS certified Solutions Architect
- Extensive experience with Docker và Kubernetes
- Built CI/CD pipelines serving 100+ developers
- Infrastructure as Code using Terraform
- 24/7 production system monitoring experience

I am excited about the opportunity to work on international projects và contribute to FPT''s global success.

Thank you for your consideration.
Vũ Thị Kim',
   'pending', now() - interval '3 hours', NULL);

-- =================================
-- CẬP NHẬT COUNTS
-- =================================

-- Cập nhật application counts cho jobs
UPDATE public.jobs 
SET applications_count = (
  SELECT COUNT(*) 
  FROM public.applications 
  WHERE applications.job_id = jobs.id
);

-- Cập nhật timestamps
UPDATE public.profiles SET updated_at = now();
UPDATE public.companies SET updated_at = now();
UPDATE public.job_seeker_profiles SET updated_at = now();
UPDATE public.jobs SET updated_at = now();

-- =================================
-- VERIFICATION QUERIES (COMMENT OUT TRONG PRODUCTION)
-- =================================

-- Uncomment để test data
/*
SELECT 'Profiles count:' as info, count(*) as count FROM public.profiles
UNION ALL
SELECT 'Companies count:', count(*) FROM public.companies  
UNION ALL
SELECT 'Job seeker profiles count:', count(*) FROM public.job_seeker_profiles
UNION ALL
SELECT 'Jobs count:', count(*) FROM public.jobs
UNION ALL
SELECT 'Applications count:', count(*) FROM public.applications
UNION ALL
SELECT 'Published jobs:', count(*) FROM public.jobs WHERE status = 'published';
*/
