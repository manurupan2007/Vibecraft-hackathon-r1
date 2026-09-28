import { SECTIONS, HOLIDAYS, TimetableEntry } from "../data/timetables";
import { parseLocalDate, formatLocalDate, getDayOfWeek } from "../utils/attendance";
import { ROOMS, RoomDetails } from "../data/rooms";

export interface RoomOccupancyStatus {
  room: RoomDetails;
  isOccupied: boolean;
  occupiedBySubject: string | null;
  occupiedBySection: string | null;
  currentClass: TimetableEntry | null;
  nextClass: TimetableEntry | null;
  nextClassSection: string | null;
  timeLeftMinutes: number; // minutes left of current state (occupied or free)
  isHolidayToday: boolean;
}

// Helper to convert "HH:MM" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper to convert minutes from midnight to "HH:MM" or "H hr M min"
export function minutesToFriendly(totalMinutes: number): string {
  if (totalMinutes === Infinity || totalMinutes === -1) return "Rest of day";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours} hr ${mins} min`;
}

/**
 * Calculates current occupation status for every single room at a given simulated date and time.
 */
export function getCampusRoomStatus(dateStr: string, timeStr: string): RoomOccupancyStatus[] {
  const isHol = HOLIDAYS.includes(dateStr);
  const dateObj = parseLocalDate(dateStr);
  const dayOfWeek = getDayOfWeek(dateObj);
  const currentMinutes = timeToMinutes(timeStr);

  return ROOMS.map(room => {
    // If holiday or weekend (Sunday = 0), all rooms are completely empty
    if (isHol || dayOfWeek === 0) {
      return {
        room,
        isOccupied: false,
        occupiedBySubject: null,
        occupiedBySection: null,
        currentClass: null,
        nextClass: null,
        nextClassSection: null,
        timeLeftMinutes: Infinity,
        isHolidayToday: isHol
      };
    }

    // Accumulate all classes scheduled in this room today across all 10 sections
    interface ScheduledClassItem {
      cls: TimetableEntry;
      sectionName: string;
      startMin: number;
      endMin: number;
    }

    const dailyClassesInRoom: ScheduledClassItem[] = [];

    SECTIONS.forEach(sec => {
      const scheduleForDay = sec.schedule[dayOfWeek] || [];
      scheduleForDay.forEach(cls => {
        if (cls.room.trim().toLowerCase() === room.id.trim().toLowerCase() || cls.room.trim().toLowerCase() === room.name.trim().toLowerCase()) {
          dailyClassesInRoom.push({
            cls,
            sectionName: sec.name,
            startMin: timeToMinutes(cls.startTime),
            endMin: timeToMinutes(cls.endTime)
          });
        }
      });
    });

    // Check if any class is currently active
    const activeClassItem = dailyClassesInRoom.find(item => 
      currentMinutes >= item.startMin && currentMinutes < item.endMin
    );

    if (activeClassItem) {
      // Room is occupied
      const timeLeft = activeClassItem.endMin - currentMinutes;
      return {
        room,
        isOccupied: true,
        occupiedBySubject: activeClassItem.cls.subject,
        occupiedBySection: activeClassItem.sectionName,
        currentClass: activeClassItem.cls,
        nextClass: null,
        nextClassSection: null,
        timeLeftMinutes: timeLeft,
        isHolidayToday: false
      };
    } else {
      // Room is empty. Find when the NEXT class starts in this room today
      const futureClasses = dailyClassesInRoom
        .filter(item => item.startMin > currentMinutes)
        .sort((a, b) => a.startMin - b.startMin);

      const nextClassItem = futureClasses[0] || null;
      const timeLeft = nextClassItem 
        ? nextClassItem.startMin - currentMinutes 
        : Infinity; // Free for rest of the day

      return {
        room,
        isOccupied: false,
        occupiedBySubject: null,
        occupiedBySection: null,
        currentClass: null,
        nextClass: nextClassItem ? nextClassItem.cls : null,
        nextClassSection: nextClassItem ? nextClassItem.sectionName : null,
        timeLeftMinutes: timeLeft,
        isHolidayToday: false
      };
    }
  });
}
