# 🛠️ VA Car & Bike Care - Desktop Admin Dashboard Specification

This document provides a comprehensive, ultra-detailed breakdown of all features, capabilities, creation/editing options, deletion rights, and management controls available in the **Desktop Admin Dashboard** (`src/pages/Admin.tsx`).

---

## 📑 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [System Overview & Performance Analytics](#2-system-overview--performance-analytics)
3. [Bookings & Detailing Slot Management](#3-bookings--detailing-slot-management)
4. [Client Directory & User Account Management](#4-client-directory--user-account-management)
5. [Team Accounts Management](#5-team-accounts-management)
6. [Crew Directory & Technician Roster](#6-crew-directory--technician-roster)
7. [Job Applications & Hiring Pipeline](#7-job-applications--hiring-pipeline)
8. [Services Management Catalog](#8-services-management-catalog)
9. [Loyalty & Rewards Program Configuration](#9-loyalty--rewards-program-configuration)
10. [Customer Reviews & Website Testimonials](#10-customer-reviews--website-testimonials)
11. [Notification Center & Push Broadcast System](#11-notification-center--push-broadcast-system)
12. [System Audits & Security Logs](#12-system-audits--security-logs)
13. [Coupon & Promo Code Manager](#13-coupon--promo-code-manager)
14. [Before & After Showcase Gallery](#14-before--after-showcase-gallery)
15. [Blog & SEO Article Content Manager](#15-blog--seo-article-content-manager)
16. [Summary of CRUD Permissions](#16-summary-of-crud-permissions)

---

## 1. Overview & Architecture
The **Desktop Admin Dashboard** serves as the central control room for Super Admins and Staff Managers. It features a modern dark navy theme (`#070C16`), a collapsible sidebar navigation menu, real-time Firestore database synchronization, and automated audit logging for every administrative action.

- **Primary URL**: `/admin`
- **Access Control**: Super Admin & Staff roles
- **Design System**: Stripe/Linear/Notion-inspired dark theme with glassmorphism cards, Inter/Poppins typography, and custom micro-animations.

---

## 2. System Overview & Performance Analytics
### 📊 What It Can Do
- **Real-Time KPI Cards**:
  - **Total Bookings**: Tracks total appointment volume across all time and filtered ranges.
  - **Total Revenue (₹)**: Calculates live gross earnings from completed and confirmed bookings.
  - **Active Registered Clients**: Counts total unique customer profiles stored in the system.
  - **Pending Job Applications**: Highlights new candidate submissions waiting for HR review.
- **Visual Analytics & Charts**:
  - **Earnings Overview Bar Chart**: Interactive daily revenue breakdown (Mon-Sun).
  - **Service-Wise Revenue Table**: Shows revenue contributed by Car Wash, General Service, Oil Change, AC Service, and Bike Detailing.
  - **Time Range Filters**: Switch between `This Week`, `This Month`, and `All Time`.

---

## 3. Bookings & Detailing Slot Management
### 📅 What Can Be Managed & Controlled
- **Search & Filtering**: Search bookings by Customer Name, Vehicle Details (Car/Bike), Service Type, Phone Number, or Booking ID.
- **Filter Tabs**: `All`, `Pending`, `Accepted / Confirmed`, `Assigned`, `In Progress`, `Completed`, `Cancelled`.
- **Status Change**: Update any booking status in real time:
  - `Pending` ➔ `Accepted` ➔ `Assigned` ➔ `In Progress` ➔ `Completed` or `Cancelled`.
- **Assign Detailer Squad / Mechanic**: Assign specific staff technicians to a booking.
- **Reschedule Slot**: Modify scheduled date and time slot (e.g., `10:00 AM`, `02:00 PM`).
- **Customer Contact**: One-touch phone call (`tel:`) trigger.
- **Customer Location**: Direct link to customer's GPS location / Google Maps coordinates.
- **Download & Generate Invoice**: Generate printable PDF invoice with subtotal, 18% GST calculation, and payment status badge.

### 🗑️ What Can Be Deleted
- Cancel or invalidate invalid/duplicate bookings.

---

## 4. Client Directory & User Account Management
### 👥 What Can Be Managed & Controlled
- **Customer Roster**: View all registered users with Name, Email, Phone, Vehicle Count, Address Count, and Role.
- **Role Management**: Change user roles between:
  - `customer` ➔ Standard client permissions.
  - `staff` ➔ Service crew / manager access.
  - `admin` ➔ Full Super Admin dashboard privileges.
- **Direct Coupon Grant**: Select a promo coupon and assign it directly to a specific client profile.
- **Loyalty Points Adjustment**:
  - Manually grant or subtract reward points (e.g., `+100` bonus points or `-50` redemption points).
  - Attach an audit description note (e.g., "Apology bonus for delayed service").

---

## 5. Team Accounts Management
### 👤 What Can Be Created
- **Create Staff Account**:
  - Full Name
  - Phone Number
  - Email Address
  - Department (e.g., `Detailing Squad`, `Supervision`, `Customer Care`)
  - Access Role (`admin` / `staff`)

### ✏️ What Can Be Edited
- Update staff profile credentials, assigned department, and access level.

### 🗑️ What Can Be Deleted
- Delete staff credentials and revoke administrative access.

---

## 6. Crew Directory & Technician Roster
### 🔧 What Can Be Managed & Controlled
- **Detailer Roster**: View all service technicians with profile photo, phone, and department tag.
- **Availability Status Toggle**: Switch technician status in 1 click:
  - `Available` (Green badge)
  - `Busy` (Amber badge)
  - `Offline` (Gray badge)
- **Direct Phone Contact**: Trigger phone call (`tel:`) directly from the crew list.

---

## 7. Job Applications & Hiring Pipeline
### 💼 What Can Be Managed & Controlled
- **Applicant Directory**: Review candidate submissions with Applicant Name, Target Position (e.g., `Senior Car Detailer`, `Bike Specialist`), Years of Experience, Phone, Email, and Cover Letter.
- **Status Pipeline Controls**:
  - `Pending` ➔ `Reviewed` ➔ `Accepted` ➔ `Rejected`.
- **Contact Applicant**: One-touch call or email to schedule interviews.

---

## 8. Services Management Catalog
### ➕ What Can Be Created
- **Add New Service**:
  - Service Name (e.g., `Ceramic Coating Protection`)
  - Category (`Car`, `Bike`, `Both`)
  - Price in ₹ (e.g., `₹2999`)
  - Duration (e.g., `2 Hours`)
  - Service Description
  - Image URL / Icon assignment

### ✏️ What Can Be Edited
- Modify existing service pricing, title, duration, category, and descriptions in real time.

### 🗑️ What Can Be Deleted
- Remove obsolete or discontinued services from the public booking catalog.

---

## 9. Loyalty & Rewards Program Configuration
### 🎁 What Can Be Managed & Controlled
- **Points Multiplier**: Set points earned per spent amount (e.g., `1 Point per ₹10 spent`).
- **Minimum Redemption Threshold**: Set minimum points needed for redemption (e.g., `500 Points`).
- **Signup Bonus**: Set initial points credited upon new account creation (e.g., `100 Points`).
- **Manual Point Grants**: Issue points to any customer with custom audit notes.

---

## 10. Customer Reviews & Website Testimonials
### ⭐ What Can Be Managed & Controlled
- **Review Feed**: View star rating (1-5 stars), review message, customer name, date, and attached media photos.
- **Visibility Filter**: Switch between `All Reviews`, `Visible Reviews`, and `Hidden Reviews`.
- **Hide / Unhide Toggle**: Hide specific inappropriate/spam reviews from appearing on public service pages and homepage without deleting them.
- **Admin Reply**: Post official admin responses to customer reviews.

---

## 11. Notification Center & Push Broadcast System
### 🔔 What Can Be Created & Managed
- **Broadcast Push Notifications**: Send instant Web Push Notifications to all devices or specific user segments.
- **Campaign Fields**: Notification Title, Message Body, Action Target Link, Segment (`All Customers`, `Staff Only`).
- **FCM Multi-Device Logs**: Monitor device token registrations, delivery statuses, and permission grants.
- **Automated Templates**: Manage notification templates for booking confirmations, slot reminders, and promotional offers.

---

## 12. System Audits & Security Logs
### 📋 What Can Be Viewed & Audited
- **Live Security Feed**: Immutable log of all administrative actions.
- **Audit Attributes**: Timestamp, Admin User Name, Admin Email, User IP / Device ID, Action Description.
- **Search & Filter**: Filter logs by admin author or specific action keyword.

---

## 13. Coupon & Promo Code Manager
### 🎟️ What Can Be Created
- **Add New Promo Code**:
  - Code string (e.g., `SUMMER20`, `WELCOME50`)
  - Discount Type (`percentage` e.g., `20%` or `flat` e.g., `₹100`)
  - Discount Value
  - Minimum Spend Requirement (₹)
  - Target User Scoping (`all` registered users vs specific customer email/ID)
  - Active Status (`Active` / `Inactive`)

### ✏️ What Can Be Edited
- Update discount values, min spend thresholds, or promo code strings.

### 🗑️ What Can Be Deleted
- Delete expired or revoked promotional coupons.

---

## 14. Before & After Showcase Gallery
### 🖼️ What Can Be Created
- **Add Before & After Item**:
  - Title (e.g., `Sedan Paint Correction & Ceramic Coating`)
  - Detailing Category (`Car Detailing`, `Bike Detailing`, `Interior Deep Clean`)
  - Before Image URL (or Cloudinary Uploader)
  - After Image URL

### ✏️ What Can Be Edited
- Update showcase titles, categories, and image URLs.

### 🗑️ What Can Be Deleted
- Remove showcase cards from the public gallery page.

---

## 15. Blog & SEO Article Content Manager
### 📰 What Can Be Created
- **Add Blog Post**:
  - Article Title
  - URL Slug
  - Excerpt / Meta Description
  - Full Content (Markdown / Rich Text)
  - Cover Image URL
  - Category & Tags (e.g., `Car Care`, `Ceramic Coating`, `Monsoon Tips`)

### ✏️ What Can Be Edited
- Update article content, titles, cover images, and SEO tags.

### 🗑️ What Can Be Deleted
- Delete outdated blog posts.

---

## 16. Summary of CRUD Permissions

| Administrative Module | Create ➕ | Read 👁️ | Edit ✏️ | Delete 🗑️ | Manage / Action Controls ⚡ |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **System Overview** | ❌ | ✅ | ❌ | ❌ | Time range filters (`Week`/`Month`/`All`) |
| **Bookings & Slots** | ✅ | ✅ | ✅ | ✅ | Status change, Squad assignment, Reschedule date/slot, Download invoice |
| **Client Directory** | ✅ | ✅ | ✅ | ❌ | Role change (`admin`/`staff`/`customer`), Grant coupon, Loyalty points adjustment |
| **Team Accounts** | ✅ | ✅ | ✅ | ✅ | Role & department management, Credential revocation |
| **Crew Directory** | ✅ | ✅ | ✅ | ✅ | Status toggle (`Available`/`Busy`/`Offline`), Direct phone call |
| **Job Applications** | ❌ | ✅ | ✅ | ❌ | Hiring status pipeline (`Pending`/`Accepted`/`Rejected`) |
| **Services Catalog** | ✅ | ✅ | ✅ | ✅ | Price, duration, category & description editing |
| **Loyalty & Rewards** | ❌ | ✅ | ✅ | ❌ | Multiplier, min redemption threshold, signup bonus configuration |
| **Customer Reviews** | ❌ | ✅ | ✅ | ❌ | Hide/Unhide website visibility toggle, Admin reply |
| **Notification Center** | ✅ | ✅ | ✅ | ✅ | Push notification broadcast, FCM device logs, Campaign scheduling |
| **System Audits** | ❌ | ✅ | ❌ | ❌ | Security log audit feed, author & IP tracing |
| **Coupon Manager** | ✅ | ✅ | ✅ | ✅ | Code, discount type (`%`/`₹`), min spend, target scoping |
| **Before & After** | ✅ | ✅ | ✅ | ✅ | Side-by-side comparison images, category tags |
| **Blog & SEO Posts** | ✅ | ✅ | ✅ | ✅ | Article content, cover images, SEO tags |

---

> [!NOTE]
> All 16 administrative capabilities documented above are available in both the **Desktop Control Panel** and the **Mobile-First Smartphone Suite**.
