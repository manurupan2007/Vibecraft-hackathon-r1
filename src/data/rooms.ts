export interface RoomDetails {
  id: string; // matches room in timetables, e.g. "LHC 101"
  name: string;
  floor: 1 | 2 | 3; // 1 = Ground Floor, 2 = First Floor, 3 = Second Floor
  capacity: number;
  hasAC: boolean;
  type: "LHC" | "Lab" | "Room" | "Workshop";
  description: string;
}

export const ROOMS: RoomDetails[] = [
  // Floor 1 (Ground Floor)
  { id: "LHC 101", name: "LHC 101", floor: 1, capacity: 80, hasAC: true, type: "LHC", description: "Large Lecture Theatre with modern projection" },
  { id: "LHC 102", name: "LHC 102", floor: 1, capacity: 80, hasAC: true, type: "LHC", description: "Standard Lecture hall next to main entrance" },
  { id: "LHC 104", name: "LHC 104", floor: 1, capacity: 60, hasAC: false, type: "LHC", description: "Ventilated lecture hall overlooking courtyard" },
  { id: "LHC 105", name: "LHC 105", floor: 1, capacity: 60, hasAC: false, type: "LHC", description: "Standard classroom near academic office" },
  { id: "LHC 112", name: "LHC 112", floor: 1, capacity: 70, hasAC: false, type: "LHC", description: "Lecture room near mechanical department" },
  { id: "LHC 114", name: "LHC 114", floor: 1, capacity: 70, hasAC: false, type: "LHC", description: "Standard classroom near workshop" },
  { id: "LHC 115", name: "LHC 115", floor: 1, capacity: 60, hasAC: false, type: "LHC", description: "Electrical block seminar room" },
  { id: "LHC 118", name: "LHC 118", floor: 1, capacity: 60, hasAC: false, type: "LHC", description: "Tutorial room near labs" },
  { id: "Lab 3", name: "DSA Lab 3", floor: 1, capacity: 40, hasAC: true, type: "Lab", description: "Equipped with high-performance computing terminals" },
  { id: "Workshop", name: "Mechanical Workshop", floor: 1, capacity: 100, hasAC: false, type: "Workshop", description: "Heavy machinery and metal fabrication bay" },

  // Floor 2 (First Floor)
  { id: "Room 201", name: "Room 201", floor: 2, capacity: 50, hasAC: true, type: "Room", description: "Small seminar room with whiteboard grids" },
  { id: "Room 202", name: "Room 202", floor: 2, capacity: 50, hasAC: true, type: "Room", description: "Quiet tutorial space on the wing" },
  { id: "Room 203", name: "Room 203", floor: 2, capacity: 50, hasAC: false, type: "Room", description: "Project presentation room" },
  { id: "LHC 201", name: "LHC 201", floor: 2, capacity: 80, hasAC: true, type: "LHC", description: "Symmetric lecture theatre with surround acoustics" },
  { id: "LHC 202", name: "LHC 202", floor: 2, capacity: 80, hasAC: false, type: "LHC", description: "Medium-capacity lecture theatre" },
  { id: "LHC 204", name: "LHC 204", floor: 2, capacity: 70, hasAC: false, type: "LHC", description: "Standard classroom" },
  { id: "LHC 210", name: "LHC 210", floor: 2, capacity: 70, hasAC: false, type: "LHC", description: "LHC Hall near staff cabins" },
  { id: "LHC 212", name: "LHC 212", floor: 2, capacity: 60, hasAC: false, type: "LHC", description: "Standard tutorial hall" },
  { id: "AI Lab 1", name: "AI Research Lab 1", floor: 2, capacity: 45, hasAC: true, type: "Lab", description: "NVIDIA Tensor GPU workstations" },
  { id: "AI Lab 2", name: "AI Research Lab 2", floor: 2, capacity: 45, hasAC: true, type: "Lab", description: "Machine learning model testing suite" },
  { id: "MP Lab", name: "Microprocessor Lab", floor: 2, capacity: 40, hasAC: false, type: "Lab", description: "Embedded systems development boards" },
  { id: "AEC Lab", name: "Analog Electronics Lab", floor: 2, capacity: 40, hasAC: false, type: "Lab", description: "Oscilloscopes and breadboard kits" },
  { id: "VLSI Lab", name: "VLSI Testing Suite", floor: 2, capacity: 40, hasAC: true, type: "Lab", description: "Cadence and FPGA programming modules" },
  { id: "DSP Lab", name: "Digital Signal Lab", floor: 2, capacity: 40, hasAC: true, type: "Lab", description: "MATLAB rendering systems" },
  { id: "Machine Lab", name: "Electrical Machines Lab", floor: 2, capacity: 50, hasAC: false, type: "Lab", description: "Dynamometers and AC/DC induction motors" },
  { id: "Physics Lab", name: "Engineering Physics Lab", floor: 2, capacity: 40, hasAC: false, type: "Lab", description: "Spectrometers and optical benches" },

  // Floor 3 (Second Floor)
  { id: "LHC 304", name: "LHC 304", floor: 3, capacity: 70, hasAC: true, type: "LHC", description: "Advanced presentation theatre" },
  { id: "LHC 305", name: "LHC 305", floor: 3, capacity: 70, hasAC: false, type: "LHC", description: "Ventilated hall on top floor" },
  { id: "LHC 308", name: "LHC 308", floor: 3, capacity: 60, hasAC: false, type: "LHC", description: "Standard seminar room" },
  { id: "LHC 312", name: "LHC 312", floor: 3, capacity: 60, hasAC: false, type: "LHC", description: "Small tutorial room" },
  { id: "LHC 320", name: "LHC 320", floor: 3, capacity: 80, hasAC: false, type: "LHC", description: "Large hall next to roof access" },
  { id: "SecLab 1", name: "Cyber Security Lab 1", floor: 3, capacity: 35, hasAC: true, type: "Lab", description: "Vulnerability analysis terminal cluster" },
  { id: "SecLab 2", name: "Cyber Security Lab 2", floor: 3, capacity: 35, hasAC: true, type: "Lab", description: "Penetration testing sandbox environment" },
  { id: "EE Lab 1", name: "Power Systems Lab", floor: 3, capacity: 45, hasAC: false, type: "Lab", description: "High-voltage transmission simulators" },
  { id: "Thermo Lab", name: "Thermodynamics Lab", floor: 3, capacity: 50, hasAC: false, type: "Lab", description: "Boiler rigs and heat transfer apparatus" },
  { id: "Fluid Lab", name: "Fluid Mechanics Lab", floor: 3, capacity: 50, hasAC: false, type: "Lab", description: "Venturi meters and turbine test loops" },
  { id: "SAD Lab", name: "Structural Design Lab", floor: 3, capacity: 40, hasAC: false, type: "Lab", description: "CAD/BIM structural design suite" },
  { id: "Concrete Lab", name: "Concrete Testing Bay", floor: 3, capacity: 40, hasAC: false, type: "Lab", description: "Compression testing machines" },
  { id: "Geo Lab", name: "Geotechnical Lab", floor: 3, capacity: 40, hasAC: false, type: "Lab", description: "Sieve shakers and triaxial shear cells" },
  { id: "Geology Room", name: "Engineering Geology Room", floor: 3, capacity: 45, hasAC: false, type: "Room", description: "Mineral and fossil specimen inventory room" },
  { id: "Hydraulics Lab", name: "Open Channel Hydraulics", floor: 3, capacity: 40, hasAC: false, type: "Lab", description: "Glass flumes and weir models" },
  { id: "Bio Lab 1", name: "Cell Biology Lab", floor: 3, capacity: 30, hasAC: true, type: "Lab", description: "Incubators and laminar air flows" },
  { id: "Micro Lab", name: "Microbiology Lab", floor: 3, capacity: 30, hasAC: false, type: "Lab", description: "Autoclaves and colony counters" },
  { id: "BioChem Lab", name: "Biochemistry Suite", floor: 3, capacity: 30, hasAC: true, type: "Lab", description: "Centrifuges and spectrophotometers" },
  { id: "CRE Lab", name: "Chemical Reaction Lab", floor: 3, capacity: 35, hasAC: false, type: "Lab", description: "Plug flow and batch reactor models" },
  { id: "HMT Lab", name: "Heat Transfer Lab", floor: 3, capacity: 35, hasAC: false, type: "Lab", description: "Double pipe heat exchangers" },
  { id: "PDC Lab", name: "Process Control Lab", floor: 3, capacity: 35, hasAC: false, type: "Lab", description: "Pneumatic valve controllers" }
];
