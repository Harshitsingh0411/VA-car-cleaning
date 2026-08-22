# 🚗 VA Car Cleaning & Careers

VA Car Cleaning & Careers is a premium, professional doorstep car cleaning, detailing, and recruitment portal. Built as a high-performance web application, it connects vehicle owners with expert detailing technicians and offers a comprehensive job-matching system for aspiring detailers and students seeking flexible work.

---

## ✨ Features

### 📅 Premium Doorstep Detailing & Booking
- **Flexible Scheduling**: Select service plans, specify your vehicle size/type (Sedan, Hatchback, SUV, etc.), pick a convenient date and time slot, and provide address details.
- **Service Categories**: Explore detailed walkthroughs of available services.
- **Interactive Tools**: 
  - **Before/After Slider**: Interactive visual slider simulating paint decontamination and restoration.
  - **Earnings Calculator**: Interactive tool for prospective staff to estimate their monthly income based on shift hours and base + incentive rates.

### 💼 Career & Jobs Hub
- **Application Portal**: Aspiring detailing partners can submit custom applications for full-time or part-time roles.
- **Job Benefits Outline**: Displays full details regarding insurance coverage, performance incentives, fuel allowances, and flexible student hours.

### 🛡️ Multi-Role Dashboards
- **Customer Dashboard**: Track ongoing bookings, view booking history, manage registered vehicles, and configure multiple default addresses (Home, Office, etc.).
- **Staff / Detailing Partner Dashboard**: Toggle online/offline availability, view currently assigned washes, track routes, and log service progress.
- **Admin Control Center**: Real-time analytics, central booking management (assigning employees, modifying payment status), job application review board, discount coupon management, system logs, and targeted notifications panel.

### 🔔 System & Alert Notifications
- Unified **Notification Center** for bookings, payments, updates, and promotions.
- Configurable notification priorities, read/unread states, and deep linking capability.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Animation**: Motion (formerly Framer Motion), Swiper (Carousel)
- **State & Form Control**: React Router DOM v7, React Hook Form
- **Backend & Database**: Firebase (Auth, Firestore, Cloud Storage)
- **Compatibility Layer**: Custom modular-to-namespaced compatibility bridge (`firebase.ts`) supporting Firebase v9+ modules.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** or **Yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/va-car-cleaning-&-careers.git
   cd va-car-cleaning-&-careers
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` or `.env.local` file in the root directory and define the following variables:
   ```env
   # Gemini AI API Configuration
   GEMINI_API_KEY="your-gemini-api-key"
   APP_URL="http://localhost:3000"

   # Firebase Configuration (Optional - Defaults are built-in for demo mode)
   VITE_FIREBASE_API_KEY="your-firebase-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🗃️ Database Rules Configuration

The application enforces fine-grained access control on database records. You can deploy rules to your Firebase project using the configuration files:
- **Firestore Rules**: Defined in `firestore.rules` (authorizes custom claims, verifies ownership of bookings, and secures audit logs).
- **Storage Rules**: Defined in `storage.rules` (governs uploads of vehicle images and job application resumes).

---

## 📄 License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.