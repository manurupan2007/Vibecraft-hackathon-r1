import { SECTIONS, HOLIDAYS, SEMESTER_START, SEMESTER_END, TimetableEntry } from "../data/timetables";

export interface SubjectStats {
  subjectName: string;
  subjectCode: string;
  totalSemesterClasses: number;
  occurredClasses: number;
  remainingClasses: number;
  attendedSoFar: number;
  missedSoFar: number;
  currentPercentage: number;
  // Predictions
  classesToAttendFor75: number;
  classesToAttendFor90: number;
  maxPossiblePercentage: number;
  isImpossible75: boolean;
  isImpossible90: boolean;
  
  // Future Planning / Simulation stats
  classesOccurredInPlanPeriod: number;
  plannedAttendedInPlanPeriod: number;
  plannedMissedInPlanPeriod: number;
  finalProjectedPercentage: number;
  finalProjectedIsDetention: boolean;
}

export interface SemesterStats {
  sectionName: string;
  totalClassesSemester: number;
  totalOccurredSoFar: number;
  totalRemaining: number;
  overallCurrentPercentage: number;
  overallMaxPossiblePercentage: number;
  overallProjectedPercentage: number;
  overallProjectedIsDetention: boolean;
  subjects: SubjectStats[];
}

// Convert "YYYY-MM-DD" string to Local Date
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Format Date to "YYYY-MM-DD"
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to check if a date is a holiday
export function isHoliday(dateStr: string): boolean {
  return HOLIDAYS.includes(dateStr);
}

// Get day of week (0 = Sunday, 1 = Monday, etc.)
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Calculates complete attendance metrics and simulations for a given section.
 * @param sectionId ID of the section (e.g. "cse-a")
 * @param currentPercentages Object mapping subject codes to current attendance percentages
 * @param todayStr Simulated "Today's Date" (YYYY-MM-DD)
 * @param preferredFutureDate Simulated "Planning Future Date" (YYYY-MM-DD)
 * @param generalLeaves Dates (YYYY-MM-DD) where the student is absent (general leave)
 * @param odDays Dates (YYYY-MM-DD) where the student is On-Duty (counted as attended)
 * @param excusedLeaves Dates (YYYY-MM-DD) where student has excused/medical leave (not counted in total)
 */
export function calculateAttendanceStats(
  sectionId: string,
  currentPercentages: { [subjectCode: string]: number },
  todayStr: string,
  preferredFutureDate?: string,
  generalLeaves: string[] = [],
  odDays: string[] = [],
  excusedLeaves: string[] = []
): SemesterStats | null {
  const section = SECTIONS.find(s => s.id === sectionId);
  if (!section) return null;

  const start = parseLocalDate(SEMESTER_START);
  const end = parseLocalDate(SEMESTER_END);
  const today = parseLocalDate(todayStr);
  const futureDate = preferredFutureDate ? parseLocalDate(preferredFutureDate) : null;

  // 1. Map out all dates in the semester
  const semesterDates: string[] = [];
  let tempDate = new Date(start);
  while (tempDate <= end) {
    semesterDates.push(formatLocalDate(tempDate));
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // 2. Map of scheduled classes for each subject
  const subjectTotalClasses: { [subjectName: string]: number } = {};
  const subjectOccurredClasses: { [subjectName: string]: number } = {};
  const subjectRemainingClasses: { [subjectName: string]: number } = {};
  
  // Specific counts for planning period (from today + 1 to futureDate)
  const subjectPlanningClasses: { [subjectName: string]: number } = {};
  // Specific counts post planning period (from futureDate + 1 to end)
  const subjectPostPlanningClasses: { [subjectName: string]: number } = {};

  // Initialize
  section.subjects.forEach(sub => {
    subjectTotalClasses[sub.name] = 0;
    subjectOccurredClasses[sub.name] = 0;
    subjectRemainingClasses[sub.name] = 0;
    subjectPlanningClasses[sub.name] = 0;
    subjectPostPlanningClasses[sub.name] = 0;
  });

  // Count class occurrences
  semesterDates.forEach(dateStr => {
    if (isHoliday(dateStr)) return;

    const dateObj = parseLocalDate(dateStr);
    const dayOfWeek = getDayOfWeek(dateObj);
    const classes = section.schedule[dayOfWeek] || [];

    classes.forEach(cls => {
      if (subjectTotalClasses[cls.subject] !== undefined) {
        subjectTotalClasses[cls.subject]++;
        
        // Is it occurred (<= today)?
        if (dateStr <= todayStr) {
          subjectOccurredClasses[cls.subject]++;
        } else {
          subjectRemainingClasses[cls.subject]++;
        }

        // Planning splits
        if (futureDate && dateStr > todayStr && dateStr <= preferredFutureDate!) {
          subjectPlanningClasses[cls.subject]++;
        } else if (futureDate && dateStr > preferredFutureDate!) {
          subjectPostPlanningClasses[cls.subject]++;
        }
      }
    });
  });

  // Compute stats for each subject
  const subjectsStats: SubjectStats[] = section.subjects.map(sub => {
    const subName = sub.name;
    const subCode = sub.code;
    
    const total = subjectTotalClasses[subName] || 0;
    const occurred = subjectOccurredClasses[subName] || 0;
    const remaining = subjectRemainingClasses[subName] || 0;
    
    // User input current percentage
    const currentPercent = currentPercentages[subCode] ?? 75;

    // Standard attended so far:
    // If no classes occurred yet, default to 0
    let attended = occurred > 0 ? Math.round((currentPercent * occurred) / 100) : 0;
    let missed = occurred - attended;

    // Apply OD and Medical/General Leave simulations on OCCURRED classes:
    // Some OD days or Leave days might have been inputted by the user.
    // If they input an OD day in the past (occurred), we make sure those classes are marked as attended.
    // To avoid double-counting or inconsistency, we let the user simulator apply to the FUTURE.
    // Let's count future OD/Leaves and see how they affect the projection!
    // But what about the current actual attendance?
    // Let's assume the user enters current attendance *before* simulator.
    // Then they simulate leaves/OD starting from "tomorrow" (today + 1).

    // Let's find how many classes are scheduled for this subject on:
    // - General Leave Days (Absences)
    // - On-Duty (OD) Days
    // - Excused Leaves (Medical)
    
    let simulatedFutureAttended = 0;
    let simulatedFutureMissed = 0;
    let simulatedExcusedClasses = 0;

    // Iterate through all remaining days (future) and apply OD / General Leave / Excused rules
    semesterDates.forEach(dateStr => {
      if (dateStr <= todayStr) return; // Only simulate the future
      if (isHoliday(dateStr)) return;

      const dateObj = parseLocalDate(dateStr);
      const dayOfWeek = getDayOfWeek(dateObj);
      const classes = section.schedule[dayOfWeek] || [];

      const hasClass = classes.some(cls => cls.subject === subName);
      if (!hasClass) return;

      if (odDays.includes(dateStr)) {
        // OD counts as ATTENDED
        simulatedFutureAttended++;
      } else if (generalLeaves.includes(dateStr)) {
        // General Leave counts as MISSED
        simulatedFutureMissed++;
      } else if (excusedLeaves.includes(dateStr)) {
        // Excused / Medical Leave: removes class from total classes count!
        simulatedExcusedClasses++;
      } else {
        // Default assumption for future classes: assume student attends them to see target requirements,
        // or for projected final percentage, let's assume they attend them unless they input leave.
        // Let's assume they attend by default so we show the projected final percentage if they attend everything else!
        simulatedFutureAttended++; 
      }
    });

    // Recalculate semester total with Excused Leaves removed
    const finalTotalSemesterClasses = total - simulatedExcusedClasses;
    const finalRemainingClasses = remaining - simulatedExcusedClasses;

    // Remaining classes to attend to reach 75% target:
    // We need (attended + R_75) / finalTotalSemesterClasses >= 0.75
    // R_75 must be between 0 and finalRemainingClasses
    const target75Count = Math.ceil(0.75 * finalTotalSemesterClasses);
    const classesToAttendFor75 = Math.max(0, target75Count - attended);
    const isImpossible75 = classesToAttendFor75 > finalRemainingClasses;

    // Remaining classes to attend to reach 90% target:
    const target90Count = Math.ceil(0.90 * finalTotalSemesterClasses);
    const classesToAttendFor90 = Math.max(0, target90Count - attended);
    const isImpossible90 = classesToAttendFor90 > finalRemainingClasses;

    // Max possible percentage (if student attends ALL remaining non-excused classes)
    const maxPossiblePercentage = finalTotalSemesterClasses > 0 
      ? Math.min(100, Math.round(((attended + finalRemainingClasses) / finalTotalSemesterClasses) * 1000) / 10)
      : 100;

    // Final projected percentage based on the simulator (attended so far + simulated future attended)
    const totalProjectedAttended = attended + simulatedFutureAttended;
    const finalProjectedPercentage = finalTotalSemesterClasses > 0
      ? Math.round((totalProjectedAttended / finalTotalSemesterClasses) * 1000) / 10
      : 100;
    const finalProjectedIsDetention = finalProjectedPercentage < 75;

    // Planning period stats
    let classesOccurredInPlanPeriod = 0;
    let plannedAttendedInPlanPeriod = 0;
    let plannedMissedInPlanPeriod = 0;

    if (futureDate) {
      semesterDates.forEach(dateStr => {
        if (dateStr <= todayStr || dateStr > preferredFutureDate!) return;
        if (isHoliday(dateStr)) return;

        const dateObj = parseLocalDate(dateStr);
        const dayOfWeek = getDayOfWeek(dateObj);
        const classes = section.schedule[dayOfWeek] || [];

        const hasClass = classes.some(cls => cls.subject === subName);
        if (!hasClass) return;

        classesOccurredInPlanPeriod++;
        if (odDays.includes(dateStr)) {
          plannedAttendedInPlanPeriod++;
        } else if (generalLeaves.includes(dateStr)) {
          plannedMissedInPlanPeriod++;
        } else if (excusedLeaves.includes(dateStr)) {
          // Excused doesn't count as occurred in the calculations
        } else {
          // Assume attended in planning
          plannedAttendedInPlanPeriod++;
        }
      });
    }

    return {
      subjectName: subName,
      subjectCode: subCode,
      totalSemesterClasses: finalTotalSemesterClasses,
      occurredClasses: occurred,
      remainingClasses: finalRemainingClasses,
      attendedSoFar: attended,
      missedSoFar: missed,
      currentPercentage: currentPercent,
      // Predictions
      classesToAttendFor75,
      classesToAttendFor90,
      maxPossiblePercentage,
      isImpossible75,
      isImpossible90,
      // Simulator splits
      classesOccurredInPlanPeriod,
      plannedAttendedInPlanPeriod,
      plannedMissedInPlanPeriod,
      finalProjectedPercentage,
      finalProjectedIsDetention
    };
  });

  // Calculate overall semester-wide stats
  const totalClassesSemester = subjectsStats.reduce((acc, s) => acc + s.totalSemesterClasses, 0);
  const totalOccurredSoFar = subjectsStats.reduce((acc, s) => acc + s.occurredClasses, 0);
  const totalRemaining = subjectsStats.reduce((acc, s) => acc + s.remainingClasses, 0);
  
  const totalAttendedSoFar = subjectsStats.reduce((acc, s) => acc + s.attendedSoFar, 0);
  const overallCurrentPercentage = totalOccurredSoFar > 0
    ? Math.round((totalAttendedSoFar / totalOccurredSoFar) * 1000) / 10
    : 100;

  const totalMaxPossibleAttended = subjectsStats.reduce((acc, s) => acc + s.attendedSoFar + s.remainingClasses, 0);
  const overallMaxPossiblePercentage = totalClassesSemester > 0
    ? Math.round((totalMaxPossibleAttended / totalClassesSemester) * 1000) / 10
    : 100;

  // Simulator overall projected
  const totalProjectedAttendedOverall = subjectsStats.reduce((acc, s) => acc + s.attendedSoFar + (s.totalSemesterClasses - s.occurredClasses - s.plannedMissedInPlanPeriod), 0); // Note: future defaults to attended unless missed in plan
  // Wait, let's sum up the exact simulated future attended for each subject:
  const totalSimulatedProjectedAttended = subjectsStats.reduce((acc, s) => {
    // For each subject, the projected attended is: attendedSoFar + futureAttended
    // Where futureAttended is remaining classes minus simulated missed (general leaves)
    // Wait, let's calculate it directly:
    // For each subject:
    let subSimFutureAttended = 0;
    semesterDates.forEach(dateStr => {
      if (dateStr <= todayStr) return;
      if (isHoliday(dateStr)) return;

      const dateObj = parseLocalDate(dateStr);
      const dayOfWeek = getDayOfWeek(dateObj);
      const classes = section.schedule[dayOfWeek] || [];

      const hasClass = classes.some(cls => cls.subject === s.subjectName);
      if (!hasClass) return;

      if (odDays.includes(dateStr)) {
        subSimFutureAttended++;
      } else if (generalLeaves.includes(dateStr)) {
        // missed
      } else if (excusedLeaves.includes(dateStr)) {
        // excused, not counted
      } else {
        subSimFutureAttended++; // attended by default
      }
    });
    return acc + s.attendedSoFar + subSimFutureAttended;
  }, 0);

  const overallProjectedPercentage = totalClassesSemester > 0
    ? Math.round((totalSimulatedProjectedAttended / totalClassesSemester) * 1000) / 10
    : 100;

  const overallProjectedIsDetention = subjectsStats.some(s => s.finalProjectedIsDetention);

  return {
    sectionName: section.name,
    totalClassesSemester,
    totalOccurredSoFar,
    totalRemaining,
    overallCurrentPercentage,
    overallMaxPossiblePercentage,
    overallProjectedPercentage,
    overallProjectedIsDetention,
    subjects: subjectsStats
  };
}
