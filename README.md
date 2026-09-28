# Academic Attendance Predictor & Planner

An advanced, enterprise-grade college attendance tracker, predictive modeling engine, and interactive simulation dashboard. This platform is designed specifically to help undergraduate students schedule future leaves, optimize **On-Duty (OD)** sanctions, and secure attendance above the mandatory 75% detention threshold.

---

## 📅 Semester Context
* **Start Date**: August 29, 2026  
* **End Date**: November 29, 2026  
* **Tracked Cohorts**: 10 distinct, pre-registered academic sections (Section 1 to Section 10).
* **Campus Holidays Excluded**: Labor Day, Fall Break, Veterans Day, Thanksgiving Break.

---

## 🚀 Key Features

### 1. The Core Predictor & Calculator
* **Section-Specific Calendars**: Auto-calculates scheduled classes and room logs for 10 engineering cohorts based on realistic timetables.
* **Attendance Rate Forecasting**: Tracks exactly how many upcoming classes a student must attend to stay out of the **75% Detention Zone** or secure a **90% Honors Standing**.
* **Irreversible Detention Alert**: Displays a high-contrast warning banner if it is mathematically impossible to reach the 75% threshold, prompting students to take immediate action.

### 2. Interactive Leave & OD Simulator
* **Interactive 3-Week Matrix Grid**: Click on any upcoming class day in the calendar to dynamically toggle its state.
* **Absence/Sick Leave**: Adds a simulated sick leave, registering missed sessions and recalculating final percentages.
* **On-Duty (OD) Sanctions**: Grants automatic present credits, allowing students to preserve their GPA-advancing attendance metrics.
* **Sanctioned/Excused Absences**: Excludes classes entirely from both the numerator and denominator, serving as a buffer.

### 3. Academic Advisor Chat Desk
* **Secure Server-Side AI**: Powered by the modern `@google/genai` SDK on an Express.js backend.
* **Context-Grounding**: Feeds the real-time student configuration (percentages, class records, holidays, and active leaves) directly to Gemini for mathematically precise recommendations.
* **Offline Fallback Handler**: Specifically guards against transient server spikes or rate-limiting (such as 503 unavailable codes), immediately serving local computed logs and manual tips.

---

## 🎨 Professional UI/UX Details
* **60-30-10 Professional Color Palette**: Structured with clean off-white canvases (`bg-slate-50`), crisp white cards (`bg-white`), thin razor borders (`border-slate-200`), and deep charcoal accents.
* **Circular Progress Indicators**: Custom-rendered SVG gauges mapping subject ratios dynamically.
* **Threshold Progress Tracks**: Horizontal bars that visually map where a student's current progress is relative to the critical **75% detention** and **90% honor** target lines.
* **Tabular Typography**: Numbers and parameters formatted in monospace `font-mono tabular-nums` to ensure exact column alignment.

---

## 🛠️ Installation & Local Development

### 1. Install Dependencies
Ensure you use the legacy peer dependency flag to bypass conflict resolutions:
```bash
npm install --legacy-peer-deps
```

### 2. Setup API Secrets
Configure your environment variables in a `.env` file in the root directory:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```

### 3. Launch Development Server
Launches the full-stack Node/Express server on Port 3000, mounting the Vite pipeline in middleware mode:
```bash
npm run dev
```

### 4. Build for Production
Compiles static assets and readies server containers:
```bash
npm run build
npm start
```
