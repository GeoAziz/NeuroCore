export const moodTrackerData = [
  { name: 'Mon', mood: 4, stress: 6 },
  { name: 'Tue', mood: 6, stress: 5 },
  { name: 'Wed', mood: 5, stress: 7 },
  { name: 'Thu', mood: 7, stress: 4 },
  { name: 'Fri', mood: 8, stress: 3 },
  { name: 'Sat', mood: 9, stress: 2 },
  { name: 'Sun', mood: 7, stress: 3 },
];

export const eegSignalData = [
  { time: '0s', alpha: 10, beta: 20, gamma: 30 },
  { time: '1s', alpha: 12, beta: 18, gamma: 32 },
  { time: '2s', alpha: 9, beta: 22, gamma: 28 },
  { time: '3s', alpha: 11, beta: 21, gamma: 31 },
  { time: '4s', alpha: 13, beta: 19, gamma: 29 },
  { time: '5s', alpha: 10, beta: 23, gamma: 33 },
  { time: '6s', alpha: 12, beta: 20, gamma: 30 },
  { time: '7s', alpha: 14, beta: 17, gamma: 34 },
];

export const sessionLogs = [
    { id: 'S001', type: 'Focus Gym', date: '2023-10-26 14:30', duration: '30min', result: 'Improved focus by 12%' },
    { id: 'S002', type: 'Calm Room', date: '2023-10-25 09:00', duration: '20min', result: 'Stress reduced by 25%' },
    { id: 'S003', type: 'Dream Sim', date: '2023-10-24 22:00', duration: '45min', result: 'Resolved anxiety triggers' },
    { id: 'S004', type: 'Memory Maze', date: '2023-10-23 11:00', duration: '25min', result: 'Memory recall up by 8%' },
];

export const accessLogs = [
    { id: 'L001', viewer: 'Dr. Evelyn Reed', date: '2023-10-26 14:00', action: 'Viewed Mind Map' },
    { id: 'L002', viewer: 'AI System', date: '2023-10-26 10:15', action: 'Generated AI Notes' },
    { id: 'L003', viewer: 'Dr. Kenji Tanaka', date: '2023-10-25 11:30', action: 'Accessed Session Logs' },
    { id: 'L004', viewer: 'You', date: '2023-10-25 09:00', action: 'Started Calm Room' },
]

export const adminAccessLogs = [
  { id: 'AL001', user: 'Dr. Chan', timestamp: '2023-10-27 09:05:12', action: 'Viewed Patient #P7382', status: 'Authorized' },
  { id: 'AL002', user: 'Researcher Li', timestamp: '2023-10-27 09:02:45', action: 'Accessed Anonymized Data', status: 'Authorized' },
  { id: 'AL003', user: 'sys_admin', timestamp: '2023-10-26 18:30:00', action: 'Updated Therapy Content', status: 'Authorized' },
  { id: 'AL004', user: 'UNKNOWN_IP', timestamp: '2023-10-26 17:12:34', action: 'Failed login attempt', status: 'Violation' },
];

export const therapyContent = [
    { id: 'T01', name: 'Ocean Breath Soundscape', type: 'Audio', category: 'Calm Room', added: '2023-10-01' },
    { id: 'T02', name: 'Neuro-Pathways', type: 'Game', category: 'Focus Gym', added: '2023-10-05' },
    { id: 'T03', name: 'Starry Night Simulation', type: 'VR Sim', category: 'Dream States', added: '2023-10-12' },
    { id: 'T04', name: 'Mnemonic Palace', type: 'Game', category: 'Memory Maze', added: '2023-10-18' },
];
