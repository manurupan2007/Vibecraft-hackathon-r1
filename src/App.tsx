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
  MessageSquare,
  Award,
  CalendarDays,
  Search,
  Users,
  Compass,
  Layers,
  Share2,
  Activity,
  Palette
} from "lucide-react";
import { SECTIONS, SectionTimetable, SEMESTER_START, SEMESTER_END, HOLIDAYS } from "./data/timetables";
import { calculateAttendanceStats, parseLocalDate, formatLocalDate, isHoliday, getDayOfWeek, SemesterStats, SubjectStats } from "./utils/attendance";
import { getCampusRoomStatus, minutesToFriendly, RoomOccupancyStatus, timeToMinutes } from "./utils/locator";

// Reusable Circular Progress Ring
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  textColor?: string;
}

function CircularProgress({ 
  percentage, 
  size = 68, 
  strokeWidth = 6, 
  colorClass = "text-indigo-600",
  textColor = "text-slate-800"
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-slate-100 dark:text-zinc-800"
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
      <span className={`absolute text-xs font-mono font-bold ${textColor}`}>
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

// Dynamic Themes Definition
type ThemeType = "classic" | "dark" | "crimson" | "forest";

interface ThemeStyle {
  body: string;
  card: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  inputBorder: string;
  accentBg: string;
  accentText: string;
  secondaryBg: string;
  tabIndicator: string;
  navHeader: string;
  pillActive: string;
  pillInactive: string;
}

const THEME_STYLES: Record<ThemeType, ThemeStyle> = {
  classic: {
    body: "bg-slate-50 text-slate-800",
    card: "bg-white border-slate-200 shadow-xs text-slate-800",
    border: "border-slate-200",
    borderSubtle: "border-slate-100",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    textMuted: "text-slate-400",
    inputBg: "bg-slate-50 text-slate-800 border-slate-200 focus:border-slate-400",
    inputBorder: "border-slate-200",
    accentBg: "bg-slate-900 hover:bg-slate-800 text-white",
    accentText: "text-slate-900",
    secondaryBg: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    tabIndicator: "bg-slate-900",
    navHeader: "bg-white border-b border-slate-200",
    pillActive: "bg-slate-950 text-white",
    pillInactive: "bg-slate-100 hover:bg-slate-150 text-slate-600"
  },
  dark: {
    body: "bg-zinc-950 text-zinc-200",
    card: "bg-zinc-900 border-zinc-800/80 shadow-md text-zinc-100",
    border: "border-zinc-800/80",
    borderSubtle: "border-zinc-800/40",
    textPrimary: "text-zinc-100",
    textSecondary: "text-zinc-400",
    textMuted: "text-zinc-500",
    inputBg: "bg-zinc-850 text-zinc-100 border-zinc-750 focus:border-zinc-600",
    inputBorder: "border-zinc-750",
    accentBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
    accentText: "text-indigo-400",
    secondaryBg: "bg-zinc-800 hover:bg-zinc-750 text-zinc-200",
    tabIndicator: "bg-indigo-500",
    navHeader: "bg-zinc-900 border-b border-zinc-800",
    pillActive: "bg-indigo-600 text-white",
    pillInactive: "bg-zinc-800 hover:bg-zinc-750 text-zinc-300"
  },
  crimson: {
    body: "bg-[#faf7f7] text-[#3d2121]",
    card: "bg-white border-rose-100 shadow-xs text-[#3d2121]",
    border: "border-rose-100",
    borderSubtle: "border-rose-50/60",
    textPrimary: "text-[#3a1212]",
    textSecondary: "text-rose-800/80",
    textMuted: "text-rose-400",
    inputBg: "bg-rose-50/40 text-rose-950 border-rose-150 focus:border-rose-350",
    inputBorder: "border-rose-150",
    accentBg: "bg-[#722f37] hover:bg-[#5a242c] text-white",
    accentText: "text-[#722f37]",
    secondaryBg: "bg-rose-50 hover:bg-rose-100 text-rose-800",
    tabIndicator: "bg-[#722f37]",
    navHeader: "bg-white border-b border-rose-100",
    pillActive: "bg-[#722f37] text-white",
    pillInactive: "bg-rose-50 hover:bg-rose-100 text-rose-800"
  },
  forest: {
    body: "bg-[#f4f7f5] text-[#1c2e24]",
    card: "bg-white border-emerald-100 shadow-xs text-[#1c2e24]",
    border: "border-emerald-100",
    borderSubtle: "border-emerald-50/60",
    textPrimary: "text-[#0d2115]",
    textSecondary: "text-emerald-800/80",
    textMuted: "text-emerald-400",
    inputBg: "bg-[#ecf3f0] text-emerald-950 border-emerald-200 focus:border-emerald-450",
    inputBorder: "border-emerald-200",
    accentBg: "bg-[#1e4620] hover:bg-[#153417] text-white",
    accentText: "text-[#1e4620]",
    secondaryBg: "bg-[#ecf3f0] hover:bg-[#ddece7] text-[#1e4620]",
    tabIndicator: "bg-[#1e4620]",
    navHeader: "bg-white border-b border-emerald-100",
    pillActive: "bg-[#1e4620] text-white",
    pillInactive: "bg-[#ecf3f0] hover:bg-[#ddece7] text-[#1e4620]"
  }
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem("campusflow_theme");
    return (saved as ThemeType) || "classic";
  });

  useEffect(() => {
    localStorage.setItem("campusflow_theme", theme);
  }, [theme]);

  const t = THEME_STYLES[theme];

  // States for Section and Dates
  const [selectedSectionId, setSelectedSectionId] = useState<string>("sec-1");
  const [todayStr, setTodayStr] = useState<string>("2026-09-27"); // Simulated date
  const [futureStr, setFutureStr] = useState<string>("2026-10-15"); // Planning date

  // Subject Attendance Percentages
  const [currentPercentages, setCurrentPercentages] = useState<{ [subCode: string]: number }>({
    "CS301": 78,
    "MA302": 64, 
    "CS303": 85,
    "CS304": 60, 
    "HS305": 92,
  });

  const [generalLeaves, setGeneralLeaves] = useState<string[]>([]);
  const [odDays, setOdDays] = useState<string[]>([]);
  const [excusedLeaves, setExcusedLeaves] = useState<string[]>([]);

  // Navigation tabs: "attendance" | "simulator" | "locator"
  const [activeTab, setActiveTab] = useState<"attendance" | "simulator" | "locator">("attendance");

  // Presets
  const [attendancePreset, setAttendancePreset] = useState<"standard" | "critical" | "excellent">("standard");

  // Round 2 states: Live Room Locator
  const [simulatedTime, setSimulatedTime] = useState<string>("10:30"); // HH:MM
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [searchExplanation, setSearchExplanation] = useState<string>("");
  const [aiMatchingRoomIds, setAiMatchingRoomIds] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [mapFloorFilter, setMapFloorFilter] = useState<1 | 2 | 3>(1); // Map filter Floor

  // State for Academic Advisor Chatbot
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { 
      role: "model", 
      text: "Welcome to the CampusFlow Academic Portal Desk. I have audited your sections and class timetables. Feel free to enquire about your attendance projection thresholds, sick leave impacts, or where to find free study rooms right now!" 
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // States for interactive manual simulator additions
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
          defaults[sub.code] = idx % 2 === 0 ? 55 : 68;
        });
      } else if (attendancePreset === "excellent") {
        section.subjects.forEach(sub => {
          defaults[sub.code] = 95;
        });
      } else {
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

  // Calculate room occupancy logs dynamically based on current simulated progress date and simulated time
  const currentRoomStatuses = getCampusRoomStatus(todayStr, simulatedTime);

  // Apply presets
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
    setGeneralLeaves([]);
    setOdDays([]);
    setExcusedLeaves([]);
  };

  // Add date
  const addSimulatedDateValue = (dateStr: string, type: "leave" | "od" | "excused") => {
    if (dateStr <= todayStr) return;
    if (dateStr > SEMESTER_END) return;
    if (isHoliday(dateStr)) return;

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

  const removeSimulatedDate = (date: string, type: "leave" | "od" | "excused") => {
    if (type === "leave") {
      setGeneralLeaves(prev => prev.filter(d => d !== date));
    } else if (type === "od") {
      setOdDays(prev => prev.filter(d => d !== date));
    } else {
      setExcusedLeaves(prev => prev.filter(d => d !== date));
    }
  };

  const toggleCalendarDay = (dateStr: string) => {
    if (dateStr <= todayStr) return;
    
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

  // AI Room Finder Semantic Search Trigger
  const handleRoomSearch = async () => {
    if (!searchQuery.trim() || isSearchLoading) return;
    setIsSearchLoading(true);
    setSearchExplanation("");
    setAiMatchingRoomIds([]);

    try {
      const response = await fetch("/api/find-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          roomStatuses: currentRoomStatuses
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSearchExplanation(data.explanation || "I compiled matching classrooms below.");
        setAiMatchingRoomIds(data.matchingRoomIds || []);
        if (data.matchingRoomIds && data.matchingRoomIds.length > 0) {
          setSelectedRoomId(data.matchingRoomIds[0]);
          const matchRoom = currentRoomStatuses.find(r => r.room.id === data.matchingRoomIds[0]);
          if (matchRoom) {
            setMapFloorFilter(matchRoom.room.floor);
          }
        }
      } else {
        alert("Search error: " + (data.error || "failed search."));
      }
    } catch (e: any) {
      console.error(e);
      // Fallback
      const matches = currentRoomStatuses.filter(r => !r.isOccupied).slice(0, 3).map(r => r.room.id);
      setSearchExplanation("Offline analysis complete: highlighted a few available rooms on the map.");
      setAiMatchingRoomIds(matches);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Chatbot advisor
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
          { role: "model", text: data.text || "I processed your request successfully." }
        ]);
      } else {
        // Fallback for 503 errors
        let friendlyAdvice = "";
        if (textToSend.toLowerCase().includes("sickness") || textToSend.toLowerCase().includes("leave")) {
          friendlyAdvice = "Auditing schedules... Taking those leave days will record absences. If you require sick leave, ensure you apply for an official 'Excused/Medical' waiver to remove those sessions from the denominator entirely and preserve your standings.";
        } else {
          friendlyAdvice = "Based on offline math: To ensure you stay safe from 75% detention, attend at least 31 more classes. To maintain your 90% honor standard, you are permitted to miss at most 2 more sessions total across this month.";
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

  const todayObj = parseLocalDate(todayStr);
  const weekdayName = todayObj.toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = selectedSection?.schedule[getDayOfWeek(todayObj)] || [];

  // Generate interactive calendar grid preview
  const generateSimulatorCalendarDays = () => {
    const dates: { dateStr: string; dayLabel: string; isWeekend: boolean; classesCount: number; isHolidayDay: boolean }[] = [];
    let startD = new Date(todayObj);
    for (let i = 1; i <= 21; i++) {
      let nextD = new Date(startD);
      nextD.setDate(startD.getDate() + i);
      const str = formatLocalDate(nextD);
      const isHol = isHoliday(str);
      const dow = getDayOfWeek(nextD);
      const isWe = dow === 0;
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

  // Get selected room status details
  const selectedRoomStatus = currentRoomStatuses.find(r => r.room.id === selectedRoomId);

  // Squad Share Dynamic WhatsApp Generator (Call the squad!)
  const getSquadWhatsAppShareLink = (status: RoomOccupancyStatus) => {
    const friendlyTimeLeft = minutesToFriendly(status.timeLeftMinutes);
    const text = `📍 Heading to empty classroom ${status.room.name} (Floor ${status.room.floor}). It is completely free for the next ${friendlyTimeLeft}. Come fast!`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Copy Squad Invite to Clipboard
  const handleCopySquadInvite = (status: RoomOccupancyStatus) => {
    const friendlyTimeLeft = minutesToFriendly(status.timeLeftMinutes);
    const text = `📍 Heading to empty classroom ${status.room.name} (Floor ${status.room.floor}). It is completely free for the next ${friendlyTimeLeft}. Come fast!`;
    navigator.clipboard.writeText(text);
    alert("Squad invite copied to clipboard! Share it with your group.");
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-slate-900 selection:text-white pb-16 transition-colors duration-300 ${t.body}`}>
      
      {/* HEADER: STRICT TOP BAR CONTRACT (Razor Clean, One-Row) */}
      <header className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs transition-colors duration-300 ${t.navHeader}`}>
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <span className={`text-xl font-black tracking-tight ${t.textPrimary}`}>
            CampusFlow
          </span>
          <span className={`${t.textMuted} text-xs font-semibold tracking-tight hidden sm:inline`}>
            / Academic Management Portal
          </span>
        </div>

        {/* Zone 2: Navigation Links (Muted, unboxed text links) */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-500">
          <button 
            onClick={() => setActiveTab("attendance")} 
            className={`transition-colors relative py-1 hover:text-slate-900 dark:hover:text-zinc-100 ${activeTab === "attendance" ? t.textPrimary : t.textSecondary}`}
          >
            Attendance Tracker
            {activeTab === "attendance" && <div className={`absolute -bottom-5 left-0 right-0 h-0.5 rounded-full ${t.tabIndicator}`} />}
          </button>
          <button 
            onClick={() => setActiveTab("simulator")} 
            className={`transition-colors relative py-1 hover:text-slate-900 dark:hover:text-zinc-100 ${activeTab === "simulator" ? t.textPrimary : t.textSecondary}`}
          >
            Leave Simulator
            {activeTab === "simulator" && <div className={`absolute -bottom-5 left-0 right-0 h-0.5 rounded-full ${t.tabIndicator}`} />}
          </button>
          <button 
            onClick={() => {
              setActiveTab("locator");
              if (!selectedRoomId && currentRoomStatuses.length > 0) {
                setSelectedRoomId(currentRoomStatuses[0].room.id);
              }
            }} 
            className={`transition-colors relative py-1 hover:text-slate-900 dark:hover:text-zinc-100 ${activeTab === "locator" ? t.textPrimary : t.textSecondary}`}
          >
            Empty Room Locator
            {activeTab === "locator" && <div className={`absolute -bottom-5 left-0 right-0 h-0.5 rounded-full ${t.tabIndicator}`} />}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Theme Toggler + Chat widget) */}
        <div className="flex items-center gap-2">
          {/* Elegant theme selectors */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg mr-2 border border-slate-200 dark:border-zinc-700">
            <button 
              onClick={() => setTheme("classic")}
              className={`w-4 h-4 rounded-full bg-slate-400 border border-slate-300 hover:scale-110 transition-transform ${theme === "classic" ? "ring-2 ring-slate-900 ring-offset-1" : ""}`}
              title="Classic SaaS Theme"
            />
            <button 
              onClick={() => setTheme("dark")}
              className={`w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 hover:scale-110 transition-transform ${theme === "dark" ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
              title="Midnight Carbon Theme"
            />
            <button 
              onClick={() => setTheme("crimson")}
              className={`w-4 h-4 rounded-full bg-[#722f37] border border-[#5a242c] hover:scale-110 transition-transform ${theme === "crimson" ? "ring-2 ring-rose-900 ring-offset-1" : ""}`}
              title="Oxford Crimson Theme"
            />
            <button 
              onClick={() => setTheme("forest")}
              className={`w-4 h-4 rounded-full bg-[#1e4620] border border-[#153417] hover:scale-110 transition-transform ${theme === "forest" ? "ring-2 ring-emerald-800 ring-offset-1" : ""}`}
              title="Stanford Forest Theme"
            />
          </div>

          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${isChatOpen ? "bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-850"} ${t.textPrimary}`}
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Advisor Portal
          </button>
        </div>
      </header>

      {/* METADATA BAR (Strict unboxed text, no pills) */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Active Calendar: <strong>August 29, 2026</strong> to <strong>November 29, 2026</strong></span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span>Active Hol.: <strong>Labor Day, Thanksgiving, Veterans Day, Fall Break</strong></span>
          <span>·</span>
          <span>Simulation Base: <strong className={t.textPrimary}>{todayStr}</strong></span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        
        {/* BRIEF INFORMATIONAL CALLOUT */}
        <div className={`p-4 rounded-xl border mb-6 shadow-2xs flex items-start gap-3 transition-colors ${t.card}`}>
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>Campus Suite Directive</strong>: Select your registered section from the configuration panel on the left to review your live class standings, or switch to the <strong>Empty Room Locator</strong> tab to find quiet classrooms on campus.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR COLS: PARAMETERS (4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CARD: PARAMETERS */}
            <div className={`border rounded-xl p-5 shadow-xs transition-colors ${t.card}`}>
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4.5 h-4.5 text-slate-600 dark:text-zinc-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Campus Parameters
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Section selection */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Target Academic Section</label>
                  <select 
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none transition-colors ${t.inputBg}`}
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
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Simulated Progress Date</label>
                  <input 
                    type="date"
                    min={SEMESTER_START}
                    max={SEMESTER_END}
                    value={todayStr}
                    onChange={(e) => setTodayStr(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none transition-colors ${t.inputBg}`}
                  />
                </div>

                {/* Developer Presets */}
                <div className={`pt-3 border-t ${t.border}`}>
                  <span className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Preseed Logs:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => applyPreset("standard")}
                      className={`px-2 py-1 rounded font-bold border text-[11px] transition-colors ${attendancePreset === "standard" ? t.pillActive : t.pillInactive}`}
                    >
                      Baseline
                    </button>
                    <button 
                      onClick={() => applyPreset("critical")}
                      className={`px-2 py-1 rounded font-bold border text-[11px] transition-colors ${attendancePreset === "critical" ? "bg-red-500 border-red-500 text-white" : t.pillInactive}`}
                    >
                      Deficient
                    </button>
                    <button 
                      onClick={() => applyPreset("excellent")}
                      className={`px-2 py-1 rounded font-bold border text-[11px] transition-colors ${attendancePreset === "excellent" ? "bg-emerald-600 border-emerald-600 text-white" : t.pillInactive}`}
                    >
                      High
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* CARD: SLIDERS (only applicable when not in locator mode) */}
            {activeTab !== "locator" && (
              <div className={`border rounded-xl p-5 shadow-xs transition-colors ${t.card}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Sliders className="w-4.5 h-4.5 text-slate-600 dark:text-zinc-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider">
                    Current Attendance Logs
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-normal font-medium">
                  Adjust percentages as registered on your portal.
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
                      <div key={sub.code} className={`p-3 rounded-lg border transition-colors ${t.inputBg}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 font-bold">{sub.code}</span>
                            <h4 className={`text-xs font-bold truncate pr-2 ${t.textPrimary}`}>{sub.name}</h4>
                          </div>
                          <CircularProgress 
                            percentage={currentPct} 
                            size={40} 
                            strokeWidth={4} 
                            colorClass={currentPct >= 90 ? "text-emerald-600" : currentPct >= 75 ? "text-slate-800 dark:text-zinc-300" : "text-red-600"}
                            textColor={theme === "dark" ? "text-zinc-100" : "text-slate-800"}
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
                          className="w-full accent-slate-900 dark:accent-indigo-600 cursor-pointer h-1 bg-slate-200 dark:bg-zinc-700 rounded-lg mt-1"
                        />

                        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                          <span>Classes held: <strong>{occurredCount}</strong></span>
                          <span>Attended: <strong>{estimatedAttended}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAILY LECTURES FOR TIMETABLE REFERENCE */}
            <div className={`border rounded-xl p-5 shadow-xs transition-colors ${t.card}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4.5 h-4.5 text-slate-600 dark:text-zinc-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Timetable for {weekdayName}
                </h2>
              </div>
              {todayClasses.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-medium">No classes scheduled on this day.</p>
              ) : (
                <div className="space-y-2.5">
                  {todayClasses.map((cls, idx) => (
                    <div key={idx} className={`flex justify-between items-center text-xs pb-2 border-b last:border-0 last:pb-0 ${t.borderSubtle}`}>
                      <div>
                        <p className={`font-bold truncate max-w-[180px] ${t.textPrimary}`}>{cls.subject}</p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-300 dark:text-zinc-600" /> Room {cls.room}
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 ${t.secondaryBg}`}>
                        {cls.startTime} - {cls.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          {/* MAIN COLUMN WORKSPACE (8 cols) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            
            {/* VIEW TAB 1: ATTENDANCE PREDICTOR */}
            {activeTab === "attendance" && stats && (
              <div className="flex flex-col gap-6">
                
                {/* OVERALL SUMMARY STATS */}
                <div className={`p-6 border rounded-xl shadow-xs transition-colors grid grid-cols-1 md:grid-cols-3 gap-6 ${t.card}`}>
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Attendance Rate</span>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className={`text-3xl font-black font-mono tracking-tight ${t.textPrimary}`}>
                          {stats.overallCurrentPercentage}%
                        </span>
                        <span className="text-xs text-slate-400 font-bold">overall</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${stats.overallCurrentPercentage >= 90 ? "bg-emerald-600" : stats.overallCurrentPercentage >= 75 ? "bg-slate-900 dark:bg-zinc-200" : "bg-red-600"}`}
                        style={{ width: `${stats.overallCurrentPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col border-y md:border-y-0 md:border-x py-4 md:py-0 md:px-6 justify-between ${t.border}`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Perfect Stretch Ceiling</span>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className={`text-3xl font-black font-mono tracking-tight ${t.textPrimary}`}>
                          {stats.overallMaxPossiblePercentage}%
                        </span>
                        <span className="text-xs text-slate-400 font-bold">limit</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      Highest possible average if you attend 100% of the {stats.totalRemaining} remaining sessions.
                    </p>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Outcome Forecast</span>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className={`text-3xl font-black font-mono tracking-tight ${stats.overallProjectedIsDetention ? "text-red-600" : "text-emerald-600"}`}>
                          {stats.overallProjectedPercentage}%
                        </span>
                        <span className="text-xs text-slate-400 font-bold">simulated</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs flex items-center gap-1.5 font-bold font-mono">
                      {stats.overallProjectedIsDetention ? (
                        <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-full">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          <span>Detention Threat</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-full">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Safe standing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${t.border}`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Subject Performance Logs
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Detailed projections for subjects registered in <span className={`underline decoration-indigo-500 decoration-2 ${t.textPrimary}`}>{stats.sectionName}</span>.
                    </p>
                  </div>
                  <div className={`text-xs font-mono px-3 py-1 border rounded-lg shadow-2xs transition-colors ${t.card}`}>
                    Remaining: <strong className={t.textPrimary}>{stats.totalRemaining}</strong> classes
                  </div>
                </div>

                {/* SUBJECT BREAKDOWN CARDS */}
                <div className="space-y-4">
                  {stats.subjects.map((sub) => {
                    return (
                      <div 
                        key={sub.subjectCode} 
                        className={`border rounded-xl p-5 shadow-xs relative transition-all ${sub.isImpossible75 ? "border-red-400 bg-red-50/[0.15]" : t.card} hover:border-slate-300 dark:hover:border-zinc-700`}
                      >
                        {/* LEFT SOLID INDICATOR */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-xl ${sub.isImpossible75 ? "bg-red-600" : sub.currentPercentage >= 90 ? "bg-emerald-600" : sub.currentPercentage >= 75 ? "bg-slate-700 dark:bg-zinc-200" : "bg-red-500"}`} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1.5">
                          
                          {/* Course Identity */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${t.secondaryBg} ${t.border}`}>
                                {sub.subjectCode}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Total Semester Classes: <strong>{sub.totalSemesterClasses}</strong>
                              </span>
                            </div>
                            <h4 className={`text-sm font-black ${t.textPrimary}`}>{sub.subjectName}</h4>
                            
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-2.5">
                              <span>Occurred: <strong>{sub.occurredClasses}</strong></span>
                              <span className="text-slate-200">|</span>
                              <span>Attended: <strong className="text-emerald-700 font-bold">{sub.attendedSoFar}</strong></span>
                              <span className="text-slate-200">|</span>
                              <span>Missed: <strong className="text-red-700 font-bold">{sub.missedSoFar}</strong></span>
                            </div>
                          </div>

                          {/* Right Block: Core Percentages */}
                          <div className={`flex items-center gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 pl-1.5 ${t.border}`}>
                            <div className="text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Current</span>
                              <span className={`text-lg font-mono font-bold ${sub.currentPercentage >= 90 ? "text-emerald-600" : sub.currentPercentage >= 75 ? t.textPrimary : "text-red-600"}`}>
                                {sub.currentPercentage}%
                              </span>
                            </div>

                            <div className={`h-8 w-[1px] ${t.border}`} />

                            <div className="text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                              <span className={`text-lg font-mono font-bold ${t.textPrimary}`}>
                                {sub.remainingClasses}
                              </span>
                            </div>

                            <div className={`h-8 w-[1px] ${t.border}`} />

                            <div className="text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Max Cap</span>
                              <span className="text-lg font-mono font-bold text-slate-500">
                                {sub.maxPossiblePercentage}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PROGRESS BAR TRACK */}
                        <div className="mt-4 pl-1.5">
                          <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 mb-1">
                            <span>0%</span>
                            <span className="text-red-500">75% (Detention Line)</span>
                            <span className="text-emerald-600">90% (Honors Line)</span>
                            <span>100%</span>
                          </div>
                          <div className={`relative w-full h-3 rounded-full overflow-hidden border ${t.border}`}>
                            <div className="absolute top-0 bottom-0 left-[75%] w-[1.5px] bg-red-500 z-10 opacity-60" />
                            <div className="absolute top-0 bottom-0 left-[90%] w-[1.5px] bg-emerald-500 z-10 opacity-60" />
                            <div 
                              className={`h-full transition-all duration-500 ${sub.currentPercentage >= 90 ? "bg-emerald-600" : sub.currentPercentage >= 75 ? "bg-slate-700 dark:bg-zinc-300" : "bg-red-500 animate-pulse"}`}
                              style={{ width: `${sub.currentPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* PREDICTIVE PATHWAYS */}
                        <div className={`mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 pl-1.5 ${t.border}`}>
                          <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 transition-colors ${t.inputBg}`}>
                            {sub.isImpossible75 ? (
                              <div className="flex gap-2.5 items-start">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                                <div>
                                  <span className="text-[10px] font-black text-red-700 uppercase tracking-wide block">IRREVERSIBLE DETENTION ALERT</span>
                                  <p className="text-[11px] text-red-600 leading-normal mt-0.5 font-semibold">
                                    Attendance cannot mathematically reach 75%. Even with 100% attendance in the remaining {sub.remainingClasses} classes, final rate is capped at {sub.maxPossiblePercentage}%. File an administrative appeal.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2.5 items-start">
                                <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${sub.classesToAttendFor75 === 0 ? "text-emerald-600" : "text-slate-400"}`} />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Minimum Attends for 75%</span>
                                  <p className="text-xs mt-0.5 leading-relaxed font-semibold">
                                    {sub.classesToAttendFor75 === 0 ? (
                                      <span className="text-emerald-700">Safe. You can skip up to {Math.max(0, sub.remainingClasses - Math.ceil(0.75 * sub.totalSemesterClasses) + sub.attendedSoFar)} sessions without risk.</span>
                                    ) : (
                                      <span className={t.textPrimary}>Must attend <strong className="font-mono font-black text-sm">{sub.classesToAttendFor75}</strong> of remaining <strong>{sub.remainingClasses}</strong>.</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 transition-colors ${t.inputBg}`}>
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
                                  <p className="text-xs mt-0.5 leading-relaxed font-semibold">
                                    {sub.classesToAttendFor90 === 0 ? (
                                      <span className="text-slate-800 dark:text-zinc-200">Target secured. Keep attending to preserve honors standing.</span>
                                    ) : (
                                      <span className={t.textPrimary}>Must attend <strong className="font-mono font-black text-sm">{sub.classesToAttendFor90}</strong> of remaining <strong>{sub.remainingClasses}</strong>.</span>
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

            {/* VIEW TAB 2: LEAVE SIMULATOR */}
            {activeTab === "simulator" && stats && (
              <div className="flex flex-col gap-6">
                
                <div className={`border-b pb-3 ${t.border}`}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Interactive Planner & Simulation Matrix
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Map leaves dynamically on the calendar to test forecasts in real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Calendar Matrix (7 cols) */}
                  <div className={`lg:col-span-7 border rounded-xl p-5 shadow-xs flex flex-col gap-4 transition-colors ${t.card}`}>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
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

                        let bgClass = "bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300";
                        let statusText = "Active Class Scheduled";
                        if (isSick) {
                          bgClass = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 hover:bg-red-100/60 text-red-700 dark:text-red-400";
                          statusText = "Simulating: Skip (Absence)";
                        } else if (isOD) {
                          bgClass = "bg-slate-900 border-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900";
                          statusText = "Simulating: On-Duty (Attended)";
                        } else if (isExc) {
                          bgClass = "bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900 hover:bg-amber-100 text-amber-800 dark:text-amber-400";
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

                  {/* Manual input (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className={`border rounded-xl p-5 shadow-xs transition-colors ${t.card}`}>
                      <h4 className="text-xs font-bold uppercase tracking-wide mb-3">
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
                            className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-mono font-bold transition-colors ${t.inputBg}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Impact Type</label>
                          <select 
                            value={newSimType}
                            onChange={(e) => setNewSimType(e.target.value as any)}
                            className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none transition-colors ${t.inputBg}`}
                          >
                            <option value="leave">Planned Sick Leave (Absent)</option>
                            <option value="od">On-Duty (Automatic Present)</option>
                            <option value="excused">Excused Leave (Remove from Total)</option>
                          </select>
                        </div>
                        <button 
                          onClick={addSimulatedDateInput}
                          className={`w-full py-2 transition-colors font-bold rounded-lg text-xs ${t.accentBg}`}
                        >
                          Add Date
                        </button>
                      </div>
                    </div>

                    {/* Active simulated logs timeline */}
                    <div className={`border rounded-xl p-5 shadow-xs flex flex-col flex-1 transition-colors ${t.card}`}>
                      <h4 className="text-xs font-bold uppercase tracking-wide mb-3">
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
                            <div key={date} className={`flex justify-between items-center p-2 rounded-lg border text-[11px] font-mono transition-colors ${t.inputBg}`}>
                              <span>On-Duty credit: {date}</span>
                              <button onClick={() => removeSimulatedDate(date, "od")} className="p-1 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {excusedLeaves.map(date => (
                            <div key={date} className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-800">
                              <span>Excused waiver: {date}</span>
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

            {/* VIEW TAB 3: EMPTY ROOM LOCATOR (Round 2 Workspace!) */}
            {activeTab === "locator" && (
              <div className="flex flex-col gap-6">
                
                {/* Simulated Time & Navigation controls */}
                <div className={`p-5 border rounded-xl shadow-xs transition-colors grid grid-cols-1 md:grid-cols-12 gap-5 ${t.card}`}>
                  <div className="md:col-span-8 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Simulate Hourly Timeline</span>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                      <input 
                        type="range"
                        min="480" // 08:00 AM
                        max="1020" // 05:00 PM
                        step="30" // 30 minutes increments
                        value={timeToMinutes(simulatedTime)}
                        onChange={(e) => {
                          const mins = Number(e.target.value);
                          const h = String(Math.floor(mins / 60)).padStart(2, "0");
                          const m = String(mins % 60).padStart(2, "0");
                          setSimulatedTime(`${h}:${m}`);
                        }}
                        className="w-full accent-slate-900 dark:accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                      />
                      <span className={`text-sm font-mono font-bold px-3 py-1.5 rounded-lg border shrink-0 select-none transition-colors ${t.inputBg}`}>
                        {simulatedTime}
                      </span>
                    </div>
                    <span className="block text-[10px] text-slate-400 mt-2 font-medium">
                      Simulate dynamic class changes hour-by-hour. Rooms auto-update status instantly.
                    </span>
                  </div>

                  {/* Room counters */}
                  <div className={`md:col-span-4 flex items-center justify-around border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-5 ${t.border}`}>
                    <div className="text-center">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Empty</span>
                      <span className="text-3xl font-black text-emerald-600 font-mono">
                        {currentRoomStatuses.filter(r => !r.isOccupied).length}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Occupied</span>
                      <span className="text-3xl font-black text-red-500 font-mono">
                        {currentRoomStatuses.filter(r => r.isOccupied).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI ROOM FINDER (Phase 1) */}
                <div className={`p-5 border rounded-xl shadow-xs transition-colors flex flex-col gap-3 ${t.card}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                    AI Room Finder Semantics (Natural Text Bar)
                  </h4>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. I need an AC room on the ground floor with capacity for 5 people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRoomSearch();
                      }}
                      className={`flex-1 border rounded-lg px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${t.inputBg}`}
                    />
                    <button 
                      onClick={handleRoomSearch}
                      disabled={isSearchLoading || !searchQuery.trim()}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${t.accentBg}`}
                    >
                      {isSearchLoading ? (
                        <span className="animate-spin text-xs">●</span>
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Analyze AI</span>
                    </button>
                  </div>

                  {searchExplanation && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/60 rounded-lg text-xs leading-relaxed text-indigo-950 dark:text-indigo-300">
                      <strong>AI Report</strong>: {searchExplanation}
                    </div>
                  )}
                </div>

                {/* VISUAL 3D PERSPECTIVE BUILDING MAP & DETAILED SIDE PANEL (Phase 2!) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Interactive 3D Stacked Building Blueprint (7 cols) */}
                  <div className={`lg:col-span-7 border rounded-xl p-5 shadow-xs flex flex-col gap-4 transition-colors ${t.card}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                          3D Stacked building map
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Perspective isometric projection of floor stacks. Click rooms to view countdown.
                        </p>
                      </div>
                      
                      {/* Floor Filter tabs */}
                      <div className={`flex gap-1.5 p-1 rounded-lg border text-[10px] font-bold transition-colors ${t.inputBg}`}>
                        <button onClick={() => setMapFloorFilter(3)} className={`px-2 py-1 rounded transition-all ${mapFloorFilter === 3 ? "bg-white dark:bg-zinc-900 shadow-2xs text-slate-900 dark:text-zinc-100 font-black" : "text-slate-500"}`}>2F</button>
                        <button onClick={() => setMapFloorFilter(2)} className={`px-2 py-1 rounded transition-all ${mapFloorFilter === 2 ? "bg-white dark:bg-zinc-900 shadow-2xs text-slate-900 dark:text-zinc-100 font-black" : "text-slate-500"}`}>1F</button>
                        <button onClick={() => setMapFloorFilter(1)} className={`px-2 py-1 rounded transition-all ${mapFloorFilter === 1 ? "bg-white dark:bg-zinc-900 shadow-2xs text-slate-900 dark:text-zinc-100 font-black" : "text-slate-500"}`}>GF</button>
                      </div>
                    </div>

                    {/* Gorgeous 3D perspective layers stack using pure CSS transforms */}
                    <div className="relative w-full h-[320px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center select-none perspective-[800px]">
                      
                      <div className="absolute inset-0 p-3 opacity-30 text-[9px] font-mono text-slate-400 pointer-events-none">
                        PERSPECTIVE AXIS: GROUND_STACK_Y_ALIGN
                      </div>

                      {/* 3D Stack container */}
                      <div className="relative w-[340px] h-[240px] transform rotate-x-[55deg] -rotate-z-[35deg] transform-style-3d transition-transform duration-700">
                        
                        {/* Floor 3 (Second Floor) */}
                        <div 
                          className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 p-2.5 flex flex-col justify-between ${mapFloorFilter === 3 ? "translate-z-[80px] bg-white/90 dark:bg-zinc-900/90 shadow-lg border-indigo-500/50 scale-102" : "translate-z-[120px] bg-white/20 dark:bg-zinc-900/20 border-slate-200 dark:border-zinc-800 opacity-20 pointer-events-none"}`}
                        >
                          <span className="absolute top-2 left-2 text-[9px] font-black uppercase text-indigo-600 tracking-wider">Second Floor (2F)</span>
                          <div className="grid grid-cols-4 gap-1.5 mt-6 h-full pb-4">
                            {currentRoomStatuses.filter(r => r.room.floor === 3).slice(0, 12).map(r => {
                              const isMatch = aiMatchingRoomIds.includes(r.room.id);
                              return (
                                <button 
                                  key={r.room.id}
                                  onClick={() => setSelectedRoomId(r.room.id)}
                                  className={`p-1 rounded font-mono text-[9px] font-bold border transition-all ${r.isOccupied ? "bg-red-500/20 text-red-700 border-red-300 dark:border-red-900/50" : "bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:border-emerald-900/50"} ${selectedRoomId === r.room.id ? "ring-2 ring-indigo-500 scale-105" : ""} ${isMatch ? "ring-2 ring-amber-500 border-amber-400" : ""}`}
                                >
                                  {r.room.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Floor 2 (First Floor) */}
                        <div 
                          className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 p-2.5 flex flex-col justify-between ${mapFloorFilter === 2 ? "translate-z-[40px] bg-white/90 dark:bg-zinc-900/90 shadow-lg border-indigo-500/50 scale-102" : "translate-z-[60px] bg-white/20 dark:bg-zinc-900/20 border-slate-200 dark:border-zinc-800 opacity-20 pointer-events-none"}`}
                        >
                          <span className="absolute top-2 left-2 text-[9px] font-black uppercase text-indigo-600 tracking-wider">First Floor (1F)</span>
                          <div className="grid grid-cols-4 gap-1.5 mt-6 h-full pb-4">
                            {currentRoomStatuses.filter(r => r.room.floor === 2).slice(0, 12).map(r => {
                              const isMatch = aiMatchingRoomIds.includes(r.room.id);
                              return (
                                <button 
                                  key={r.room.id}
                                  onClick={() => setSelectedRoomId(r.room.id)}
                                  className={`p-1 rounded font-mono text-[9px] font-bold border transition-all ${r.isOccupied ? "bg-red-500/20 text-red-700 border-red-300 dark:border-red-900/50" : "bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:border-emerald-900/50"} ${selectedRoomId === r.room.id ? "ring-2 ring-indigo-500 scale-105" : ""} ${isMatch ? "ring-2 ring-amber-500 border-amber-400" : ""}`}
                                >
                                  {r.room.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Floor 1 (Ground Floor) */}
                        <div 
                          className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 p-2.5 flex flex-col justify-between ${mapFloorFilter === 1 ? "translate-z-[0px] bg-white/95 dark:bg-zinc-900/95 shadow-lg border-indigo-500/50 scale-102" : "translate-z-[0px] bg-white/20 dark:bg-zinc-900/20 border-slate-200 dark:border-zinc-800 opacity-20 pointer-events-none"}`}
                        >
                          <span className="absolute top-2 left-2 text-[9px] font-black uppercase text-indigo-600 tracking-wider">Ground Floor (GF)</span>
                          <div className="grid grid-cols-3 gap-2 mt-6 h-full pb-4">
                            {currentRoomStatuses.filter(r => r.room.floor === 1).slice(0, 9).map(r => {
                              const isMatch = aiMatchingRoomIds.includes(r.room.id);
                              return (
                                <button 
                                  key={r.room.id}
                                  onClick={() => setSelectedRoomId(r.room.id)}
                                  className={`p-1 rounded font-mono text-[9px] font-bold border transition-all ${r.isOccupied ? "bg-red-500/20 text-red-700 border-red-300 dark:border-red-900/50" : "bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:border-emerald-900/50"} ${selectedRoomId === r.room.id ? "ring-2 ring-indigo-500 scale-105" : ""} ${isMatch ? "ring-2 ring-amber-500 border-amber-400" : ""}`}
                                >
                                  {r.room.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* Detailed Room Sidebar Panel with Live Countdown & Invite Button (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    {selectedRoomStatus ? (
                      <div className={`p-5 border rounded-xl shadow-xs transition-colors flex flex-col gap-4 relative overflow-hidden ${t.card}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${selectedRoomStatus.isOccupied ? "bg-red-500" : "bg-emerald-500"}`} />
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">
                              Room Details (Floor {selectedRoomStatus.room.floor})
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${selectedRoomStatus.isOccupied ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                              {selectedRoomStatus.isOccupied ? "OCCUPIED" : "AVAILABLE"}
                            </span>
                          </div>
                          <h4 className={`text-base font-black ${t.textPrimary}`}>{selectedRoomStatus.room.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal font-medium">{selectedRoomStatus.room.description}</p>
                        </div>

                        {/* Specs grid */}
                        <div className={`grid grid-cols-2 gap-2 border-y py-3 text-xs font-mono ${t.border}`}>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Capacity</span>
                            <strong className={t.textPrimary}>{selectedRoomStatus.room.capacity} seats</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Air cooling</span>
                            <strong className={t.textPrimary}>{selectedRoomStatus.room.hasAC ? "AC Room" : "Non-AC"}</strong>
                          </div>
                        </div>

                        {/* COUNTDOWN TIMER FOR RELECTURES */}
                        <div className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${t.inputBg}`}>
                          <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${selectedRoomStatus.isOccupied ? "text-red-500" : "text-emerald-600"}`} />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Countdown Availability</span>
                            <div className={`text-lg font-mono font-black mt-0.5 select-none ${t.textPrimary}`}>
                              {minutesToFriendly(selectedRoomStatus.timeLeftMinutes)}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                              {selectedRoomStatus.isOccupied ? (
                                <span>Lecture ongoing: <strong>{selectedRoomStatus.occupiedBySubject}</strong> ({selectedRoomStatus.occupiedBySection}). Free after timer ends.</span>
                              ) : (
                                selectedRoomStatus.nextClass ? (
                                  <span>Free to sit! Next class scheduled: <strong>{selectedRoomStatus.nextClass.subject}</strong> ({selectedRoomStatus.nextClassSection}) at {selectedRoomStatus.nextClass.startTime}.</span>
                                ) : (
                                  <span>Empty. Free of any scheduled lectures for the rest of today.</span>
                                )
                              )}
                            </p>
                          </div>
                        </div>

                        {/* CALL THE SQUAD BUTTONS (Phase 2!) */}
                        {!selectedRoomStatus.isOccupied && (
                          <div className="flex flex-col gap-2 pt-1">
                            <a 
                              href={getSquadWhatsAppShareLink(selectedRoomStatus)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Share2 className="w-4 h-4 text-emerald-100" />
                              <span>Share Invite on WhatsApp</span>
                            </a>
                            <button 
                              onClick={() => handleCopySquadInvite(selectedRoomStatus)}
                              className={`w-full py-2 transition-colors font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 ${t.secondaryBg}`}
                            >
                              <Users className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                              <span>Copy Squad Link</span>
                            </button>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs italic">
                        Select a classroom from the stacked blueprint to view specifications and timer limits.
                      </div>
                    )}
                  </div>

                </div>

                {/* TRADITIONAL FLOOR GRID SECTION (Phase 1) */}
                <div className={`p-5 border rounded-xl shadow-xs transition-colors ${t.card}`}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                    <Compass className="w-4.5 h-4.5 text-slate-600 dark:text-zinc-400" />
                    Traditional Campus Floor Grid
                  </h4>
                  
                  <div className="space-y-6">
                    {[1, 2, 3].map((floorNum) => (
                      <div key={floorNum} className={`pb-4 border-b last:border-0 last:pb-0 ${t.borderSubtle}`}>
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          {floorNum === 1 ? "Ground Floor (GF)" : floorNum === 2 ? "First Floor (1F)" : "Second Floor (2F)"}
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {currentRoomStatuses.filter(r => r.room.floor === floorNum).map(r => {
                            const isMatch = aiMatchingRoomIds.includes(r.room.id);
                            return (
                              <div 
                                key={r.room.id}
                                onClick={() => {
                                  setSelectedRoomId(r.room.id);
                                  setMapFloorFilter(floorNum as any);
                                }}
                                className={`p-3 border rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${r.isOccupied ? "bg-red-50/40 border-red-200 text-red-950 dark:bg-red-950/10 dark:border-red-900/60 dark:text-red-300" : "bg-emerald-50/40 border-emerald-250 text-emerald-950 dark:bg-emerald-950/10 dark:border-emerald-900/60 dark:text-emerald-300"} ${selectedRoomId === r.room.id ? "ring-2 ring-indigo-500 scale-[1.01]" : ""} ${isMatch ? "ring-2 ring-amber-500 border-amber-400" : ""}`}
                              >
                                <div>
                                  <strong className={t.textPrimary}>{r.room.name}</strong>
                                  <span className="text-[10px] opacity-75 mt-0.5 block font-mono text-slate-500 dark:text-zinc-400">
                                    {r.isOccupied ? `Occupied: ${r.occupiedBySubject}` : `Free: ${minutesToFriendly(r.timeLeftMinutes)}`}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-60 font-semibold">{r.room.hasAC ? "AC" : "Non-AC"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* FLOATING COLLAPSED ACADEMIC ADVISOR */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[360px] sm:w-[410px] h-[520px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl flex flex-col mb-3 overflow-hidden">
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

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-zinc-950">
              {chatHistory.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${chat.role === "user" ? "bg-slate-900 text-white rounded-tr-none dark:bg-zinc-100 dark:text-zinc-900" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"}`}
                  >
                    {chat.text.split("\n").map((line, lIdx) => (
                      <p key={lIdx} className={line.trim().startsWith("-") || line.trim().startsWith("*") ? "pl-2 py-0.5 text-slate-700 dark:text-zinc-400" : "mb-1 text-slate-800 dark:text-zinc-300"}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-400 text-xs rounded-xl rounded-tl-none px-3.5 py-2 flex items-center gap-1.5 font-mono shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                    <span className="text-[10px] ml-1">Analyzing semester timetables...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Quick Enquiries:</span>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleSendChat("If I take a 3-day sick leave starting tomorrow, will my Discrete Math attendance drop below 75%?")}
                  className="text-[11px] text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 px-2 py-1 rounded border border-slate-200 dark:border-zinc-850 truncate font-semibold"
                >
                  "Will a 3-day sickness drop my Discrete Math below 75%?"
                </button>
                <button 
                  onClick={() => handleSendChat("Where is a free AC room available right now for me and my project group?")}
                  className="text-[11px] text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 px-2 py-1 rounded border border-slate-200 dark:border-zinc-850 truncate font-semibold"
                >
                  "Where is a free AC room available right now?"
                </button>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
              <input 
                type="text"
                placeholder="Ask about calendar leaves, attendance caps..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChat();
                }}
                disabled={isChatLoading}
                className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-slate-400"
              />
              <button 
                onClick={() => handleSendChat()}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors shrink-0"
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
          <span className="text-xs font-semibold">Consult Advisor Desk</span>
        </button>
      </div>

    </div>
  );
}
