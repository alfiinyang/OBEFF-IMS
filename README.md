# OBEFF IMS (Information Management System)

> A private, secure web platform combining an official family contact directory, an interactive visual lineage tree, prioritized administrator announcements, and an automated notification engine.

---

## 🌟 Key Features

* **Production Member Identity & RBAC Privacy:**
  * Member sign-up with sequential **Unique Family ID** (e.g. `OBEFF-00001`, `OBEFF-00002`).
  * Account approval workflow: new registrations remain in "Pending Review" until authorized by an administrator.
  * Strict Row-Level Security (RLS) & PII Protection: Residential addresses, phone numbers, and dates of birth are shielded from unverified queries.
* **Dual-Role Administrator Experience:**
  * **Family Member First:** Admins have standard member profiles, can post everyday updates, react, comment, and have a verified position on the family tree.
  * **Dedicated Admin Console:** Sleek access to the Administrator Console (protected by role guards and only visible to authorized Admins & Super-Admins).
  * **Priority Announcements:** Admins can publish official family bulletins that are pinned to the top of all user feeds with a distinctive emerald/gold badge and broadcasted to members.
* **Interactive Visual Family Tree:**
  * Navigable generational hierarchy (Generations 1, 2, 3+).
  * Smooth pan and zoom controls, search by member name or Family ID, and privacy-shielded member preview cards.
* **Lineage Verification Workflow:**
  * "My Lineage" tab allows members to submit maternal and paternal links for administrative review before updating the live tree.
* **Notification Engine (In-App & Transactional Email):**
  * **User Notification Settings:** Members can toggle email notifications for *General Announcements*, *New Posts*, and *Engagements* (likes/comments).
  * **Mandatory User Alerts:** All account activations, administrative edits, and status changes automatically dispatch both an in-app notice and an email to the affected user.
  * **Mandatory Admin Alerts:** All user actions requiring admin verification (sign-ups, lineage proposals) immediately notify all active admins in-app and by email.

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom family emerald and sage theme
* **Icons:** [Lucide React](https://lucide.dev/)
* **Database & Auth:** [Supabase](https://supabase.com/) (Managed PostgreSQL, Row-Level Security, JWT Auth)
* **Transactional Emails:** [Resend](https://resend.com/) (or AWS SES) with responsive HTML email templates and local console fallback
* **Hosting:** Optimized for [Vercel](https://vercel.com/) with zero-config deployment

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/alfiinyang/OBEFF-IMS.git
cd OBEFF-IMS
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to create your local `.env.local`:
```bash
cp .env.example .env.local
```

> ⚠️ **Security Notice:** Never commit `.env` or `.env.local` to GitHub. They are strictly ignored in `.gitignore`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Pre-Configured Test Accounts

The local MVP environment includes 4 pre-configured accounts with real session authentication:

| Role | Name | Family ID | Email | Default Password | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Chief Obeff | `OBEFF-00001` | `admin@obeff.org` | *Any text* (e.g. `admin123`) | Full system governance, audit trail, role assignment |
| **Admin** | Dr. Edet Obeff | `OBEFF-00002` | `edet.admin@obeff.org` | *Any text* (e.g. `admin123`) | Approvals, member management, priority announcements |
| **Member 1** | Kufre Obeff | `OBEFF-00003` | `kufre.member@obeff.org` | *Any text* (e.g. `member123`) | Lineage submission, family feed, tree exploration |
| **Member 2** | Maria Obeff | `OBEFF-00004` | `maria.member@obeff.org` | *Any text* (e.g. `member123`) | Lineage submission, family feed, tree exploration |
| **Pending** | Anima Obeff | `OBEFF-00005` | `anima.applicant@obeff.org` | *Any text* | Demonstrates the "Pending Review" user gate |

---

## 🗄️ Database Management Setup (Supabase)

To set up your live PostgreSQL database on Supabase:

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://app.supabase.com/) and click **New Project**.
2. Name the project `OBEFF-IMS`, generate a strong database password, and choose your preferred geographic region.

### Step 2: Execute Schema
1. In the Supabase Dashboard, click **SQL Editor** on the left menu.
2. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository.
3. Paste the entire content into the SQL Editor and click **Run**.
4. This creates:
   * All database tables (`profiles`, `lineage_edges`, `posts`, `comments`, `reactions`, `notifications`, `notification_preferences`, `audit_logs`).
   * Automated sequential Family ID sequence (`OBEFF-00101`, etc.).
   * Automated user registration trigger (`handle_new_user`).
   * Row-Level Security (RLS) policies.

### Step 3: Seed Initial Accounts (Optional)
To seed the 4 predefined accounts directly into Supabase:
1. Open [`supabase/seed.sql`](./supabase/seed.sql).
2. Paste the content into the SQL Editor and click **Run**.
3. All 4 accounts will be seeded with default password `ObeffHeritage2026!`.

### Step 4: Retrieve API Credentials
1. Navigate to **Project Settings** -> **API**.
2. Copy:
   * **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   * **anon / public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY` *(Confidential: never expose client-side)*
3. Paste these values into your `.env.local` and your Vercel Project Settings.

### Step 5: Bootstrap Your Own Personal Super-Admin Account
When you register your personal email through the live website signup form, run this SQL query once in the Supabase SQL Editor to grant yourself **Super-Admin** rights:
```sql
UPDATE public.profiles
SET role = 'Super-Admin', status = 'Active'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-personal-email@domain.com');
```

---

## 🔒 Security Architecture & RLS Safeguards

The platform employs a defense-in-depth security model:
1. **Personally Identifiable Information (PII) Shielding:**
   * Residential addresses, phone numbers, and dates of birth are hidden from standard directory searches and tree views.
   * Supabase Row-Level Security (RLS) ensures only users themselves or verified administrators can query full personal details.
2. **Role-Based Access Control (RBAC):**
   * Member access is restricted to approved accounts (`status = 'Active'`).
   * Admin routes (`/admin/*`) are protected both at the layout level and via PostgreSQL security functions (`public.is_admin()`).
3. **No Search Engine Indexing:**
   * The application serves `X-Robots-Tag: noindex, nofollow` headers to guarantee family member profiles are never indexed by search engines.
4. **Audit Logging:**
   * All member activations, suspensions, and role changes generate immutable records in `public.audit_logs`.

---

## 🌐 Deploying to Vercel

### Step 1: Push Code to GitHub
Ensure all changes are pushed to your repository:
```bash
git push origin main
```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com/) and select **Add New...** -> **Project**.
2. Select your GitHub repository: `alfiinyang/OBEFF-IMS`.
3. Framework Preset: Next.js (detected automatically).

### Step 3: Configure Environment Variables in Vercel
Under **Environment Variables**, add:
* `NEXT_PUBLIC_SUPABASE_URL` = `https://[your-project-id].supabase.co`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[your-anon-key]`
* `SUPABASE_SERVICE_ROLE_KEY` = `[your-service-role-key]`
* `NEXT_PUBLIC_APP_URL` = `https://[your-app-name].vercel.app`
* `RESEND_API_KEY` = `[your-resend-api-key]` *(Optional for transactional emails)*
* `EMAIL_FROM` = `OBEFF Portal <notifications@yourfamilydomain.org>` *(Optional)*

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy the production site with automated SSL and edge routing.

---

## 📄 License

Private & Proprietary. Created for verified members and descendants of the OBEFF family heritage.
