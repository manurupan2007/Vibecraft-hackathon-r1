# CampusFlow · Academic Portal

**Live Deployment Link**: [vibecraft-hackathon-r1-five.vercel.app](https://vibecraft-hackathon-r1-five.vercel.app/)

A premium, unified academic portal integrating attendance forecasting, On-Duty leave simulations, and a live 3D room occupancy locator with semantic AI search. This project successfully merges the requirements of both **Round 1 (Attendance Predictor)** and **Round 2 (Free Class Locator)** into a high-fidelity student workstation.

---

## 🎨 Professional Themes System
Students can dynamically switch the entire look-and-feel of the academic portal using the upper right theme indicators:
* **Classic SaaS Light**: Clean off-white and slate corporate light design.
* **Midnight Carbon Dark**: High-contrast dark carbon dashboard.
* **Oxford Crimson Scholastic**: Harvard/Oxford-style crimson red and ivory.
* **Stanford Forest Academic**: Stanford-style gold and dark forest green.

---

## 🚀 Key Features

### 📅 Round 1: Attendance Tracker & Leave Simulator
* **Interactive Sliders**: Drag percentages to update actual portal attendance up to today's simulated progress date.
* **Detention Buffer Threshold (75%)**: Plots vertical target markers directly on subject progress tracks to forecast how many remaining sessions a student must attend to stay safe.
* **Merit standing (90%)**: Dynamic progress markers indicating the threshold for academic honor lists.
* **Detention Risk Alarm**: Displays a prominent, crimson warning banner if reaching 75% attendance is mathematically impossible.
* **Leave/OD Simulator**: Multi-state 21-day timeline calendar to test absences, Excused Leaves (removes class from total), and On-Duty sanctions (counts as attended) on final percentages.

### 🏛️ Round 2: Free Class Locator (The Empty Room Finder)
* **Interactive 3D Stacked Building Map**: A perspective-skewed isometric projection of the building (Ground Floor, 1F, and 2F). Rooms dynamically change color based on real-time schedule occupancy (Green for Empty, Red for Occupied).
* **Live Countdown Availability Timers**: Clicking any room on the map reveals a real-time countdown timer showing exactly how much time is left before the next scheduled class is scheduled to begin.
* **Traditional Floor Grid Manager**: Standard floor-by-floor list of detailed room specs.
* **AI Room Finder (Semantic Text Bar)**: Process natural requests like *"I need an AC room on the ground floor for the next 2 hours"* using server-side Gemini AI in native JSON schema returns to instantly highlight matchings.
* **"Call the Squad" Feature**: Instantly generates pre-formatted WhatsApp share links inviting project groups to occupied/free study classrooms.

---

## 🛠️ Local Development & Deployment

### 1. Install Project Packages
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment variables
Set up a `.env` file in your root workspace:
```env
GEMINI_API_KEY="YOUR_KEY"
PORT=3000
```

### 3. Launch Development Instance
Launches the full-stack Express server on Port 3000, serving the static index page and handling API requests securely:
```bash
npm run dev
```

### 4. Build for Vercel/Production
```bash
npm run build
npm start
```
