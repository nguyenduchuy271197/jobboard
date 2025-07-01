# 💼 Job Board - Nền Tảng Tuyển Dụng

Nền tảng tuyển dụng kết nối nhà tuyển dụng và ứng viên, xây dựng với Next.js 14, TypeScript và Supabase.

## ✨ Tính năng

- 🔐 **Authentication**: Đăng ký/đăng nhập, phân quyền Candidate/Employer/Admin
- 💼 **Job Management**: Đăng tin, quản lý việc làm và categories
- 📝 **Application Management**: Upload CV, theo dõi ứng tuyển
- 📊 **Dashboard**: Employer analytics, Candidate application tracking
- 📱 **Responsive**: Mobile-first design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase, PostgreSQL
- **State Management**: TanStack Query, React Hook Form
- **Validation**: Zod

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/nguyenduchuy271197/jobboard
cd jobboard
pnpm install
```

### 2. Environment Setup

Tạo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

```bash
npx supabase db reset
```

### 4. Run Development

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── actions/          # Server actions
├── app/             # Next.js App Router
│   ├── (auth)/      # Auth pages
│   ├── (candidate)/ # Candidate dashboard
│   ├── (employer)/  # Employer dashboard
│   ├── (admin)/     # Admin panel
│   └── (public)/    # Public job listings
├── components/      # UI components
├── hooks/           # Custom hooks
├── lib/             # Utilities & config
└── types/           # TypeScript types
```

## 🔧 Scripts

```bash
pnpm dev      # Development server
pnpm build    # Build production
pnpm lint     # Run linter
```

## 👥 User Roles

### 👨‍💼 Candidate

- Tìm kiếm và ứng tuyển việc làm
- Theo dõi trạng thái ứng tuyển
- Quản lý hồ sơ và CV

### 🏢 Employer

- Quản lý jobs & applications
- Quản lý company profile
- Xem analytics & reports

### 👨‍💻 Admin

- Quản lý users & job categories
- Duyệt tin tuyển dụng
- Xem system analytics

## 🚀 Deployment

Deploy dễ dàng với [Vercel](https://vercel.com):

1. Connect repository
2. Set environment variables
3. Deploy
