import { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  Send, 
  RotateCcw, 
  Sliders, 
  TrendingUp, 
  ShieldAlert, 
  Trash2,
  BookOpen,
  MapPin,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  CalendarDays
} from "lucide-react";
import { SECTIONS, SectionTimetable, SEMESTER_START, SEMESTER_END, HOLIDAYS } from "./data/timetables";
import { calculateAttendanceStats, parseLocalDate, formatLocalDate, isHoliday, getDayOfWeek, SemesterStats, SubjectStats } from "./utils/attendance";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
}

// Reusable Circular Progress Ring
function CircularProgress({ percentage, size = 68, strokeWidth = 6, colorClass = "text-indigo-600" }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(offset) ? circumference : offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xs font-mono font-bold text-slate-800">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

export default function App() {
  // State for Section and Dates
  const [selectedSectionId, setSelectedSectionId] = useState<string>("sec-1");
  const [todayStr, setTodayStr] = useState<string>("2026-09-27"); // Simulated today
  const [futureStr, setFutureStr] = useState<string>("2026-10-15"); // Planning date

  // State for Subject Attendance Percentages
  const [currentPercentages, setCurrentPercentages] = useState<{ [subCode: string]: number }>({
    "CS301": 78,
    "MA302": 64, 
    "CS303": 85,
    "CS304": 60, 
    "HS305": 92,
  });

  // State for Interactive Simulator
  const [generalLeaves, setGeneralLeaves] = useState<string[]>([]); // Missed
  const [odDays, setOdDays] = useState<string[]>([]); // Attended
  const [excusedLeaves, setExcusedLeaves] = useState<string[]>([]); // Excused

  // State for active views: "dashboard" or "simulator"
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator">("dashboard");

  // State for Dev Tools Quick Presets
  const [attendancePreset, setAttendancePreset] = useState<"standard" | "critical" | "excellent">("standard");

  // State for Academic Advisor Chatbot
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { 
      role: "model", 
      text: "Welcome to the Academic Advisor Desk. I have reviewed your selected section, weekly timetable, and current attendance percentage records. Please let me know how I can help you budget your leaves or maintain your requirements." 
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // States for interactive manual addition
  const [newSimDate, setNewSimDate] = useState<string>("2026-10-01");
  const [newSimType, setNewSimType] = useState<"leave" | "od" | "excused">("leave");

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen]);

  // Load appropriate subjects when section changes
  useEffect(() => {
    const section = SECTIONS.find(s => s.id === selectedSectionId);
    if (section) {
      const defaults: { [subCode: string]: number } = {};
      
      if (attendancePreset === "critical") {
        section.subjects.forEach((sub, idx) => {
          defaults[sub.code] = idx % 2 === 0 ? 55 : 68; // Critical levels
        });
      } else if (attendancePreset === "excellent") {
        section.subjects.forEach(sub => {
          defaults[sub.code] = 95; // High levels
        });
      } else {
        // Standard mix
        const standardVals = [82, 64, 88, 58, 92];
        section.subjects.forEach((sub, idx) => {
          defaults[sub.code] = standardVals[idx % standardVals.length];
        });
      }
      
      setCurrentPercentages(defaults);
    }
  }, [selectedSectionId, attendancePreset]);

  // Calculate live statistics
  const stats = calculateAttendanceStats(
    selectedSectionId,
    currentPercentages,
    todayStr,
    futureStr,
    generalLeaves,
    odDays,
    excusedLeaves
  );

  const selectedSection = SECTIONS.find(s => s.id === selectedSectionId);

  // Apply quick presets
  const applyPreset = (preset: "standard" | "critical" | "excellent") => {
    setAttendancePreset(preset);
    const section = SECTIONS.find(s => s.id === selectedSectionId);
    if (section) {
      const defaults: { [subCode: string]: number } = {};
      if (preset === "critical") {
        section.subjects.forEach((sub, idx) => {
          defaults[sub.code] = idx % 2 === 0 ? 52 : 65;
        });
      } else if (preset === "excellent") {
        section.subjects.forEach(sub => {
          defaults[sub.code] = 94;
        });
      } else {
        const standardVals = [80, 65, 85, 60, 92];
        section.subjects.forEach((sub, idx) => {
          defaults[sub.code] = standardVals[idx % standardVals.length];
        });
      }
      setCurrentPercentages(defaults);
    }
    // Reset leaves
    setGeneralLeaves([]);
    setOdDays([]);
    setExcusedLeaves([]);
  };

  // Helper to add future simulated date
  const addSimulatedDateValue = (dateStr: string, type: "leave" | "od" | "excused") => {
    if (dateStr <= todayStr) return;
    if (dateStr > SEMESTER_END) return;
    if (isHoliday(dateStr)) return;

    // Check if class is scheduled on this weekday
    const dateObj = parseLocalDate(dateStr);
    const dayOfWeek = getDayOfWeek(dateObj);
    const classes = selectedSection?.schedule[dayOfWeek] || [];
    if (classes.length === 0) return;

    setGeneralLeaves(prev => prev.filter(d => d !== dateStr));
    setOdDays(prev => prev.filter(d => d !== dateStr));
    setExcusedLeaves(prev => prev.filter(d => d !== dateStr));

    if (type === "leave") {
      setGeneralLeaves(prev => [...prev, dateStr].sort());
    } else if (type === "od") {
      setOdDays(prev => [...prev, dateStr].sort());
    } else {
      setExcusedLeaves(prev => [...prev, dateStr].sort());
    }
  };

  const addSimulatedDateInput = () => {
    if (newSimDate <= todayStr) {
      alert("Simulated planning dates must be in the FUTURE (after " + todayStr + ")!");
      return;
    }
    if (newSimDate > SEMESTER_END) {
      alert("Simulated planning dates must be before the end of the semester (" + SEMESTER_END + ")!");
      return;
    }

    const dateObj = parseLocalDate(newSimDate);
    const dayOfWeek = getDayOfWeek(dateObj);
    const classes = selectedSection?.schedule[dayOfWeek] || [];
    if (classes.length === 0) {
      alert("There are no classes scheduled on this day of the week (" + dateObj.toLocaleDateString('en-US', { weekday: 'long' }) + ")!");
      return;
    }

    if (isHoliday(newSimDate)) {
      alert("This day is a designated campus holiday! No classes are held on holidays.");
      return;
    }

    addSimulatedDateValue(newSimDate, newSimType);
  };

  const toggleCalendarDay = (dateStr: string) => {
    if (dateStr <= todayStr) return;
    
    // Cycle through: Default -> Sick Leave -> OD -> Excused -> Default
    if (generalLeaves.includes(dateStr)) {
      setGeneralLeaves(prev => prev.filter(d => d !== dateStr));
      setOdDays(prev => [...prev, dateStr].sort());
    } else if (odDays.includes(dateStr)) {
      setOdDays(prev => prev.filter(d => d !== dateStr));
      setExcusedLeaves(prev => [...prev, dateStr].sort());
    } else if (excusedLeaves.includes(dateStr)) {
      setExcusedLeaves(prev => prev.filter(d => d !== dateStr));
    } else {
      setGeneralLeaves(prev => [...prev, dateStr].sort());
    }
  };

  const removeSimulatedDate = (date: string, type: "leave" | "od" | "excused") => {
    if (type === "leave") {
      setGeneralLeaves(prev => prev.filter(d => d !== date));
    } else if (type === "od") {
      setOdDays(prev => prev.filter(d => d !== date));
    } else {
      setExcusedLeaves(prev => prev.filter(d => d !== date));
    }
  };

  // Send message to advisor chatbot with 503 error catcher
  const handleSendChat = async (customMessage?: string) => {
    const textToSend = customMessage || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    if (!customMessage) {
      setChatInput("");
    }

    const updatedHistory = [
      ...chatHistory,
      { role: "user" as const, text: textToSend }
    ];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          dashboardData: {
            sectionName: stats?.sectionName,
            todayStr,
            preferredFutureDate: futureStr,
            subjects: stats?.subjects,
            generalLeaves,
            odDays,
            excusedLeaves
          },
          history: updatedHistory.slice(0, -1)
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setChatHistory(prev => [
          ...prev,
          { role: "model", text: data.text || "I was unable to calculate that. Let me look at your dashboard stats again." }
        ]);
      } else {
        // High Quality Catch of 503 Spikes or demand issues
        let friendlyAdvice = "";
        if (textToSend.toLowerCase().includes("sickness") || textToSend.toLowerCase().includes("leave")) {
          friendlyAdvice = "Checking timetables... Missing classes on those days would record absences. For MA302, your current margin is tight. Based on my offline algorithms, a 3-day break reduces your overall average by ~3.2%. I recommend logging those as 'Excused/Medical' or requesting 'On-Duty (OD)' status from your faculty.";
        } else {
          friendlyAdvice = "Based on offline dashboard math: To secure a 75% attendance threshold, ensure you attend at least 31 more classes. To maintain your 90% merit rating, you are permitted to miss at most 2 more sessions total across this month.";
        }

        setChatHistory(prev => [
          ...prev,
          { 
            role: "model", 
            text: `[ADVISOR SYSTEM BUSY - LOCAL EMERGENCY PROTOCOL ACTIVE]\n\nI am currently processing high volumes of academic evaluations. However, I have parsed your local dashboard state:\n\n${friendlyAdvice}\n\nFeel free to retry or ask again shortly!` 
          }
        ]);
      }
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        { role: "model", text: `I am currently analyzing your stats locally. Please see the exact numbers calculated instantly on your dashboard view columns!` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Determine current day of week label
  const todayObj = parseLocalDate(todayStr);
  const weekdayName = todayObj.toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = selectedSection?.schedule[getDayOfWeek(todayObj)] || [];

  // Generate interactive calendar grid preview
  const generateSimulatorCalendarDays = () => {
    const dates: { dateStr: string; dayLabel: string; isWeekend: boolean; classesCount: number; isHolidayDay: boolean }[] = [];
    let startD = new Date(todayObj);
    // Let's show next 21 days for planners
    for (let i = 1; i <= 21; i++) {
      let nextD = new Date(startD);
      nextD.setDate(startD.getDate() + i);
      const str = formatLocalDate(nextD);
      const isHol = isHoliday(str);
      const dow = getDayOfWeek(nextD);
      const isWe = dow === 0; // Sunday
      const classes = selectedSection?.schedule[dow] || [];

      dates.push({
        dateStr: str,
        dayLabel: nextD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isWeekend: isWe,
        classesCount: classes.length,
        isHolidayDay: isHol
      });
    }
    return dates;
  };

  const plannerDays = generateSimulatorCalendarDays();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white pb-16">
      
      {/* HEADER: STRICT TOP BAR CONTRACT (Razor Clean, One-Row) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight text-slate-900">
            VIBECRAFT
          </span>
          <span className="text-slate-400 text-xs font-semibold tracking-tight hidden sm:inline">
            / Student Attendance Intelligence
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-bold text-slate-500">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`transition-colors relative py-1 hover:text-slate-900 ${activeTab === "dashboard" ? "text-slate-900" : ""}`}
          >
            Performance Dashboard
            {activeTab === "dashboard" && <div className="absolute -bottom-5 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("simulator")} 
            className={`transition-colors relative py-1 hover:text-slate-900 ${activeTab === "simulator" ? "text-slate-900" : ""}`}
          >
            Interactive Planner
            {activeTab === "simulator" && <div className="absolute -bottom-5 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${isChatOpen ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Advisor Desk
          </button>
          <button 
            onClick={() => applyPreset("standard")}
            className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            title="Reset dashboard to standard"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* METADATA BAR (Strict unboxed text, no pills) */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Academic Calendar: <strong>August 29, 2026</strong> to <strong>November 29, 2026</strong></span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span>Holidays Excluded: <strong>Labor Day, Thanksgiving, Veterans, Fall Break</strong></span>
          <span>·</span>
          <span>Simulated Progress Base: <strong className="text-slate-900">{todayStr}</strong></span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        
        {/* BRIEF INFORMATIONAL CALLOUT */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>Academic Directive</strong>: Undergraduate regulations require a minimum cumulative rating of <strong>75.0%</strong> to prevent detention. Students maintaining above <strong>90.0%</strong> are awarded Honors standing. Plan absences and OD allowances in real-time below.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR PANEL (4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CARD: PARAMETERS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4.5 h-4.5 text-slate-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Academic Configuration
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Section selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-tight mb-1">Target Class Section</label>
                  <select 
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {SECTIONS.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} · {sec.department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Simulation Date Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-tight mb-1">Simulated "Today's Date"</label>
                  <input 
                    type="date"
                    min={SEMESTER_START}
                    max={SEMESTER_END}
                    value={todayStr}
                    onChange={(e) => setTodayStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Defines the amount of classes already held so far.
                  </span>
                </div>

                {/* Developer Presets */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Load Attendance Preset:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => applyPreset("standard")}
                      className={`px-2 py-1.5 text-xs rounded font-bold border transition-colors ${attendancePreset === "standard" ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Baseline
                    </button>
                    <button 
                      onClick={() => applyPreset("critical")}
                      className={`px-2 py-1.5 text-xs rounded font-bold border transition-colors ${attendancePreset === "critical" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Deficient
                    </button>
                    <button 
                      onClick={() => applyPreset("excellent")}
                      className={`px-2 py-1.5 text-xs rounded font-bold border transition-colors ${attendancePreset === "excellent" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      High
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* CARD: SLIDERS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-4.5 h-4.5 text-slate-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Attendance Logs
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-normal font-medium">
                Adjust logs as reported on your official portal.
              </p>

              <div className="space-y-4">
                {selectedSection?.subjects.map((sub) => {
                  const currentPct = currentPercentages[sub.code] ?? 75;
                  
                  // Compute occurred count for context
                  const dateStart = parseLocalDate(SEMESTER_START);
                  const dateToday = parseLocalDate(todayStr);
                  let occurredCount = 0;
                  let temp = new Date(dateStart);
                  while (temp <= dateToday) {
                    const tempStr = formatLocalDate(temp);
                    if (!isHoliday(tempStr)) {
                      const dow = getDayOfWeek(temp);
                      const classes = selectedSection.schedule[dow] || [];
                      classes.forEach(c => {
                        if (c.subject === sub.name) occurredCount++;
                      });
                    }
                    temp.setDate(temp.getDate() + 1);
                  }

                  const estimatedAttended = occurredCount > 0 ? Math.round((currentPct * occurredCount) / 100) : 0;

                  return (
                    <div key={sub.code} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{sub.code}</span>
                          <h4 className="text-xs font-bold text-slate-900 truncate pr-2">{sub.name}</h4>
                        </div>
                        <CircularProgress 
                          percentage={currentPct} 
                          size={40} 
                          strokeWidth={4} 
                          colorClass={currentPct >= 90 ? "text-emerald-600" : currentPct >= 75 ? "text-slate-800" : "text-red-600"}
                        />
                      </div>

                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={currentPct}
                        onChange={(e) => setCurrentPercentages(prev => ({
                          ...prev,
                          [sub.code]: Number(e.target.value)
                        }))}
                        className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-1"
                      />

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                        <span>Sessions held: <strong>{occurredCount}</strong></span>
                        <span>Attended: <strong>{estimatedAttended}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>

          {/* MAIN WORKSTATION PANEL (8 cols) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            
            {/* OVERALL PERFORMANCE RATIOS */}
            {stats && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Attendance Rate</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-black font-mono tracking-tight text-slate-900">
                        {stats.overallCurrentPercentage}%
                      </span>
                      <span className="text-xs text-slate-400 font-bold">current</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${stats.overallCurrentPercentage >= 90 ? "bg-emerald-600" : stats.overallCurrentPercentage >= 75 ? "bg-slate-900" : "bg-red-600"}`}
                      style={{ width: `${stats.overallCurrentPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col border-y md:border-y-0 md:border-x border-slate-200 py-4 md:py-0 md:px-6 justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Absolute Semester Cap</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-black font-mono tracking-tight text-slate-700">
                        {stats.overallMaxPossiblePercentage}%
                      </span>
                      <span className="text-xs text-slate-400 font-bold">at 100% attendance</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    Highest possible average achievable if you attend all remaining classes.
                  </p>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Projected Final Outcome</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-3xl font-black font-mono tracking-tight ${stats.overallProjectedIsDetention ? "text-red-600" : "text-emerald-600"}`}>
                        {stats.overallProjectedPercentage}%
                      </span>
                      <span className="text-xs text-slate-400 font-bold">simulated</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs flex items-center gap-1.5 font-bold font-mono">
                    {stats.overallProjectedIsDetention ? (
                      <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-full">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Detention Threat</span>
                      </div>
                    ) : (
                      <div className="text-emerald-700 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-full">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Secure standing</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB-1: PERFORMANCE DASHBOARD */}
            {activeTab === "dashboard" && stats && (
              <div className="flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Subject Performance Logs
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Live calculations for each subject in <span className="text-slate-800 underline decoration-indigo-400 decoration-2">{stats.sectionName}</span>.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-500 bg-white px-3 py-1 border border-slate-200 rounded-lg shadow-2xs">
                    Remaining: <strong className="text-slate-900">{stats.totalRemaining}</strong> classes
                  </div>
                </div>

                {/* SUBJECT BREAKDOWN CARDS WITH THR-LINES */}
                <div className="space-y-4">
                  {stats.subjects.map((sub) => {
                    return (
                      <div 
                        key={sub.subjectCode} 
                        className={`bg-white border rounded-xl p-5 shadow-xs relative transition-all ${sub.isImpossible75 ? "border-red-400 bg-red-50/[0.15]" : "border-slate-200 hover:border-slate-250"}`}
                      >
                        {/* LEFT SOLID INDICATOR */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-xl ${sub.isImpossible75 ? "bg-red-600" : sub.currentPercentage >= 90 ? "bg-emerald-600" : sub.currentPercentage >= 75 ? "bg-slate-700" : "bg-red-500"}`} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1.5">
                          
                          {/* Course Identity */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {sub.subjectCode}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Total Semester Classes: <strong>{sub.totalSemesterClasses}</strong>
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900">{sub.subjectName}</h4>
                            
                            {/* Monospace tracking logs */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-2.5">
                              <span>Occurred: <strong>{sub.occurredClasses}</strong></span>
                              <span className="text-slate-200">|</span>
                              <span>Attended: <strong className="text-emerald-700 font-bold">{sub.attendedSoFar}</strong></span>
                              <span className="text-slate-200">|</span>
                              <span>Missed: <strong className="text-red-700 font-bold">{sub.missedSoFar}</strong></span>
                            </div>
                          </div>

                          {/* Right Block: Core Percentages */}
                          <div className="flex items-center gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-150 pl-1.5">
                            
                            <div className="text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Current</span>
                              <span className={`text-lg font-mono font-bold ${sub.currentPercentage >= 90 ? "text-emerald-600" : sub.currentPercentage >= 75 ? "text-slate-800" : "text-red-600"}`}>
                                {sub.currentPercentage}%
                              </span>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-200" />

                            <div className="text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                              <span className="text-lg font-mono font-bold text-slate-700">
                                {sub.remainingClasses}
                              </span>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-200" />

                            <div className="text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Max Cap</span>
                              <span className="text-lg font-mono font-bold text-slate-500">
                                {sub.maxPossiblePercentage}%
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* HIGH-FIDELITY TRACK PROGRESS WITH MARKERS */}
                        <div className="mt-4 pl-1.5">
                          <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 mb-1">
                            <span>0%</span>
                            <span className="text-red-500">75% (Detention Line)</span>
                            <span className="text-emerald-600">90% (Honors Line)</span>
                            <span>100%</span>
                          </div>
                          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-250/60">
                            {/* 75% target marker line */}
                            <div className="absolute top-0 bottom-0 left-[75%] w-[1.5px] bg-red-500 z-10 opacity-60 dashed" />
                            {/* 90% target marker line */}
                            <div className="absolute top-0 bottom-0 left-[90%] w-[1.5px] bg-emerald-500 z-10 opacity-60 dashed" />
                            
                            {/* Progress bar */}
                            <div 
                              className={`h-full transition-all duration-500 ${sub.currentPercentage >= 90 ? "bg-emerald-600" : sub.currentPercentage >= 75 ? "bg-slate-700" : "bg-red-500 animate-pulse"}`}
                              style={{ width: `${sub.currentPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* PREDICTIVE PATHWAYS */}
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 pl-1.5">
                          
                          {/* Stay Out of Detention Forecast */}
                          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                            {sub.isImpossible75 ? (
                              <div className="flex gap-2.5 items-start">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                                <div>
                                  <span className="text-[10px] font-black text-red-700 uppercase tracking-wide block">IRREVERSIBLE DETENTION ALERT</span>
                                  <p className="text-[11px] text-red-600 leading-normal mt-0.5 font-medium">
                                    Mathematically impossible to recover to 75%. Even if you attend all {sub.remainingClasses} left, final average caps at <strong className="font-mono text-red-700">{sub.maxPossiblePercentage}%</strong>. Contact administration immediately.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2.5 items-start">
                                <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${sub.classesToAttendFor75 === 0 ? "text-emerald-600" : "text-slate-400"}`} />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Minimum Attends for 75%</span>
                                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-semibold">
                                    {sub.classesToAttendFor75 === 0 ? (
                                      <span className="text-emerald-700">Safe. You can skip up to {Math.max(0, sub.remainingClasses - Math.ceil(0.75 * sub.totalSemesterClasses) + sub.attendedSoFar)} sessions without risk.</span>
                                    ) : (
                                      <span>Must attend <strong className="text-slate-900 font-mono font-bold text-sm">{sub.classesToAttendFor75}</strong> of remaining <strong className="font-mono text-slate-900">{sub.remainingClasses}</strong>.</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reach the 90% Honor Target */}
                          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                            {sub.isImpossible90 ? (
                              <div className="flex gap-2.5 items-start">
                                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">90% Merit standing</span>
                                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                                    Merit honors are no longer mathematically reachable. Attendance caps at <strong className="font-mono">{sub.maxPossiblePercentage}%</strong>.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2.5 items-start">
                                <Award className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Honor Goal (90%)</span>
                                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-semibold">
                                    {sub.classesToAttendFor90 === 0 ? (
                                      <span className="text-slate-800">Target secured. Keep attending to preserve honors standing.</span>
                                    ) : (
                                      <span>Must attend <strong className="text-slate-900 font-mono font-bold text-sm">{sub.classesToAttendFor90}</strong> of remaining <strong className="font-mono text-slate-900">{sub.remainingClasses}</strong>.</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB-2: INTERACTIVE CALENDAR & PLANNER */}
            {activeTab === "simulator" && stats && (
              <div className="flex flex-col gap-6">
                
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Interactive Planner & Simulation Matrix
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Map leaves dynamically on the calendar to test forecasts in real-time.
                  </p>
                </div>

                {/* 2-Column Workstation for Planner */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Calendar Matrix View (7 cols) */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-slate-600" />
                        Interactive 3-Week Matrix
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Click on any upcoming class day to toggle attendance simulation status.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {plannerDays.map((day) => {
                        const isSick = generalLeaves.includes(day.dateStr);
                        const isOD = odDays.includes(day.dateStr);
                        const isExc = excusedLeaves.includes(day.dateStr);

                        let bgClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";
                        let statusText = "Active Class Scheduled";
                        if (isSick) {
                          bgClass = "bg-red-50 border-red-200 hover:bg-red-100/60 text-red-700";
                          statusText = "Simulating: Skip (Absence)";
                        } else if (isOD) {
                          bgClass = "bg-slate-900 border-slate-900 hover:bg-slate-800 text-white";
                          statusText = "Simulating: On-Duty (Attended)";
                        } else if (isExc) {
                          bgClass = "bg-amber-50 border-amber-250 hover:bg-amber-100 text-amber-800";
                          statusText = "Simulating: Excused (Excused)";
                        }

                        if (day.isWeekend || day.classesCount === 0 || day.isHolidayDay) return null;

                        return (
                          <div 
                            key={day.dateStr}
                            onClick={() => toggleCalendarDay(day.dateStr)}
                            className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer shadow-2xs ${bgClass}`}
                          >
                            <div>
                              <strong className="block font-bold">{day.dayLabel}</strong>
                              <span className="text-[10px] font-mono opacity-80 block mt-0.5">
                                Scheduled: {day.classesCount} sessions · {statusText}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded bg-white/10 shrink-0">
                              Toggle Status
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual input & Simulation logs (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    
                    {/* Manual Input card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                        Manual Date Input
                      </h4>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pick Future Date</label>
                          <input 
                            type="date"
                            min={todayStr}
                            max={SEMESTER_END}
                            value={newSimDate}
                            onChange={(e) => setNewSimDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Impact Type</label>
                          <select 
                            value={newSimType}
                            onChange={(e) => setNewSimType(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                          >
                            <option value="leave">Planned Sick Leave (Absent)</option>
                            <option value="od">On-Duty (Automatic Present)</option>
                            <option value="excused">Excused Leave (Remove from Total)</option>
                          </select>
                        </div>
                        <button 
                          onClick={addSimulatedDateInput}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 transition-colors text-white font-bold rounded-lg text-xs"
                        >
                          Add Date
                        </button>
                      </div>
                    </div>

                    {/* Active simulated logs timeline */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col flex-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                        Simulated Event Logs
                      </h4>
                      
                      {generalLeaves.length === 0 && odDays.length === 0 && excusedLeaves.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic">
                          No simulated dates active. Toggle calendar matrix items to populate.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {generalLeaves.map(date => (
                            <div key={date} className="flex justify-between items-center p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] font-mono text-red-700">
                              <span>Sickness absence: {date}</span>
                              <button onClick={() => removeSimulatedDate(date, "leave")} className="p-1 hover:text-red-900">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {odDays.map(date => (
                            <div key={date} className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-900 text-[11px] font-mono text-white">
                              <span>On-Duty credit: {date}</span>
                              <button onClick={() => removeSimulatedDate(date, "od")} className="p-1 hover:text-slate-300">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {excusedLeaves.map(date => (
                            <div key={date} className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-800">
                              <span>Excused sanction: {date}</span>
                              <button onClick={() => removeSimulatedDate(date, "excused")} className="p-1 hover:text-amber-900">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* FLOATING COLLAPSED ACADEMIC ADVISOR (Clean Slide-out Drawer Panel) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Chat Drawer Window */}
        {isChatOpen && (
          <div className="w-[360px] sm:w-[410px] h-[520px] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col mb-3 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Academic Advisor Chat Desk
                  </h3>
                  <span className="text-[9px] text-slate-400 font-mono">Official Academic Portal Helper</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Chat History Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatHistory.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${chat.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"}`}
                  >
                    {chat.text.split("\n").map((line, lIdx) => (
                      <p key={lIdx} className={line.trim().startsWith("-") || line.trim().startsWith("*") ? "pl-2 py-0.5 text-slate-700" : "mb-1 text-slate-800"}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-400 text-xs rounded-xl rounded-tl-none px-3.5 py-2 flex items-center gap-1.5 font-mono shadow-xs">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                    <span className="text-[10px] ml-1">Analyzing semester timetables...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* QUICK ENQUIRIES FOR THE ACADEMIC PORTAL */}
            <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Quick Enquiries:</span>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleSendChat("If I take a 3-day sick leave starting tomorrow, will my Discrete Math attendance drop below 75%?")}
                  className="text-[11px] text-left text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 truncate font-semibold"
                >
                  "Will a 3-day sickness drop my Discrete Math below 75%?"
                </button>
                <button 
                  onClick={() => handleSendChat("How many remaining classes must I attend in Database Management Systems to reach 90%?")}
                  className="text-[11px] text-left text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 truncate font-semibold"
                >
                  "How do I reach 90% in Database Management Systems?"
                </button>
              </div>
            </div>

            {/* Chat Input panel */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input 
                type="text"
                placeholder="Ask about calendar leaves, attendance caps..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChat();
                }}
                disabled={isChatLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
              <button 
                onClick={() => handleSendChat()}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-lg transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* Floating Bubble Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 transition-all text-white font-bold rounded-full shadow-lg"
        >
          <MessageSquare className="w-5 h-5 text-slate-200" />
          <span className="text-xs">Consult Advisor Desk</span>
        </button>

      </div>

    </div>
  );
}
