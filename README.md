# OBEFF IMS (Information Management System)

> A private, secure web platform combining an official family contact directory, an interactive visual lineage tree, prioritized administrator announcements, and an automated notification engine.

---

## 🌟 Key Features

* **Family Member Identity & RBAC Privacy:**
  * Member sign-up with sequential **Unique Family ID** (e.g. `OBEFF-00101`).
  * Account approval workflow: new registrations remain in "Pending Review" until authorized by an administrator.
  * Strict Row-Level Security (RLS) & PII Protection: Residential addresses, phone numbers, and dates of birth are shielded from public queries.
* **Dual-Role Administrator Experience:**
  * **Family Member First:** Admins have standard member profiles, can post everyday updates, react, comment, and have a verified position on the family tree.
  * **Dedicated Admin Console:** Fast context switcher between "Family Member View" and "Admin Console".
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
Copy the `.env.example` file to create your local `.env.local`:
```bash
cp .env.example .env.local
```

> ⚠️ **Security Notice:** Never commit `.env` or `.env.local` to GitHub. It is already strictly ignored in `.gitignore`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> The application includes built-in mock data and reactive stores, allowing immediate testing of all Member, Admin, and Super-Admin roles directly from the UI without database credentials configured.

---

## 🗄️ Database Management Setup (Supabase)

To connect your live production database:

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://app.supabase.com/) and click **New Project**.
2. Choose a project name (e.g. `obeff-ims`), set a strong database password, and select the region closest to your family members.

### Step 2: Execute Schema & Security Rules
1. In the Supabase Dashboard, navigate to the **SQL Editor** tab (left sidebar).
2. Open the file [`supabase/schema.sql`](./supabase/schema.sql) in this repository.
3. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
4. This script automatically creates:
   * Tables (`profiles`, `lineage_edges`, `posts`, `comments`, `reactions`, `notifications`, `notification_preferences`, `audit_logs`).
   * Automated sequential Family ID generator (`OBEFF-00101`, etc.).
   * Strict Row-Level Security (RLS) policies.
   * Auto-registration trigger (`handle_new_user`).

### Step 3: Retrieve Your Credentials
1. Go to **Project Settings** -> **API**.
2. Copy:
   * **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   * **anon / public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY` *(Keep this secret!)*
3. Paste them into your `.env.local` file (and into Vercel Environment Variables).

### Step 4: Bootstrap the First Super-Admin
After signing up with your primary admin email via the app, run this single SQL command in the Supabase SQL Editor to grant yourself full `Super-Admin` status:
```sql
UPDATE public.profiles
SET role = 'Super-Admin', status = 'Active'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@domain.com');
```

---

## 📧 Transactional Email Setup (Resend)

1. Create a free account at [Resend.com](https://resend.com/).
2. Add and verify your custom domain (e.g., `family.org`) by configuring the provided DNS records (SPF, DKIM).
3. Generate an API key and add it to your environment:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM="OBEFF Family Portal <notifications@family.org>"
   ```
4. *Local Testing:* If no `RESEND_API_KEY` is provided, all transactional emails (approvals, activations, announcements) will be logged cleanly to your terminal console without failing.

---

## 🌐 Deploying to Vercel

This repository includes [`vercel.json`](./vercel.json) pre-configured with security headers (`X-Frame-Options: DENY`, `noindex` headers to shield family records from search engine crawlers).

### Deploy via GitHub Integration (Recommended):
1. Push this repository to GitHub: `https://github.com/alfiinyang/OBEFF-IMS`.
2. Visit [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
3. Import the `OBEFF-IMS` repository.
4. In the **Environment Variables** section, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `RESEND_API_KEY`
   * `EMAIL_FROM`
   * `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g. `https://obeff-ims.vercel.app`)
5. Click **Deploy**. Vercel will build and launch your application in under 2 minutes.

---

## 🔒 Security & Privacy Practices

* **No Search Engine Indexing:** Enforced via `X-Robots-Tag: noindex, nofollow` in middleware and `vercel.json` so personal family information is never indexed by Google.
* **Row-Level Security:** Enforced at the PostgreSQL level. Non-admin users cannot query residential addresses or dates of birth of other members.
* **Audit Trail:** All role upgrades, activations, and lineage approvals are recorded in the `audit_logs` table.
* **Secret Hygiene:** Database credentials, service role keys, and confidential planning documents are strictly excluded via `.gitignore`.

---

## 📄 License

Private & Proprietary. Created for the verified members and descendants of the OBEFF family heritage.
