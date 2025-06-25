
import 'dotenv/config';
import { auth, firestore } from '../src/lib/firebase/admin';
import type { UserProfile, PatientData, JournalEntry, MoodTrackerDataPoint, SessionLog, AccessLog, TherapyContent, PrivacySettings } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// --- Seed Data ---

const usersToCreate = [
  {
    email: 'patient@neurocore.dev',
    password: 'password123',
    displayName: 'John Doe',
    role: 'patient' as const,
  },
  {
    email: 'doctor@neurocore.dev',
    password: 'password123',
    displayName: 'Dr. Anya Sharma',
    role: 'doctor' as const,
  },
  {
    email: 'admin@neurocore.dev',
    password: 'password123',
    displayName: 'Sys Admin',
    role: 'admin' as const,
  },
];

const moodTrackerData: MoodTrackerDataPoint[] = [
  { name: 'Mon', mood: 4, stress: 6 },
  { name: 'Tue', mood: 6, stress: 5 },
  { name: 'Wed', mood: 5, stress: 7 },
  { name: 'Thu', mood: 7, stress: 4 },
  { name: 'Fri', mood: 8, stress: 3 },
  { name: 'Sat', mood: 9, stress: 2 },
  { name: 'Sun', mood: 7, stress: 3 },
];

const sessionLogs: Omit<SessionLog, 'id'>[] = [
    { type: 'Focus Gym', date: '2023-10-26 14:30', duration: '30min', result: 'Improved focus by 12%' },
    { type: 'Calm Room', date: '2023-10-25 09:00', duration: '20min', result: 'Stress reduced by 25%' },
    { type: 'Dream Sim', date: '2023-10-24 22:00', duration: '45min', result: 'Resolved anxiety triggers' },
    { type: 'Memory Maze', date: '2023-10-23 11:00', duration: '25min', result: 'Memory recall up by 8%' },
];

const accessLogs: Omit<AccessLog, 'id' | 'patientName'>[] = [
    { viewer: 'Dr. Evelyn Reed', date: '2023-10-26 14:00', action: 'Viewed Mind Map', status: 'Authorized' as const },
    { viewer: 'AI System', date: '2023-10-26 10:15', action: 'Generated AI Notes', status: 'Authorized' as const },
    { viewer: 'Dr. Kenji Tanaka', date: '2023-10-25 11:30', action: 'Accessed Session Logs', status: 'Authorized' as const },
    { viewer: 'Unauthorized IP', date: '2023-10-27 01:00', action: 'Failed login attempt', status: 'Violation' as const },
];

const journalEntries: Omit<JournalEntry, 'id'>[] = [
    { text: "Felt overwhelmed with work this morning. The focus gym session helped, but by evening, I was exhausted.", timestamp: Timestamp.fromDate(new Date('2023-10-26T19:00:00')) },
    { text: "The dream simulation was strange, a bit unsettling. Woke up feeling more rested than usual though.", timestamp: Timestamp.fromDate(new Date('2023-10-25T08:00:00')) },
    { text: "Feeling positive today. The calm room session yesterday must have helped.", timestamp: Timestamp.fromDate(new Date('2023-10-27T10:00:00')) },
];

const therapyContent: TherapyContent[] = [
    { id: 'T01', name: 'Ocean Breath Soundscape', type: 'Audio' as const, category: 'Calm Room', added: '2023-10-01', description: 'Virtual relaxation spaces, soundscapes, and breathing exercises.', image: 'https://placehold.co/1200x800', data_ai_hint: 'calm beach' },
    { id: 'T02', name: 'Neuro-Pathways', type: 'Game' as const, category: 'Focus Gym', added: '2023-10-05', description: 'Puzzle games designed to enhance focus and mental acuity.', image: 'https://placehold.co/1200x800', data_ai_hint: 'abstract puzzle' },
    { id: 'T03', name: 'Starry Night Simulation', type: 'VR Sim' as const, category: 'Dream States', added: '2023-10-12', description: 'AI-simulated environments based on your current emotions.', image: 'https://placehold.co/1200x800', data_ai_hint: 'surreal dreamscape' },
    { id: 'T04', name: 'Mnemonic Palace', type: 'Game' as const, category: 'Memory Maze', added: '2023-10-18', description: 'Strengthen memory recall through interactive challenges.', image: 'https://placehold.co/1200x800', data_ai_hint: 'glowing maze' },
];

async function seed() {
  console.log('Starting database seed...');

  // --- Create/Fetch Users in Auth ---
  const userRecords = await Promise.all(
    usersToCreate.map(async (user) => {
      try {
        const userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
        });
        console.log(`Successfully created auth user: ${user.email}`);
        return { ...user, uid: userRecord.uid };
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`Auth user ${user.email} already exists. Fetching...`);
          const userRecord = await auth.getUserByEmail(user.email);
          return { ...user, uid: userRecord.uid };
        }
        console.error(`Failed to create/fetch auth user ${user.email}:`, error);
        return null;
      }
    })
  );

  const createdUsers = userRecords.filter((u): u is NonNullable<typeof u> => u !== null);
  const patientUser = createdUsers.find(u => u.role === 'patient');
  const doctorUser = createdUsers.find(u => u.role === 'doctor');
  const adminUser = createdUsers.find(u => u.role === 'admin');

  const batch = firestore.batch();

  // --- Prepare and Batch Doctor Profile ---
  if (doctorUser) {
    const doctorProfile: UserProfile = {
      uid: doctorUser.uid,
      email: doctorUser.email!,
      displayName: doctorUser.displayName!,
      role: 'doctor',
    };
    batch.set(firestore.collection('users').doc(doctorUser.uid), doctorProfile);
  }

  // --- Prepare and Batch Admin Profile ---
  if (adminUser) {
      const adminProfile: UserProfile = {
        uid: adminUser.uid,
        email: adminUser.email!,
        displayName: adminUser.displayName!,
        role: 'admin',
      };
      batch.set(firestore.collection('users').doc(adminUser.uid), adminProfile);
  }

  // --- Prepare and Batch Patient Profile (with all data) ---
  if (patientUser && doctorUser) {
    const patientData: PatientData = {
        cognitionScore: { value: 8.2, change: 2.1 },
        mentalHealthGrade: 'B+',
        sleepQuality: 89,
        mood: 'Calm',
        moodPrediction: 'Stable',
        moodTrackerData: moodTrackerData,
    };
    const privacySettings: PrivacySettings = {
        liveTherapyMode: true,
        anonymizedResearch: false,
        doctorAccess: { [doctorUser.uid]: true },
    };
    const patientProfile: UserProfile = {
        uid: patientUser.uid,
        email: patientUser.email!,
        displayName: patientUser.displayName!,
        role: 'patient',
        patientData: patientData,
        privacySettings: privacySettings,
    };
    const userDocRef = firestore.collection('users').doc(patientUser.uid);
    batch.set(userDocRef, patientProfile);

    // Batch subcollections for the patient
    sessionLogs.forEach(log => {
      const docRef = userDocRef.collection('sessionLogs').doc();
      batch.set(docRef, log);
    });

    accessLogs.forEach(log => {
        const logWithDoctor = {...log, viewer: log.viewer.includes('Dr.') ? doctorUser.displayName || log.viewer : log.viewer};
        const docRef = userDocRef.collection('accessLogs').doc();
        batch.set(docRef, logWithDoctor);
    });
    
    journalEntries.forEach(entry => {
      const docRef = userDocRef.collection('journalEntries').doc();
      batch.set(docRef, entry);
    });
  }

  // --- Seed Global Collections ---
  therapyContent.forEach(item => {
    const docRef = firestore.collection('therapyContent').doc(item.id);
    batch.set(docRef, item);
  });
  
  await batch.commit();
  console.log('Successfully seeded all data.');
}

seed().catch(console.error);
