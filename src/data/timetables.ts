export interface TimetableEntry {
  subject: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  room: string;
}

export interface SectionTimetable {
  id: string;
  name: string;
  department: string;
  subjects: { name: string; code: string }[];
  schedule: {
    [dayOfWeek: number]: TimetableEntry[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  };
}

export const HOLIDAYS = [
  "2026-09-07", // Labor Day / Local holiday
  "2026-10-12", // Mid-term Fall Break
  "2026-11-11", // Veterans Day / National Holiday
  "2026-11-26", // Thanksgiving break
  "2026-11-27", // Thanksgiving break
];

export const SEMESTER_START = "2026-08-29";
export const SEMESTER_END = "2026-11-29";

export const SECTIONS: SectionTimetable[] = [
  {
    id: "sec-1",
    name: "Section 1",
    department: "Computer Science Engineering (CSE-A)",
    subjects: [
      { name: "Data Structures & Algorithms", code: "CS301" },
      { name: "Discrete Mathematics", code: "MA302" },
      { name: "Database Management Systems", code: "CS303" },
      { name: "Computer Org & Architecture", code: "CS304" },
      { name: "Environmental Sciences", code: "HS305" }
    ],
    schedule: {
      1: [ // Monday
        { subject: "Data Structures & Algorithms", startTime: "09:00", endTime: "10:00", room: "Lab 3" },
        { subject: "Discrete Mathematics", startTime: "10:15", endTime: "11:15", room: "LHC 102" },
        { subject: "Database Management Systems", startTime: "11:30", endTime: "12:30", room: "LHC 104" },
        { subject: "Computer Org & Architecture", startTime: "14:00", endTime: "15:00", room: "LHC 101" }
      ],
      2: [ // Tuesday
        { subject: "Discrete Mathematics", startTime: "09:00", endTime: "10:00", room: "LHC 102" },
        { subject: "Environmental Sciences", startTime: "10:15", endTime: "11:15", room: "LHC 105" },
        { subject: "Data Structures & Algorithms", startTime: "11:30", endTime: "12:30", room: "Lab 3" },
        { subject: "Database Management Systems", startTime: "14:00", endTime: "15:00", room: "LHC 104" }
      ],
      3: [ // Wednesday
        { subject: "Computer Org & Architecture", startTime: "09:00", endTime: "10:00", room: "LHC 101" },
        { subject: "Discrete Mathematics", startTime: "10:15", endTime: "11:15", room: "LHC 102" },
        { subject: "Environmental Sciences", startTime: "11:30", endTime: "12:30", room: "LHC 105" },
        { subject: "Data Structures & Algorithms", startTime: "14:00", endTime: "15:00", room: "Lab 3" }
      ],
      4: [ // Thursday
        { subject: "Database Management Systems", startTime: "09:00", endTime: "10:00", room: "LHC 104" },
        { subject: "Computer Org & Architecture", startTime: "10:15", endTime: "11:15", room: "LHC 101" },
        { subject: "Discrete Mathematics", startTime: "11:30", endTime: "12:30", room: "LHC 102" },
        { subject: "Environmental Sciences", startTime: "14:00", endTime: "15:00", room: "LHC 105" }
      ],
      5: [ // Friday
        { subject: "Environmental Sciences", startTime: "09:00", endTime: "10:00", room: "LHC 105" },
        { subject: "Data Structures & Algorithms", startTime: "10:15", endTime: "11:15", room: "Lab 3" },
        { subject: "Database Management Systems", startTime: "11:30", endTime: "12:30", room: "LHC 104" },
        { subject: "Computer Org & Architecture", startTime: "14:00", endTime: "15:00", room: "LHC 101" }
      ],
      6: [ // Saturday (Half-day)
        { subject: "Data Structures & Algorithms", startTime: "09:00", endTime: "10:00", room: "Lab 3" },
        { subject: "Database Management Systems", startTime: "10:15", endTime: "11:15", room: "LHC 104" }
      ]
    }
  },
  {
    id: "sec-2",
    name: "Section 2",
    department: "Computer Science Engineering (CSE-B)",
    subjects: [
      { name: "Artificial Intelligence Foundations", code: "AI301" },
      { name: "Machine Learning Algorithms", code: "AI302" },
      { name: "Applied Probability & Statistics", code: "AI303" },
      { name: "Linear Algebra for AI", code: "AI304" },
      { name: "Python Programming Lab", code: "AI305" }
    ],
    schedule: {
      1: [
        { subject: "Artificial Intelligence Foundations", startTime: "09:00", endTime: "10:00", room: "Room 201" },
        { subject: "Applied Probability & Statistics", startTime: "10:15", endTime: "11:15", room: "Room 203" },
        { subject: "Machine Learning Algorithms", startTime: "11:30", endTime: "12:30", room: "AI Lab 1" },
        { subject: "Python Programming Lab", startTime: "14:00", endTime: "15:30", room: "AI Lab 2" }
      ],
      2: [
        { subject: "Linear Algebra for AI", startTime: "09:00", endTime: "10:00", room: "Room 202" },
        { subject: "Machine Learning Algorithms", startTime: "10:15", endTime: "11:15", room: "AI Lab 1" },
        { subject: "Artificial Intelligence Foundations", startTime: "11:30", endTime: "12:30", room: "Room 201" },
        { subject: "Applied Probability & Statistics", startTime: "14:00", endTime: "15:00", room: "Room 203" }
      ],
      3: [
        { subject: "Python Programming Lab", startTime: "09:00", endTime: "10:30", room: "AI Lab 2" },
        { subject: "Linear Algebra for AI", startTime: "10:45", endTime: "11:45", room: "Room 202" },
        { subject: "Applied Probability & Statistics", startTime: "12:00", endTime: "13:00", room: "Room 203" },
        { subject: "Machine Learning Algorithms", startTime: "14:00", endTime: "15:00", room: "AI Lab 1" }
      ],
      4: [
        { subject: "Artificial Intelligence Foundations", startTime: "09:00", endTime: "10:00", room: "Room 201" },
        { subject: "Linear Algebra for AI", startTime: "10:15", endTime: "11:15", room: "Room 202" },
        { subject: "Machine Learning Algorithms", startTime: "11:30", endTime: "12:30", room: "AI Lab 1" },
        { subject: "Python Programming Lab", startTime: "14:00", endTime: "15:30", room: "AI Lab 2" }
      ],
      5: [
        { subject: "Applied Probability & Statistics", startTime: "09:00", endTime: "10:00", room: "Room 203" },
        { subject: "Artificial Intelligence Foundations", startTime: "10:15", endTime: "11:15", room: "Room 201" },
        { subject: "Linear Algebra for AI", startTime: "11:30", endTime: "12:30", room: "Room 202" },
        { subject: "Machine Learning Algorithms", startTime: "14:00", endTime: "15:00", room: "AI Lab 1" }
      ],
      6: [
        { subject: "Artificial Intelligence Foundations", startTime: "09:00", endTime: "10:00", room: "Room 201" },
        { subject: "Applied Probability & Statistics", startTime: "10:15", endTime: "11:15", room: "Room 203" }
      ]
    }
  },
  {
    id: "sec-3",
    name: "Section 3",
    department: "Computer Science Engineering (CSE-C)",
    subjects: [
      { name: "Cryptography & Network Security", code: "CY301" },
      { name: "Ethical Hacking & VAPT", code: "CY302" },
      { name: "Operating Systems Security", code: "CY303" },
      { name: "Digital Forensics", code: "CY304" },
      { name: "Cyber Laws & Ethics", code: "CY305" }
    ],
    schedule: {
      1: [
        { subject: "Cryptography & Network Security", startTime: "09:00", endTime: "10:00", room: "SecLab 1" },
        { subject: "Operating Systems Security", startTime: "10:15", endTime: "11:15", room: "LHC 304" },
        { subject: "Ethical Hacking & VAPT", startTime: "11:30", endTime: "12:30", room: "SecLab 2" },
        { subject: "Digital Forensics", startTime: "14:00", endTime: "15:00", room: "LHC 305" }
      ],
      2: [
        { subject: "Digital Forensics", startTime: "09:00", endTime: "10:00", room: "LHC 305" },
        { subject: "Cyber Laws & Ethics", startTime: "10:15", endTime: "11:15", room: "LHC 308" },
        { subject: "Cryptography & Network Security", startTime: "11:30", endTime: "12:30", room: "SecLab 1" },
        { subject: "Ethical Hacking & VAPT", startTime: "14:00", endTime: "15:00", room: "SecLab 2" }
      ],
      3: [
        { subject: "Operating Systems Security", startTime: "09:00", endTime: "10:00", room: "LHC 304" },
        { subject: "Cyber Laws & Ethics", startTime: "10:15", endTime: "11:15", room: "LHC 308" },
        { subject: "Digital Forensics", startTime: "11:30", endTime: "12:30", room: "LHC 305" },
        { subject: "Cryptography & Network Security", startTime: "14:00", endTime: "15:00", room: "SecLab 1" }
      ],
      4: [
        { subject: "Ethical Hacking & VAPT", startTime: "09:00", endTime: "10:00", room: "SecLab 2" },
        { subject: "Operating Systems Security", startTime: "10:15", endTime: "11:15", room: "LHC 304" },
        { subject: "Cryptography & Network Security", startTime: "11:30", endTime: "12:30", room: "SecLab 1" },
        { subject: "Cyber Laws & Ethics", startTime: "14:00", endTime: "15:00", room: "LHC 308" }
      ],
      5: [
        { subject: "Cyber Laws & Ethics", startTime: "09:00", endTime: "10:00", room: "LHC 308" },
        { subject: "Ethical Hacking & VAPT", startTime: "10:15", endTime: "11:15", room: "SecLab 2" },
        { subject: "Operating Systems Security", startTime: "11:30", endTime: "12:30", room: "LHC 304" },
        { subject: "Digital Forensics", startTime: "14:00", endTime: "15:00", room: "LHC 305" }
      ],
      6: [
        { subject: "Cryptography & Network Security", startTime: "09:00", endTime: "10:00", room: "SecLab 1" },
        { subject: "Digital Forensics", startTime: "10:15", endTime: "11:15", room: "LHC 305" }
      ]
    }
  },
  {
    id: "sec-4",
    name: "Section 4",
    department: "Electronics & Communication (ECE-A)",
    subjects: [
      { name: "Signals & Systems", code: "EC301" },
      { name: "Analog Electronic Circuits", code: "EC302" },
      { name: "Microprocessors & Microcontrollers", code: "EC303" },
      { name: "Electromagnetic Fields", code: "EC304" },
      { name: "Engineering Chemistry", code: "CH101" }
    ],
    schedule: {
      1: [
        { subject: "Signals & Systems", startTime: "09:00", endTime: "10:00", room: "LHC 201" },
        { subject: "Microprocessors & Microcontrollers", startTime: "10:15", endTime: "11:15", room: "MP Lab" },
        { subject: "Analog Electronic Circuits", startTime: "11:30", endTime: "12:30", room: "AEC Lab" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      2: [
        { subject: "Engineering Chemistry", startTime: "09:00", endTime: "10:00", room: "LHC 204" },
        { subject: "Electromagnetic Fields", startTime: "10:15", endTime: "11:15", room: "LHC 202" },
        { subject: "Signals & Systems", startTime: "11:30", endTime: "12:30", room: "LHC 201" },
        { subject: "Analog Electronic Circuits", startTime: "14:00", endTime: "15:00", room: "AEC Lab" }
      ],
      3: [
        { subject: "Microprocessors & Microcontrollers", startTime: "09:00", endTime: "10:00", room: "MP Lab" },
        { subject: "Electromagnetic Fields", startTime: "10:15", endTime: "11:15", room: "LHC 202" },
        { subject: "Engineering Chemistry", startTime: "11:30", endTime: "12:30", room: "LHC 204" },
        { subject: "Signals & Systems", startTime: "14:00", endTime: "15:00", room: "LHC 201" }
      ],
      4: [
        { subject: "Analog Electronic Circuits", startTime: "09:00", endTime: "10:00", room: "AEC Lab" },
        { subject: "Microprocessors & Microcontrollers", startTime: "10:15", endTime: "11:15", room: "MP Lab" },
        { subject: "Signals & Systems", startTime: "11:30", endTime: "12:30", room: "LHC 201" },
        { subject: "Electromagnetic Fields", startTime: "14:00", endTime: "15:00", room: "LHC 202" }
      ],
      5: [
        { subject: "Electromagnetic Fields", startTime: "09:00", endTime: "10:00", room: "LHC 202" },
        { subject: "Analog Electronic Circuits", startTime: "10:15", endTime: "11:15", room: "AEC Lab" },
        { subject: "Microprocessors & Microcontrollers", startTime: "11:30", endTime: "12:30", room: "MP Lab" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      6: [
        { subject: "Signals & Systems", startTime: "09:00", endTime: "10:00", room: "LHC 201" },
        { subject: "Electromagnetic Fields", startTime: "10:15", endTime: "11:15", room: "LHC 202" }
      ]
    }
  },
  {
    id: "sec-5",
    name: "Section 5",
    department: "Electronics & Communication (ECE-B)",
    subjects: [
      { name: "VLSI Design & Technology", code: "EC311" },
      { name: "Digital Signal Processing", code: "EC312" },
      { name: "Communication Theory", code: "EC313" },
      { name: "Engineering Physics", code: "PH101" },
      { name: "Linear Integrated Circuits", code: "EC315" }
    ],
    schedule: {
      1: [
        { subject: "VLSI Design & Technology", startTime: "09:00", endTime: "10:00", room: "VLSI Lab" },
        { subject: "Digital Signal Processing", startTime: "10:15", endTime: "11:15", room: "DSP Lab" },
        { subject: "Communication Theory", startTime: "11:30", endTime: "12:30", room: "LHC 210" },
        { subject: "Engineering Physics", startTime: "14:00", endTime: "15:00", room: "Physics Lab" }
      ],
      2: [
        { subject: "Engineering Physics", startTime: "09:00", endTime: "10:00", room: "Physics Lab" },
        { subject: "Linear Integrated Circuits", startTime: "10:15", endTime: "11:15", room: "LHC 212" },
        { subject: "VLSI Design & Technology", startTime: "11:30", endTime: "12:30", room: "VLSI Lab" },
        { subject: "Digital Signal Processing", startTime: "14:00", endTime: "15:00", room: "DSP Lab" }
      ],
      3: [
        { subject: "Communication Theory", startTime: "09:00", endTime: "10:00", room: "LHC 210" },
        { subject: "Linear Integrated Circuits", startTime: "10:15", endTime: "11:15", room: "LHC 212" },
        { subject: "Engineering Physics", startTime: "11:30", endTime: "12:30", room: "Physics Lab" },
        { subject: "VLSI Design & Technology", startTime: "14:00", endTime: "15:00", room: "VLSI Lab" }
      ],
      4: [
        { subject: "Digital Signal Processing", startTime: "09:00", endTime: "10:00", room: "DSP Lab" },
        { subject: "Communication Theory", startTime: "10:15", endTime: "11:15", room: "LHC 210" },
        { subject: "VLSI Design & Technology", startTime: "11:30", endTime: "12:30", room: "VLSI Lab" },
        { subject: "Linear Integrated Circuits", startTime: "14:00", endTime: "15:00", room: "LHC 212" }
      ],
      5: [
        { subject: "Linear Integrated Circuits", startTime: "09:00", endTime: "10:00", room: "LHC 212" },
        { subject: "Digital Signal Processing", startTime: "10:15", endTime: "11:15", room: "DSP Lab" },
        { subject: "Communication Theory", startTime: "11:30", endTime: "12:30", room: "LHC 210" },
        { subject: "Engineering Physics", startTime: "14:00", endTime: "15:00", room: "Physics Lab" }
      ],
      6: [
        { subject: "VLSI Design & Technology", startTime: "09:00", endTime: "10:00", room: "VLSI Lab" },
        { subject: "Communication Theory", startTime: "10:15", endTime: "11:15", room: "LHC 210" }
      ]
    }
  },
  {
    id: "sec-6",
    name: "Section 6",
    department: "Electrical & Electronics (EEE-A)",
    subjects: [
      { name: "Power Electronics & Drives", code: "EE301" },
      { name: "Control Systems Engineering", code: "EE302" },
      { name: "AC & DC Electrical Machines", code: "EE303" },
      { name: "Network Analysis & Synthesis", code: "EE304" },
      { name: "Engineering Chemistry", code: "CH101" }
    ],
    schedule: {
      1: [
        { subject: "Power Electronics & Drives", startTime: "09:00", endTime: "10:00", room: "EE Lab 1" },
        { subject: "AC & DC Electrical Machines", startTime: "10:15", endTime: "11:15", room: "Machine Lab" },
        { subject: "Control Systems Engineering", startTime: "11:30", endTime: "12:30", room: "LHC 115" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      2: [
        { subject: "Engineering Chemistry", startTime: "09:00", endTime: "10:00", room: "LHC 204" },
        { subject: "Network Analysis & Synthesis", startTime: "10:15", endTime: "11:15", room: "LHC 118" },
        { subject: "Power Electronics & Drives", startTime: "11:30", endTime: "12:30", room: "EE Lab 1" },
        { subject: "Control Systems Engineering", startTime: "14:00", endTime: "15:00", room: "LHC 115" }
      ],
      3: [
        { subject: "AC & DC Electrical Machines", startTime: "09:00", endTime: "10:00", room: "Machine Lab" },
        { subject: "Network Analysis & Synthesis", startTime: "10:15", endTime: "11:15", room: "LHC 118" },
        { subject: "Engineering Chemistry", startTime: "11:30", endTime: "12:30", room: "LHC 204" },
        { subject: "Power Electronics & Drives", startTime: "14:00", endTime: "15:00", room: "EE Lab 1" }
      ],
      4: [
        { subject: "Control Systems Engineering", startTime: "09:00", endTime: "10:00", room: "LHC 115" },
        { subject: "AC & DC Electrical Machines", startTime: "10:15", endTime: "11:15", room: "Machine Lab" },
        { subject: "Power Electronics & Drives", startTime: "11:30", endTime: "12:30", room: "EE Lab 1" },
        { subject: "Network Analysis & Synthesis", startTime: "14:00", endTime: "15:00", room: "LHC 118" }
      ],
      5: [
        { subject: "Network Analysis & Synthesis", startTime: "09:00", endTime: "10:00", room: "LHC 118" },
        { subject: "Control Systems Engineering", startTime: "10:15", endTime: "11:15", room: "LHC 115" },
        { subject: "AC & DC Electrical Machines", startTime: "11:30", endTime: "12:30", room: "Machine Lab" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      6: [
        { subject: "Power Electronics & Drives", startTime: "09:00", endTime: "10:00", room: "EE Lab 1" },
        { subject: "Network Analysis & Synthesis", startTime: "10:15", endTime: "11:15", room: "LHC 118" }
      ]
    }
  },
  {
    id: "sec-7",
    name: "Section 7",
    department: "Mechanical Engineering (MECH-A)",
    subjects: [
      { name: "Thermodynamics & Heat Transfer", code: "ME301" },
      { name: "Fluid Mechanics & Machinery", code: "ME302" },
      { name: "Strength of Materials", code: "ME303" },
      { name: "Manufacturing Technology", code: "ME304" },
      { name: "Applied Materials Science", code: "ME305" }
    ],
    schedule: {
      1: [
        { subject: "Thermodynamics & Heat Transfer", startTime: "09:00", endTime: "10:00", room: "Thermo Lab" },
        { subject: "Strength of Materials", startTime: "10:15", endTime: "11:15", room: "LHC 112" },
        { subject: "Fluid Mechanics & Machinery", startTime: "11:30", endTime: "12:30", room: "Fluid Lab" },
        { subject: "Applied Materials Science", startTime: "14:00", endTime: "15:00", room: "LHC 114" }
      ],
      2: [
        { subject: "Applied Materials Science", startTime: "09:00", endTime: "10:00", room: "LHC 114" },
        { subject: "Manufacturing Technology", startTime: "10:15", endTime: "11:15", room: "Workshop" },
        { subject: "Thermodynamics & Heat Transfer", startTime: "11:30", endTime: "12:30", room: "Thermo Lab" },
        { subject: "Fluid Mechanics & Machinery", startTime: "14:00", endTime: "15:00", room: "Fluid Lab" }
      ],
      3: [
        { subject: "Strength of Materials", startTime: "09:00", endTime: "10:00", room: "LHC 112" },
        { subject: "Manufacturing Technology", startTime: "10:15", endTime: "11:15", room: "Workshop" },
        { subject: "Applied Materials Science", startTime: "11:30", endTime: "12:30", room: "LHC 114" },
        { subject: "Thermodynamics & Heat Transfer", startTime: "14:00", endTime: "15:00", room: "Thermo Lab" }
      ],
      4: [
        { subject: "Fluid Mechanics & Machinery", startTime: "09:00", endTime: "10:00", room: "Fluid Lab" },
        { subject: "Strength of Materials", startTime: "10:15", endTime: "11:15", room: "LHC 112" },
        { subject: "Thermodynamics & Heat Transfer", startTime: "11:30", endTime: "12:30", room: "Thermo Lab" },
        { subject: "Manufacturing Technology", startTime: "14:00", endTime: "15:00", room: "Workshop" }
      ],
      5: [
        { subject: "Manufacturing Technology", startTime: "09:00", endTime: "10:00", room: "Workshop" },
        { subject: "Fluid Mechanics & Machinery", startTime: "10:15", endTime: "11:15", room: "Fluid Lab" },
        { subject: "Strength of Materials", startTime: "11:30", endTime: "12:30", room: "LHC 112" },
        { subject: "Applied Materials Science", startTime: "14:00", endTime: "15:00", room: "LHC 114" }
      ],
      6: [
        { subject: "Thermodynamics & Heat Transfer", startTime: "09:00", endTime: "10:00", room: "Thermo Lab" },
        { subject: "Applied Materials Science", startTime: "10:15", endTime: "11:15", room: "LHC 114" }
      ]
    }
  },
  {
    id: "sec-8",
    name: "Section 8",
    department: "Civil Engineering (CIVIL-A)",
    subjects: [
      { name: "Structural Analysis & Design", code: "CE301" },
      { name: "Geotechnical Engineering", code: "CE302" },
      { name: "Fluid Mechanics for Civil", code: "CE303" },
      { name: "Concrete Technology", code: "CE304" },
      { name: "Engineering Geology", code: "CE305" }
    ],
    schedule: {
      1: [
        { subject: "Structural Analysis & Design", startTime: "09:00", endTime: "10:00", room: "SAD Lab" },
        { subject: "Concrete Technology", startTime: "10:15", endTime: "11:15", room: "Concrete Lab" },
        { subject: "Geotechnical Engineering", startTime: "11:30", endTime: "12:30", room: "Geo Lab" },
        { subject: "Engineering Geology", startTime: "14:00", endTime: "15:00", room: "Geology Room" }
      ],
      2: [
        { subject: "Engineering Geology", startTime: "09:00", endTime: "10:00", room: "Geology Room" },
        { subject: "Fluid Mechanics for Civil", startTime: "10:15", endTime: "11:15", room: "Hydraulics Lab" },
        { subject: "Structural Analysis & Design", startTime: "11:30", endTime: "12:30", room: "SAD Lab" },
        { subject: "Geotechnical Engineering", startTime: "14:00", endTime: "15:00", room: "Geo Lab" }
      ],
      3: [
        { subject: "Concrete Technology", startTime: "09:00", endTime: "10:00", room: "Concrete Lab" },
        { subject: "Fluid Mechanics for Civil", startTime: "10:15", endTime: "11:15", room: "Hydraulics Lab" },
        { subject: "Engineering Geology", startTime: "11:30", endTime: "12:30", room: "Geology Room" },
        { subject: "Structural Analysis & Design", startTime: "14:00", endTime: "15:00", room: "SAD Lab" }
      ],
      4: [
        { subject: "Geotechnical Engineering", startTime: "09:00", endTime: "10:00", room: "Geo Lab" },
        { subject: "Concrete Technology", startTime: "10:15", endTime: "11:15", room: "Concrete Lab" },
        { subject: "Structural Analysis & Design", startTime: "11:30", endTime: "12:30", room: "SAD Lab" },
        { subject: "Fluid Mechanics for Civil", startTime: "14:00", endTime: "15:00", room: "Hydraulics Lab" }
      ],
      5: [
        { subject: "Fluid Mechanics for Civil", startTime: "09:00", endTime: "10:00", room: "Hydraulics Lab" },
        { subject: "Geotechnical Engineering", startTime: "10:15", endTime: "11:15", room: "Geo Lab" },
        { subject: "Concrete Technology", startTime: "11:30", endTime: "12:30", room: "Concrete Lab" },
        { subject: "Engineering Geology", startTime: "14:00", endTime: "15:00", room: "Geology Room" }
      ],
      6: [
        { subject: "Structural Analysis & Design", startTime: "09:00", endTime: "10:00", room: "SAD Lab" },
        { subject: "Engineering Geology", startTime: "10:15", endTime: "11:15", room: "Geology Room" }
      ]
    }
  },
  {
    id: "sec-9",
    name: "Section 9",
    department: "Biotechnology (BIOTECH-A)",
    subjects: [
      { name: "Cell & Molecular Biology", code: "BT301" },
      { name: "Biochemistry & Biophysics", code: "BT302" },
      { name: "Microbiology Foundations", code: "BT303" },
      { name: "Genetics & Genomics", code: "BT304" },
      { name: "Engineering Chemistry", code: "CH101" }
    ],
    schedule: {
      1: [
        { subject: "Cell & Molecular Biology", startTime: "09:00", endTime: "10:00", room: "Bio Lab 1" },
        { subject: "Microbiology Foundations", startTime: "10:15", endTime: "11:15", room: "Micro Lab" },
        { subject: "Biochemistry & Biophysics", startTime: "11:30", endTime: "12:30", room: "BioChem Lab" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      2: [
        { subject: "Engineering Chemistry", startTime: "09:00", endTime: "10:00", room: "LHC 204" },
        { subject: "Genetics & Genomics", startTime: "10:15", endTime: "11:15", room: "LHC 312" },
        { subject: "Cell & Molecular Biology", startTime: "11:30", endTime: "12:30", room: "Bio Lab 1" },
        { subject: "Biochemistry & Biophysics", startTime: "14:00", endTime: "15:00", room: "BioChem Lab" }
      ],
      3: [
        { subject: "Microbiology Foundations", startTime: "09:00", endTime: "10:00", room: "Micro Lab" },
        { subject: "Genetics & Genomics", startTime: "10:15", endTime: "11:15", room: "LHC 312" },
        { subject: "Engineering Chemistry", startTime: "11:30", endTime: "12:30", room: "LHC 204" },
        { subject: "Cell & Molecular Biology", startTime: "14:00", endTime: "15:00", room: "Bio Lab 1" }
      ],
      4: [
        { subject: "Biochemistry & Biophysics", startTime: "09:00", endTime: "10:00", room: "BioChem Lab" },
        { subject: "Microbiology Foundations", startTime: "10:15", endTime: "11:15", room: "Micro Lab" },
        { subject: "Cell & Molecular Biology", startTime: "11:30", endTime: "12:30", room: "Bio Lab 1" },
        { subject: "Genetics & Genomics", startTime: "14:00", endTime: "15:00", room: "LHC 312" }
      ],
      5: [
        { subject: "Genetics & Genomics", startTime: "09:00", endTime: "10:00", room: "LHC 312" },
        { subject: "Biochemistry & Biophysics", startTime: "10:15", endTime: "11:15", room: "BioChem Lab" },
        { subject: "Microbiology Foundations", startTime: "11:30", endTime: "12:30", room: "Micro Lab" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      6: [
        { subject: "Cell & Molecular Biology", startTime: "09:00", endTime: "10:00", room: "Bio Lab 1" },
        { subject: "Genetics & Genomics", startTime: "10:15", endTime: "11:15", room: "LHC 312" }
      ]
    }
  },
  {
    id: "sec-10",
    name: "Section 10",
    department: "Chemical Engineering (CHEM-A)",
    subjects: [
      { name: "Chemical Reaction Engineering", code: "CH301" },
      { name: "Heat & Mass Transfer", code: "CH302" },
      { name: "Chemical Tech Thermodynamics", code: "CH303" },
      { name: "Process Dynamics & Control", code: "CH304" },
      { name: "Engineering Chemistry", code: "CH101" }
    ],
    schedule: {
      1: [
        { subject: "Chemical Reaction Engineering", startTime: "09:00", endTime: "10:00", room: "CRE Lab" },
        { subject: "Chemical Tech Thermodynamics", startTime: "10:15", endTime: "11:15", room: "LHC 320" },
        { subject: "Heat & Mass Transfer", startTime: "11:30", endTime: "12:30", room: "HMT Lab" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      2: [
        { subject: "Engineering Chemistry", startTime: "09:00", endTime: "10:00", room: "LHC 204" },
        { subject: "Process Dynamics & Control", startTime: "10:15", endTime: "11:15", room: "PDC Lab" },
        { subject: "Chemical Reaction Engineering", startTime: "11:30", endTime: "12:30", room: "CRE Lab" },
        { subject: "Heat & Mass Transfer", startTime: "14:00", endTime: "15:00", room: "HMT Lab" }
      ],
      3: [
        { subject: "Chemical Tech Thermodynamics", startTime: "09:00", endTime: "10:00", room: "LHC 320" },
        { subject: "Process Dynamics & Control", startTime: "10:15", endTime: "11:15", room: "PDC Lab" },
        { subject: "Engineering Chemistry", startTime: "11:30", endTime: "12:30", room: "LHC 204" },
        { subject: "Chemical Reaction Engineering", startTime: "14:00", endTime: "15:00", room: "CRE Lab" }
      ],
      4: [
        { subject: "Heat & Mass Transfer", startTime: "09:00", endTime: "10:00", room: "HMT Lab" },
        { subject: "Chemical Tech Thermodynamics", startTime: "10:15", endTime: "11:15", room: "LHC 320" },
        { subject: "Chemical Reaction Engineering", startTime: "11:30", endTime: "12:30", room: "CRE Lab" },
        { subject: "Process Dynamics & Control", startTime: "14:00", endTime: "15:00", room: "PDC Lab" }
      ],
      5: [
        { subject: "Process Dynamics & Control", startTime: "09:00", endTime: "10:00", room: "PDC Lab" },
        { subject: "Heat & Mass Transfer", startTime: "10:15", endTime: "11:15", room: "HMT Lab" },
        { subject: "Chemical Tech Thermodynamics", startTime: "11:30", endTime: "12:30", room: "LHC 320" },
        { subject: "Engineering Chemistry", startTime: "14:00", endTime: "15:00", room: "LHC 204" }
      ],
      6: [
        { subject: "Chemical Reaction Engineering", startTime: "09:00", endTime: "10:00", room: "CRE Lab" },
        { subject: "Process Dynamics & Control", startTime: "10:15", endTime: "11:15", room: "PDC Lab" }
      ]
    }
  }
];
