# Information Architecture - Job Board MVP

_Dựa trên Database Schema và Complete Actions/Hooks Implementation_

## Tổng quan Hệ thống MVP

### Đối tượng người dùng

- **Ứng viên (Job Seekers)**: Tìm việc làm, tạo hồ sơ và ứng tuyển
- **Nhà tuyển dụng (Employers)**: Đăng tin tuyển dụng và quản lý ứng viên
- **Admin**: Quản lý danh mục, duyệt nội dung và quản trị hệ thống
- **Guest**: Xem việc làm và công ty không cần đăng ký

### Mục tiêu MVP

- Kết nối ứng viên với việc làm một cách hiệu quả
- Cho phép nhà tuyển dụng đăng tin và quản lý toàn bộ quy trình tuyển dụng
- Quản lý nội dung và danh mục một cách toàn diện
- Cung cấp analytics và báo cáo cơ bản

## Cấu trúc Navigation MVP

### 1. Guest Navigation (Public Pages)

```
🌐 Public Pages
├── 🏠 Trang chủ
│   ├── Hero section với search
│   ├── Việc làm nổi bật
│   ├── Công ty hàng đầu
│   └── Thống kê hệ thống
├── 🔍 Tìm việc làm
│   ├── Search bar với filters
│   ├── Lọc theo ngành nghề
│   ├── Lọc theo địa điểm (63 tỉnh/thành)
│   ├── Lọc theo mức lương
│   ├── Lọc theo loại hình (full-time, part-time, etc.)
│   └── Lọc theo cấp độ kinh nghiệm
├── 💼 Danh sách việc làm
│   ├── Việc làm mới nhất
│   ├── Việc làm hot
│   ├── Việc làm theo ngành
│   ├── Việc làm theo địa điểm
│   └── Pagination
├── 🏢 Danh sách công ty
│   ├── Công ty đã xác minh
│   ├── Công ty theo ngành nghề
│   ├── Công ty theo quy mô
│   └── Tìm kiếm công ty
├── 📂 Ngành nghề
│   ├── 15 ngành nghề chính
│   ├── Mô tả từng ngành
│   └── Việc làm theo ngành
├── 📍 Việc làm theo địa điểm
│   ├── 63 tỉnh/thành phố
│   └── Việc làm remote
├── 🔑 Đăng nhập
└── ✍️ Đăng ký
    ├── Đăng ký ứng viên
    └── Đăng ký nhà tuyển dụng
```

### 2. Job Seeker Navigation

```
👤 Job Seeker Dashboard
├── 🏠 Dashboard
│   ├── Thống kê cá nhân
│   ├── Việc làm đề xuất
│   ├── Trạng thái ứng tuyển
│   ├── Hoạt động gần đây
│   └── Thông báo mới
├── 🔍 Tìm kiếm Việc làm
│   ├── Tìm kiếm nâng cao
│   ├── Lưu tìm kiếm
│   ├── Tìm kiếm đã lưu
│   ├── Gợi ý tìm kiếm
│   └── Lịch sử tìm kiếm
├── 📄 Hồ sơ Cá nhân
│   ├── Thông tin cơ bản
│   │   ├── Họ tên, email, phone
│   │   ├── Avatar
│   │   └── Địa điểm ưa thích
│   ├── Hồ sơ nghề nghiệp
│   │   ├── Headline/Tiêu đề
│   │   ├── Tóm tắt bản thân
│   │   ├── Cấp độ kinh nghiệm
│   │   ├── Mức lương mong muốn
│   │   └── Trạng thái tìm việc
│   ├── Kỹ năng
│   │   ├── Danh sách kỹ năng
│   │   └── Thêm/xóa kỹ năng
│   ├── CV & Portfolio
│   │   ├── Upload CV (PDF, DOC)
│   │   ├── Portfolio URL
│   │   ├── LinkedIn profile
│   │   └── GitHub profile
│   └── Cài đặt riêng tư
├── 📝 Ứng tuyển
│   ├── Lịch sử ứng tuyển
│   │   ├── Tất cả đơn
│   │   ├── Lọc theo trạng thái
│   │   └── Timeline ứng tuyển
│   ├── Trạng thái đơn
│   │   ├── Đang chờ (pending)
│   │   ├── Đang xem xét (reviewing)
│   │   ├── Phỏng vấn (interviewing)
│   │   ├── Được nhận (accepted)
│   │   ├── Bị từ chối (rejected)
│   │   └── Đã rút đơn (withdrawn)
│   ├── Nộp đơn ứng tuyển
│   │   ├── Cover letter
│   │   ├── CV tùy chỉnh
│   │   └── Ghi chú thêm
│   └── Rút đơn ứng tuyển
├── 📊 Thống kê & Báo cáo
│   ├── Số lượt xem hồ sơ
│   ├── Tỷ lệ phản hồi
│   ├── Xu hướng ứng tuyển
│   └── Gợi ý cải thiện hồ sơ
└── ⚙️ Cài đặt
    ├── Thông tin tài khoản
    ├── Đổi mật khẩu
    ├── Cài đặt thông báo
    └── Xóa tài khoản
```

### 3. Employer Navigation

```
🏢 Employer Dashboard
├── 🏠 Tổng quan
│   ├── Thống kê tuyển dụng
│   │   ├── Số tin tuyển dụng active
│   │   ├── Tổng số ứng viên
│   │   ├── Số phỏng vấn trong tuần
│   │   └── Tỷ lệ chuyển đổi
│   ├── Ứng viên mới
│   │   ├── Ứng viên trong ngày
│   │   ├── Ứng viên chờ xem xét
│   │   └── Ứng viên tiềm năng
│   ├── Hoạt động gần đây
│   └── Thông báo quan trọng
├── 🏢 Quản lý Công ty
│   ├── Thông tin cơ bản
│   │   ├── Tên công ty
│   │   ├── Mô tả công ty
│   │   ├── Website
│   │   ├── Địa chỉ
│   │   └── Năm thành lập
│   ├── Thông tin bổ sung
│   │   ├── Ngành nghề
│   │   ├── Quy mô (startup -> enterprise)
│   │   ├── Số lượng nhân viên
│   │   └── Trạng thái xác minh
│   ├── Media & Brand
│   │   ├── Logo công ty
│   │   ├── Ảnh văn phòng
│   │   └── Video giới thiệu
│   └── Liên hệ & Mạng xã hội
├── 💼 Quản lý Tin tuyển dụng
│   ├── Tất cả tin tuyển dụng
│   │   ├── Draft (bản nháp)
│   │   ├── Pending approval (chờ duyệt)
│   │   ├── Published (đã đăng)
│   │   ├── Closed (đã đóng)
│   │   └── Archived (lưu trữ)
│   ├── Tạo tin mới
│   │   ├── Thông tin cơ bản
│   │   │   ├── Tiêu đề công việc
│   │   │   ├── Mô tả công việc
│   │   │   ├── Yêu cầu công việc
│   │   │   └── Quyền lợi
│   │   ├── Thông tin việc làm
│   │   │   ├── Loại hình (full-time, part-time, etc.)
│   │   │   ├── Cấp độ kinh nghiệm
│   │   │   ├── Ngành nghề
│   │   │   ├── Địa điểm làm việc
│   │   │   └── Remote option
│   │   ├── Lương & Phúc lợi
│   │   │   ├── Mức lương (min-max)
│   │   │   ├── Đơn vị tiền tệ
│   │   │   └── Phúc lợi khác
│   │   ├── Kỹ năng yêu cầu
│   │   └── Hạn ứng tuyển
│   ├── Chỉnh sửa tin
│   ├── Xóa tin
│   ├── Thống kê tin đăng
│   │   ├── Số lượt xem
│   │   ├── Số đơn ứng tuyển
│   │   ├── Tỷ lệ chuyển đổi
│   │   └── Performance metrics
│   └── Duplicate/Clone tin
├── 👥 Quản lý Ứng viên
│   ├── Tất cả ứng viên
│   │   ├── Lọc theo tin tuyển dụng
│   │   ├── Lọc theo trạng thái
│   │   ├── Lọc theo ngày ứng tuyển
│   │   └── Tìm kiếm ứng viên
│   ├── Xem hồ sơ chi tiết
│   │   ├── Thông tin cá nhân
│   │   ├── CV & Portfolio
│   │   ├── Lịch sử ứng tuyển
│   │   └── Cover letter
│   ├── Cập nhật trạng thái
│   │   ├── Chuyển sang reviewing
│   │   ├── Mời phỏng vấn
│   │   ├── Chấp nhận ứng viên
│   │   └── Từ chối ứng viên
│   ├── Ghi chú & Đánh giá
│   │   ├── Ghi chú nội bộ
│   │   ├── Rating ứng viên
│   │   └── Tag ứng viên
│   ├── Liên hệ ứng viên
│   │   ├── Gửi email
│   │   ├── Lên lịch phỏng vấn
│   │   └── Chia sẻ feedback
│   └── Export danh sách
├── 📊 Báo cáo & Thống kê
│   ├── Dashboard tuyển dụng
│   ├── Báo cáo ứng viên
│   ├── Performance công việc
│   ├── Xu hướng tuyển dụng
│   └── So sánh với ngành
└── ⚙️ Cài đặt
    ├── Thông tin tài khoản
    ├── Thông tin công ty
    ├── Cài đặt thông báo
    ├── Quản lý team
    └── Billing & Subscription
```

### 4. Admin Navigation

```
🛡️ Admin Dashboard
├── 🏠 Tổng quan Hệ thống
│   ├── Thống kê tổng quan
│   │   ├── Tổng số người dùng
│   │   ├── Tổng số công ty
│   │   ├── Tổng số việc làm
│   │   ├── Tổng số ứng tuyển
│   │   └── Hoạt động trong ngày
│   ├── Nội dung chờ duyệt
│   │   ├── Tin tuyển dụng chờ duyệt
│   │   ├── Công ty chờ xác minh
│   │   └── Báo cáo từ người dùng
│   ├── Hoạt động gần đây
│   │   ├── Đăng ký mới
│   │   ├── Tin đăng mới
│   │   └── Ứng tuyển mới
│   └── Cảnh báo hệ thống
├── 👥 Quản lý Người dùng
│   ├── Tất cả người dùng
│   │   ├── Lọc theo role
│   │   ├── Lọc theo trạng thái
│   │   ├── Tìm kiếm người dùng
│   │   └── Export danh sách
│   ├── Ứng viên (Job Seekers)
│   │   ├── Danh sách ứng viên
│   │   ├── Hồ sơ chi tiết
│   │   ├── Thống kê hoạt động
│   │   └── Hỗ trợ ứng viên
│   ├── Nhà tuyển dụng (Employers)
│   │   ├── Danh sách nhà tuyển dụng
│   │   ├── Thông tin công ty
│   │   ├── Hoạt động tuyển dụng
│   │   └── Xác minh công ty
│   ├── Quản lý vai trò
│   │   ├── Thay đổi role
│   │   ├── Cấp quyền admin
│   │   └── Phân quyền chi tiết
│   ├── Quản lý trạng thái
│   │   ├── Kích hoạt tài khoản
│   │   ├── Vô hiệu hóa tài khoản
│   │   └── Khóa tài khoản tạm thời
│   └── Thống kê người dùng
│       ├── Thống kê đăng ký
│       ├── Độ hoạt động
│       └── Retention rate
├── 💼 Quản lý Tin tuyển dụng
│   ├── Tất cả tin tuyển dụng
│   │   ├── Lọc theo trạng thái
│   │   ├── Lọc theo ngành nghề
│   │   ├── Lọc theo công ty
│   │   └── Tìm kiếm tin
│   ├── Tin chờ duyệt
│   │   ├── Danh sách pending
│   │   ├── Xem chi tiết tin
│   │   ├── Duyệt tin
│   │   └── Từ chối tin
│   ├── Tin đã duyệt
│   │   ├── Tin published
│   │   ├── Performance metrics
│   │   └── Feature tin nổi bật
│   ├── Tin bị từ chối
│   │   ├── Lý do từ chối
│   │   ├── Feedback cho employer
│   │   └── Re-review
│   ├── Quản lý chất lượng
│   │   ├── Kiểm tra duplicate
│   │   ├── Kiểm tra spam
│   │   ├── Validation rules
│   │   └── Auto-moderation
│   ├── Thao tác hàng loạt
│   │   ├── Bulk approve
│   │   ├── Bulk reject
│   │   ├── Bulk archive
│   │   └── Bulk update
│   └── Thống kê tin đăng
│       ├── Tỷ lệ duyệt
│       ├── Thời gian xử lý
│       └── Chất lượng tin
├── 🏢 Quản lý Công ty
│   ├── Tất cả công ty
│   │   ├── Công ty đã xác minh
│   │   ├── Công ty chờ xác minh
│   │   ├── Công ty bị từ chối
│   │   └── Tìm kiếm công ty
│   ├── Xác minh công ty
│   │   ├── Kiểm tra thông tin
│   │   ├── Xác minh website
│   │   ├── Xác minh địa chỉ
│   │   └── Approve/Reject
│   ├── Từ chối công ty
│   │   ├── Lý do từ chối
│   │   ├── Gửi feedback
│   │   └── Yêu cầu bổ sung
│   ├── Xóa công ty
│   │   ├── Soft delete
│   │   ├── Hard delete
│   │   └── Merge companies
│   └── Thống kê công ty
│       ├── Tỷ lệ xác minh
│       ├── Chất lượng công ty
│       └── Hoạt động tuyển dụng
├── 📂 Quản lý Danh mục
│   ├── Ngành nghề (Industries)
│   │   ├── 15 ngành nghề hiện tại
│   │   ├── Thêm ngành nghề mới
│   │   ├── Sửa thông tin ngành
│   │   ├── Xóa ngành nghề
│   │   ├── Sắp xếp thứ tự
│   │   └── Kích hoạt/Vô hiệu hóa
│   ├── Địa điểm (Locations)
│   │   ├── 63 tỉnh/thành phố
│   │   ├── Thêm địa điểm mới
│   │   ├── Sửa tên địa điểm
│   │   ├── Quản lý slug
│   │   └── Sắp xếp theo vùng
│   ├── Kỹ năng (Skills)
│   │   ├── Danh sách kỹ năng phổ biến
│   │   ├── Thêm kỹ năng mới
│   │   ├── Gộp kỹ năng trùng lặp
│   │   └── Phân loại kỹ năng
│   └── Tags & Labels
│       ├── Job tags
│       ├── Company tags
│       └── User tags
├── 📊 Báo cáo & Phân tích
│   ├── Dashboard analytics
│   │   ├── Real-time metrics
│   │   ├── KPI dashboard
│   │   └── Performance overview
│   ├── Báo cáo người dùng
│   │   ├── User growth
│   │   ├── User engagement
│   │   ├── Retention analysis
│   │   └── Demographics
│   ├── Báo cáo tuyển dụng
│   │   ├── Job posting trends
│   │   ├── Application success rates
│   │   ├── Time to hire
│   │   └── Industry insights
│   ├── Báo cáo tài chính
│   │   ├── Revenue tracking
│   │   ├── Subscription metrics
│   │   └── Cost analysis
│   ├── Báo cáo hệ thống
│   │   ├── Performance metrics
│   │   ├── Error logs
│   │   ├── Security logs
│   │   └── Usage statistics
│   └── Export & Scheduling
│       ├── Scheduled reports
│       ├── Custom exports
│       └── API access
├── 🔧 Quản lý Hệ thống
│   ├── Cài đặt chung
│   │   ├── Site settings
│   │   ├── Email templates
│   │   ├── Notification settings
│   │   └── Feature flags
│   ├── Quản lý nội dung
│   │   ├── CMS pages
│   │   ├── Blog posts
│   │   ├── Help documentation
│   │   └── Legal pages
│   ├── Quản lý file
│   │   ├── Storage overview
│   │   ├── File cleanup
│   │   ├── Backup management
│   │   └── CDN settings
│   ├── Security & Permissions
│   │   ├── Role management
│   │   ├── Permission matrix
│   │   ├── Access logs
│   │   └── Security policies
│   └── System health
│       ├── Performance monitoring
│       ├── Error tracking
│       ├── Uptime monitoring
│       └── Alerts & notifications
└── ⚙️ Cài đặt Admin
    ├── Profile admin
    ├── Admin preferences
    ├── Notification settings
    ├── Team management
    └── System logs
```

## User Flows MVP

### 1. Job Seeker Journey

#### A. Đăng ký và Thiết lập Hồ sơ

```
Landing Page → Chọn "Đăng ký ứng viên" →
Nhập email + password + họ tên →
Xác thực email →
Tạo hồ sơ cơ bản (headline, summary, experience level) →
Thêm thông tin liên hệ (phone, địa điểm ưa thích) →
Thêm kỹ năng →
Upload CV →
Hoàn thành setup → Dashboard
```

#### B. Tìm việc và Ứng tuyển

```
Dashboard → Tìm kiếm việc (keyword + filters) →
Xem danh sách kết quả → Lọc kết quả (ngành nghề, địa điểm, lương) →
Xem chi tiết công việc → Xem thông tin công ty →
Đọc yêu cầu & mô tả → Kiểm tra độ phù hợp →
Click "Ứng tuyển" → Viết cover letter →
Chọn CV (default hoặc upload mới) → Submit ứng tuyển →
Xác nhận thành công → Theo dõi trạng thái trong "Lịch sử ứng tuyển"
```

#### C. Quản lý Hồ sơ và Ứng tuyển

```
Dashboard → Xem thông báo mới →
Cập nhật trạng thái ứng tuyển →
Cải thiện hồ sơ dựa trên gợi ý →
Xem analytics (views, response rate) →
Adjust preferences → Save changes
```

### 2. Employer Journey

#### A. Thiết lập Công ty và Đăng tin

```
Đăng ký employer → Xác thực email →
Tạo thông tin công ty cơ bản (tên, mô tả, ngành nghề) →
Thêm địa chỉ + website → Upload logo →
Hoàn thành profile công ty → Chờ xác minh →
Tạo tin tuyển dụng đầu tiên →
Nhập chi tiết công việc (title, description, requirements) →
Thêm thông tin việc làm (type, level, location, salary) →
Review và submit → Chờ admin duyệt →
Nhận thông báo tin được duyệt → Tin xuất hiện trên site
```

#### B. Quản lý Ứng viên

```
Dashboard → Nhận thông báo ứng viên mới →
Xem danh sách ứng viên cho từng tin →
Filter ứng viên (skills, experience, location) →
Xem hồ sơ chi tiết ứng viên → Đọc CV + cover letter →
Đánh giá sơ bộ → Cập nhật trạng thái (reviewing) →
Thêm ghi chú nội bộ → Lên lịch phỏng vấn →
Cập nhật sau phỏng vấn → Quyết định cuối cùng (accept/reject) →
Gửi thông báo cho ứng viên
```

#### C. Tối ưu hóa Tuyển dụng

```
Dashboard → Xem analytics tin đăng →
Phân tích performance (views, applications, conversion) →
Tối ưu job description → Update requirements →
Adjust salary range → Extend deadline →
Clone successful job posts → A/B test different approaches
```

### 3. Admin Journey

#### A. Duyệt Nội dung

```
Admin Dashboard → Xem queue tin chờ duyệt →
Click vào tin để xem chi tiết →
Kiểm tra chất lượng nội dung → Validate thông tin công ty →
Check for spam/duplicate →
Decision: Approve hoặc Reject →
Nếu reject: Thêm feedback cho employer →
Nếu approve: Tin được publish →
Gửi notification → Update metrics
```

#### B. Quản lý Danh mục

```
Dashboard → Quản lý danh mục →
Xem danh sách ngành nghề hiện tại →
Phân tích usage statistics →
Thêm ngành nghề mới (nếu cần) →
Cập nhật mô tả cho ngành phổ biến →
Sắp xếp thứ tự hiển thị →
Test và deploy changes → Monitor impact
```

#### C. Quản lý Người dùng

```
Dashboard → User management →
View problematic accounts → Investigate issues →
Take action (warning, suspend, ban) →
Support good users → Analyze user patterns →
Generate user reports → Plan improvements
```

### 4. Guest Journey

#### A. Khám phá Platform

```
Landing page → Browse featured jobs →
Use search without signing up →
View job details → Check company profiles →
Explore by categories → View location-based jobs →
Get interested → Click "Apply" →
Prompted to register → Choose role → Sign up
```

## Page Structure & Components

### Core Pages (All Users)

#### **Homepage (`/`)**

- Hero section với search bar
- Featured jobs carousel
- Top companies grid
- Categories showcase
- Statistics counter
- CTA sections for different user types

#### **Job Listings (`/jobs`)**

- Advanced search & filters sidebar
- Job cards grid/list view
- Pagination/infinite scroll
- Sort options (date, relevance, salary)
- Save search functionality
- Quick apply buttons

#### **Job Details (`/jobs/[id]`)**

- Job information display
- Company information sidebar
- Apply button & requirements
- Similar jobs suggestions
- Social sharing
- Report job functionality

#### **Company Listings (`/companies`)**

- Company cards with key info
- Filter by industry, size, location
- Search companies
- Sort by verification status
- Company logos and basic stats

#### **Company Profile (`/companies/[id]`)**

- Company overview & description
- Current open positions
- Company culture & values
- Contact information
- Social media links
- Employee reviews (future)

#### **Authentication Pages**

- `/login` - Login form với social auth options
- `/register` - Role selection → specific signup forms
- `/forgot-password` - Password reset flow
- `/verify-email` - Email verification

### Job Seeker Pages

#### **Dashboard (`/dashboard`)**

- Personal statistics cards
- Recent applications status
- Job recommendations
- Profile completion progress
- Quick actions (update profile, search jobs)

#### **Profile Management (`/profile`)**

- Personal information form
- Professional summary editor
- Skills management (add/remove tags)
- CV upload & management
- Privacy settings
- Portfolio & social links

#### **Application History (`/applications`)**

- Applications table với filters
- Status timeline for each application
- Application details modal
- Withdraw application functionality
- Download applied job PDF

#### **Job Search (`/search`)**

- Advanced filters panel
- Saved searches management
- Search suggestions
- Results export
- Job alerts setup

### Employer Pages

#### **Dashboard (`/employer/dashboard`)**

- Recruitment metrics overview
- Recent applications notifications
- Active jobs performance
- Quick actions (post job, view applicants)
- Team activity feed

#### **Company Setup (`/employer/company`)**

- Company information form
- Logo upload với crop tool
- Industry & size selection
- Verification status
- Team member management

#### **Job Management (`/employer/jobs`)**

- Jobs table với filters & status
- Create/Edit job form với rich editor
- Job performance analytics
- Bulk actions (close, reopen, archive)
- Template management

#### **Applicant Management (`/employer/applicants`)**

- Applicants table với advanced filters
- Applicant profile modal với rating
- Status update workflow
- Notes & communication history
- Interview scheduling
- Bulk status updates

### Admin Pages

#### **Dashboard (`/admin/dashboard`)**

- System health overview
- Content moderation queue
- User activity metrics
- Revenue & usage statistics
- Quick admin actions

#### **User Management (`/admin/users`)**

- Users table với advanced search
- User profile details modal
- Role management interface
- Account status controls
- Bulk user operations
- User activity logs

#### **Content Moderation (`/admin/content`)**

- Jobs approval queue
- Company verification queue
- Reported content review
- Bulk moderation actions
- Content quality metrics
- Moderation history

#### **Category Management (`/admin/categories`)**

- Industries CRUD interface
- Locations management
- Skills taxonomy
- Category usage analytics
- Bulk import/export
- Category hierarchy

## Key Components Architecture

### Shared Components

#### **Navigation Components**

```
├── Header/Navigation
│   ├── Logo & Brand
│   ├── Main Navigation Menu
│   ├── Search Bar (Global)
│   ├── User Menu Dropdown
│   ├── Notifications Bell
│   └── Mobile Menu Toggle
├── Footer
│   ├── Links Grid
│   ├── Newsletter Signup
│   ├── Social Media Links
│   └── Legal Links
└── Breadcrumbs
    ├── Dynamic Path Display
    └── Schema.org Markup
```

#### **Search & Filter Components**

```
├── Search Bar
│   ├── Autocomplete Suggestions
│   ├── Recent Searches
│   ├── Popular Searches
│   └── Advanced Search Toggle
├── Filter Panel
│   ├── Industry Filter (Multi-select)
│   ├── Location Filter (Hierarchical)
│   ├── Salary Range Slider
│   ├── Experience Level Chips
│   ├── Employment Type Checkboxes
│   ├── Company Size Filter
│   └── Date Posted Filter
├── Sort Controls
│   ├── Relevance Sort
│   ├── Date Posted Sort
│   ├── Salary Sort
│   └── Company Rating Sort
└── Results Display Controls
    ├── Grid/List View Toggle
    ├── Results Per Page
    └── Saved Search Button
```

#### **Card Components**

```
├── Job Card
│   ├── Job Title & Company
│   ├── Location & Remote Badge
│   ├── Salary Range
│   ├── Employment Type Badge
│   ├── Posted Date
│   ├── Save Job Button
│   ├── Quick Apply Button
│   └── Company Logo
├── Company Card
│   ├── Company Name & Logo
│   ├── Industry & Size
│   ├── Location
│   ├── Open Positions Count
│   ├── Verification Badge
│   └── Follow Button
└── Application Card
    ├── Job Title & Company
    ├── Application Date
    ├── Status Badge
    ├── Last Updated
    ├── Progress Indicator
    └── Action Buttons
```

#### **Form Components**

```
├── Input Components
│   ├── Text Input với Validation
│   ├── Textarea với Character Count
│   ├── Select Dropdown với Search
│   ├── Multi-Select với Tags
│   ├── Date Picker
│   ├── Salary Range Input
│   └── Phone Number Input
├── File Upload Components
│   ├── CV Upload với Preview
│   ├── Image Upload với Crop
│   ├── Drag & Drop Zone
│   └── File Type Validation
├── Rich Text Editor
│   ├── Job Description Editor
│   ├── Company Description Editor
│   ├── Cover Letter Editor
│   └── Notes Editor
└── Form Utilities
    ├── Form Validation
    ├── Auto-save Functionality
    ├── Progress Indicator
    └── Form Reset
```

#### **Data Display Components**

```
├── Tables
│   ├── Sortable Headers
│   ├── Row Selection
│   ├── Inline Editing
│   ├── Pagination
│   ├── Column Visibility Controls
│   └── Export Functions
├── Lists
│   ├── Infinite Scroll Lists
│   ├── Virtual Scrolling
│   ├── Empty States
│   └── Loading Skeletons
├── Charts & Analytics
│   ├── Bar Charts (Applications over time)
│   ├── Pie Charts (Application status distribution)
│   ├── Line Charts (User growth)
│   ├── Metric Cards
│   └── Progress Bars
└── Status Indicators
    ├── Application Status Pipeline
    ├── Verification Badges
    ├── Activity Indicators
    └── Health Status
```

#### **UI/UX Components**

```
├── Loading States
│   ├── Skeleton Loaders
│   ├── Spinner Components
│   ├── Progress Bars
│   └── Shimmer Effects
├── Error States
│   ├── Error Boundaries
│   ├── 404 Pages
│   ├── Network Error Pages
│   └── Form Validation Errors
├── Empty States
│   ├── No Jobs Found
│   ├── No Applications
│   ├── Empty Profile
│   └── No Search Results
├── Modals & Overlays
│   ├── Confirmation Dialogs
│   ├── Detail View Modals
│   ├── Form Modals
│   ├── Image Lightbox
│   └── Toast Notifications
└── Interactive Elements
    ├── Tooltips
    ├── Popovers
    ├── Dropdown Menus
    ├── Tabs
    ├── Accordions
    └── Collapsible Sections
```

### Role-specific Components

#### **Job Seeker Components**

```
├── Profile Builder
│   ├── Step-by-Step Wizard
│   ├── Progress Indicator
│   ├── Profile Completeness Score
│   └── Suggestion Engine
├── CV Manager
│   ├── CV Upload Interface
│   ├── CV Preview Component
│   ├── Multiple CV Support
│   └── CV Builder Tool
├── Application Components
│   ├── Quick Apply Button
│   ├── Custom Application Form
│   ├── Cover Letter Template
│   ├── Application Status Tracker
│   └── Withdrawal Interface
├── Job Recommendations
│   ├── ML-based Suggestions
│   ├── Similar Jobs
│   ├── Job Alerts Setup
│   └── Preference Learning
└── Career Tools
    ├── Salary Calculator
    ├── Skill Assessment
    ├── Interview Prep
    └── Career Path Planner
```

#### **Employer Components**

```
├── Company Builder
│   ├── Company Setup Wizard
│   ├── Verification Process
│   ├── Brand Guidelines
│   └── Team Management
├── Job Builder
│   ├── Job Post Templates
│   ├── Rich Text Editor
│   ├── Preview Mode
│   ├── Duplicate Job Function
│   └── Draft Management
├── Applicant Management
│   ├── Applicant Pipeline View
│   ├── Candidate Comparison Tool
│   ├── Rating & Notes System
│   ├── Communication Hub
│   ├── Interview Scheduler
│   └── Hiring Workflow
├── Analytics Dashboard
│   ├── Job Performance Metrics
│   ├── Applicant Analytics
│   ├── Time-to-Hire Tracking
│   ├── Cost-per-Hire Calculator
│   └── ROI Reports
└── Recruitment Tools
    ├── Bulk Actions Interface
    ├── Email Templates
    ├── Candidate Database
    ├── Screening Questions
    └── Assessment Integration
```

#### **Admin Components**

```
├── Content Moderation
│   ├── Moderation Queue
│   ├── Content Review Interface
│   ├── Bulk Approval Actions
│   ├── Flagged Content Viewer
│   └── Moderation History
├── User Management
│   ├── User Search & Filter
│   ├── Account Actions Panel
│   ├── Role Assignment Interface
│   ├── Activity Monitoring
│   └── Support Ticket System
├── System Administration
│   ├── Settings Management
│   ├── Feature Flag Controls
│   ├── Email Template Editor
│   ├── Notification Settings
│   └── API Management
├── Analytics & Reporting
│   ├── Real-time Dashboard
│   ├── Custom Report Builder
│   ├── Data Export Tools
│   ├── Scheduled Reports
│   └── Performance Monitoring
└── Content Management
    ├── Category Manager
    ├── Location Manager
    ├── Skills Database
    ├── Template Library
    └── CMS Interface
```

## Technical Implementation Details

### Database Integration Mapping

#### **Table to Component Mapping**

```
Database Tables → UI Components
├── profiles → UserProfile, Dashboard, Settings
├── companies → CompanyCard, CompanyProfile, CompanyBuilder
├── jobs → JobCard, JobDetails, JobBuilder, JobList
├── job_seeker_profiles → CandidateProfile, ProfileBuilder
├── applications → ApplicationCard, ApplicationList, ApplicationTracker
├── application_status_history → StatusTimeline, ActivityFeed
├── industries → IndustryFilter, CategoryManager
├── locations → LocationFilter, LocationSelector
└── Storage Buckets → FileUploader, ImageManager, CVViewer
```

#### **RLS Policy Implementation**

```
Row Level Security → Component Access Control
├── Public Data (locations, industries) → No auth required
├── Profile Data → Own profile + role-based access
├── Company Data → Owner + admin access
├── Job Data → Public view, owner edit, admin moderate
├── Application Data → Applicant + job owner + admin
└── File Storage → Owner access + role-based viewing
```

### State Management Architecture

#### **Global State (React Query)**

```
Query Keys Structure:
├── auth: ['auth', 'profile'] | ['auth', 'user', userId]
├── jobs: ['jobs', filters] | ['jobs', 'detail', jobId]
├── companies: ['companies', filters] | ['companies', 'detail', companyId]
├── applications: ['applications', userId] | ['applications', 'job', jobId]
├── admin: ['admin', 'users'] | ['admin', 'jobs', 'pending']
└── dashboard: ['dashboard', role, userId]

Cache Strategies:
├── Static Data (5+ minutes): locations, industries
├── User Data (2-5 minutes): profiles, settings
├── Dynamic Data (30 seconds - 2 minutes): jobs, applications
└── Real-time Data (polling): notifications, dashboard stats
```

#### **Local Component State**

```
useState/useReducer for:
├── Form state (draft data, validation)
├── UI state (modals, filters, pagination)
├── Search state (query, filters, results)
├── Upload state (progress, errors, previews)
└── Temporary selections (bulk actions, multi-select)
```

### Performance Optimizations

#### **Loading Strategies**

```
├── SSR for SEO pages (homepage, job listings, company pages)
├── SSG for static content (categories, help pages)
├── Client-side rendering for dashboards
├── Incremental loading for large lists
├── Prefetching for likely next pages
└── Image optimization với next/image
```

#### **Caching Strategies**

```
├── Browser cache for static assets
├── Service worker for offline functionality
├── React Query cache for API data
├── Image CDN for user uploads
├── Database query optimization
└── Redis cache for expensive queries
```

## MVP Feature Mapping & Priorities

### Phase 1 - Foundation (Week 1-2)

**Core Infrastructure & Basic Auth**

```
✅ Essential Features (Must Have)
├── Authentication system (register, login, logout)
├── Basic profile management
├── Industry & location data seeding
├── Guest job browsing
├── Basic job listings với pagination
└── Company registration

📊 Success Metrics:
├── User registration completion rate > 80%
├── Profile setup completion > 60%
├── Page load times < 3 seconds
└── Zero critical bugs
```

### Phase 2 - Core Functionality (Week 3-4)

**Job Management & Applications**

```
✅ Essential Features (Must Have)
├── Job CRUD operations
├── Job seeker profile builder
├── Basic application system
├── Company profile management
├── File upload (CV, logos, avatars)
└── Admin job approval workflow

📊 Success Metrics:
├── Job posting success rate > 90%
├── Application submission success rate > 95%
├── CV upload success rate > 85%
└── Admin approval processing < 24 hours
```

### Phase 3 - User Experience (Week 5-6)

**Search, Filters & Management**

```
✅ Essential Features (Must Have)
├── Advanced job search & filters
├── Application status management
├── Employer applicant management
├── Admin user management
├── Dashboard analytics
└── Email notifications

📊 Success Metrics:
├── Search conversion rate > 15%
├── Filter usage > 40% of searches
├── Application status update rate > 80%
└── User engagement time > 5 minutes/session
```

### Phase 4 - Optimization (Week 7-8)

**Analytics & Polish**

```
🔧 Enhancement Features (Should Have)
├── Advanced analytics & reporting
├── Bulk operations
├── Export functionality
├── Enhanced search với suggestions
├── Performance optimizations
└── Mobile responsiveness improvements

📊 Success Metrics:
├── Mobile usage > 40%
├── Page load speed improvement > 50%
├── User retention rate > 70%
└── Platform stability > 99.5% uptime
```

### Future Enhancements (Post-MVP)

**Advanced Features**

```
🚀 Future Features (Could Have)
├── AI-powered job recommendations
├── Video interviews integration
├── Skills assessment tools
├── Company reviews & ratings
├── Salary benchmarking
├── Multi-language support
├── API for third-party integrations
├── Advanced reporting & BI tools
├── Mobile apps (iOS/Android)
└── Enterprise features
```

## Data Flow Architecture

### Authentication Flow

```
User Input → Validation → Supabase Auth →
Profile Creation (trigger) → Role-based Redirect →
Dashboard Setup → Success State
```

### Job Application Flow

```
Job Search → Job Selection → Application Form →
CV Selection/Upload → Cover Letter → Submit →
Employer Notification → Status Updates →
Final Decision → Notification to Candidate
```

### Content Moderation Flow

```
Job Submission → Auto-validation →
Admin Queue → Manual Review →
Approve/Reject Decision → Notification →
Content Publishing/Feedback → Analytics Update
```

### File Upload Flow

```
File Selection → Client Validation →
Progress Tracking → Supabase Storage →
RLS Policy Check → URL Generation →
Database Reference → Success Confirmation
```
