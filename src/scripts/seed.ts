
import 'dotenv/config';
import { auth, firestore } from '../src/lib/firebase/admin';
import type { UserProfile, JournalEntry, MoodTrackerDataPoint, SessionLog, AccessLog } from '@/lib/types';
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

const accessLogs: Omit<AccessLog, 'id'>[] = [
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

const therapyContent = [
    { id: 'T01', name: 'Ocean Breath Soundscape', type: 'Audio' as const, category: 'Calm Room', added: '2023-10-01', description: 'Virtual relaxation spaces, soundscapes, and breathing exercises.', image: 'https://placehold.co/1200x800', data_ai_hint: 'calm beach' },
    { id: 'T02', name: 'Neuro-Pathways', type: 'Game' as const, category: 'Focus Gym', added: '2023-10-05', description: 'Puzzle games designed to enhance focus and mental acuity.', image: 'https://placehold.co/1200x800', data_ai_hint: 'abstract puzzle' },
    { id: 'T03', name: 'Starry Night Simulation', type: 'VR Sim' as const, category: 'Dream States', added: '2023-10-12', description: 'AI-simulated environments based on your current emotions.', image: 'https://placehold.co/1200x800', data_ai_hint: 'surreal dreamscape' },
    { id: 'T04', name: 'Mnemonic Palace', type: 'Game' as const, category: 'Memory Maze', added: '2023-10-18', description: 'Strengthen memory recall through interactive challenges.', image: 'https://placehold.co/1200x800', data_ai_hint: 'glowing maze' },
];

async function seed() {
  console.log('Starting database seed...');
  let doctorUid = '';
  
  // --- Create Users and Base Profiles ---
  const userCreationPromises = usersToCreate.map(async (user) => {
    try {
      console.log(`Creating user: ${user.email}`);
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
      });

      if(user.role === 'doctor') {
        doctorUid = userRecord.uid;
      }
      
      const userProfile: Partial<UserProfile> = {
        uid: userRecord.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      };

      await firestore.collection('users').doc(userRecord.uid).set(userProfile, { merge: true });
      console.log(`Successfully created user: ${user.email} (UID: ${userRecord.uid})`);
      return { ...user, uid: userRecord.uid };
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`User ${user.email} already exists. Fetching...`);
        const userRecord = await auth.getUserByEmail(user.email);
        if(user.role === 'doctor') {
            doctorUid = userRecord.uid;
        }
        return { ...user, uid: userRecord.uid };
      }
      console.error(`Failed to create user ${user.email}:`, error);
      return null;
    }
  });

  const createdUsers = (await Promise.all(userCreationPromises)).filter((u): u is NonNullable<typeof u> => u !== null);
  const patientUser = createdUsers.find(u => u.role === 'patient');

  if (!patientUser) {
    console.error('Patient user was not created. Aborting patient-specific seed.');
    return;
  }
  
  // --- Prepare Patient-Specific Data ---
  const patientPrivacySettings = {
      liveTherapyMode: true,
      anonymizedResearch: false,
      doctorAccess: { [doctorUid]: true },
  };

  const patientFullData = {
      cognitionScore: { value: 8.2, change: 2.1 },
      mentalHealthGrade: 'B+',
      sleepQuality: 89,
      mood: 'Calm',
      moodPrediction: 'Stable',
      moodTrackerData: moodTrackerData,
      sessionLogs: sessionLogs.map((log, index) => ({...log, id: `S${String(index).padStart(3, '0')}`})),
      accessLogs: accessLogs.map((log, index) => ({...log, id: `L${String(index).padStart(3, '0')}`})),
  };
  
  // --- Update Patient Document with Full Data ---
  console.log("Setting patient specific data...")
  await firestore.collection('users').doc(patientUser.uid).set({
    patientData: patientFullData,
    privacySettings: patientPrivacySettings,
  }, { merge: true });

  // --- Seed Journal Entries Subcollection for Patient ---
  const journalBatch = firestore.batch();
  const journalEntriesCol = firestore.collection('users').doc(patientUser.uid).collection('journalEntries');
  journalEntries.forEach(entry => {
    const docRef = journalEntriesCol.doc();
    journalBatch.set(docRef, entry);
  });
  await journalBatch.commit();


  // --- Seed Global Collections ---
  const contentBatch = firestore.batch();
  const therapyContentCol = firestore.collection('therapyContent');
  therapyContent.forEach(item => {
    contentBatch.set(therapyContentCol.doc(item.id), item);
  });
  await contentBatch.commit();
  
  console.log('Successfully seeded all data.');
}

seed().catch(console.error);
