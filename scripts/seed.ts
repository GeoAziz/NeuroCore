import 'dotenv/config';
import { auth, firestore } from '../src/lib/firebase/admin';
import type { UserProfile } from '@/lib/types';

// --- Seed Data ---

const usersToCreate = [
  {
    email: 'patient@neurocore.dev',
    password: 'password123',
    displayName: 'John Doe',
    role: 'patient' as const,
    patientData: {
      cognitionScore: { value: 8.2, change: 2.1 },
      mentalHealthGrade: 'B+',
      sleepQuality: 89,
      mood: 'Calm',
      moodPrediction: 'Stable',
    },
    privacySettings: {
        liveTherapyMode: true,
        anonymizedResearch: false,
        doctorAccess: {}, // will be populated with doctor's UID
    }
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

const moodTrackerData = [
  { name: 'Mon', mood: 4, stress: 6 },
  { name: 'Tue', mood: 6, stress: 5 },
  { name: 'Wed', mood: 5, stress: 7 },
  { name: 'Thu', mood: 7, stress: 4 },
  { name: 'Fri', mood: 8, stress: 3 },
  { name: 'Sat', mood: 9, stress: 2 },
  { name: 'Sun', mood: 7, stress: 3 },
];

const sessionLogs = [
    { id: 'S001', type: 'Focus Gym', date: '2023-10-26 14:30', duration: '30min', result: 'Improved focus by 12%' },
    { id: 'S002', type: 'Calm Room', date: '2023-10-25 09:00', duration: '20min', result: 'Stress reduced by 25%' },
    { id: 'S003', type: 'Dream Sim', date: '2023-10-24 22:00', duration: '45min', result: 'Resolved anxiety triggers' },
    { id: 'S004', type: 'Memory Maze', date: '2023-10-23 11:00', duration: '25min', result: 'Memory recall up by 8%' },
];

const accessLogs = [
    { id: 'L001', viewer: 'Dr. Evelyn Reed', date: '2023-10-26 14:00', action: 'Viewed Mind Map' },
    { id: 'L002', viewer: 'AI System', date: '2023-10-26 10:15', action: 'Generated AI Notes' },
    { id: 'L003', viewer: 'Dr. Kenji Tanaka', date: '2023-10-25 11:30', action: 'Accessed Session Logs' },
];

const therapyContent = [
    { id: 'T01', name: 'Ocean Breath Soundscape', type: 'Audio', category: 'Calm Room', added: '2023-10-01' },
    { id: 'T02', name: 'Neuro-Pathways', type: 'Game', category: 'Focus Gym', added: '2023-10-05' },
    { id: 'T03', name: 'Starry Night Simulation', type: 'VR Sim', category: 'Dream States', added: '2023-10-12' },
    { id: 'T04', name: 'Mnemonic Palace', type: 'Game', category: 'Memory Maze', added: '2023-10-18' },
];

async function seed() {
  console.log('Starting database seed...');

  // --- Create Users ---
  let doctorUid = '';
  const userPromises = usersToCreate.map(async (user) => {
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
      
      const userProfile: Omit<UserProfile, 'patientData' | 'privacySettings'> = {
        uid: userRecord.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      };

      await firestore.collection('users').doc(userRecord.uid).set(userProfile);
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
    }
  });

  const createdUsers = (await Promise.all(userPromises)).filter(Boolean);
  const patientUser = createdUsers.find(u => u?.role === 'patient');

  if (!patientUser) {
    console.error('Patient user was not created. Aborting patient-specific seed.');
    return;
  }
  
  if(patientUser.privacySettings && doctorUid) {
      patientUser.privacySettings.doctorAccess[doctorUid] = true;
  }

  console.log("Setting patient specific data...")
  await firestore.collection('users').doc(patientUser.uid).set({
    patientData: patientUser.patientData,
    privacySettings: patientUser.privacySettings
  }, { merge: true });

  const batch = firestore.batch();

  // --- Seed Patient Subcollections ---
  const moodTrackerCol = firestore.collection('users').doc(patientUser.uid).collection('moodTracker');
  moodTrackerData.forEach((data, i) => {
    batch.set(moodTrackerCol.doc(String(i)), data);
  });

  const sessionLogsCol = firestore.collection('users').doc(patientUser.uid).collection('sessionLogs');
  sessionLogs.forEach(log => {
    batch.set(sessionLogsCol.doc(log.id), log);
  });

  const accessLogsCol = firestore.collection('users').doc(patientUser.uid).collection('accessLogs');
  accessLogs.forEach(log => {
      const logWithDoctor = {...log, viewer: log.viewer.includes('Dr.') ? createdUsers.find(u => u?.role === 'doctor')?.displayName || log.viewer : log.viewer};
      batch.set(accessLogsCol.doc(log.id), logWithDoctor);
  });
  
  // --- Seed Global Collections ---
  const therapyContentCol = firestore.collection('therapyContent');
  therapyContent.forEach(item => {
    batch.set(therapyContentCol.doc(item.id), item);
  });
  
  await batch.commit();
  console.log('Successfully seeded all data.');
}

seed().catch(console.error);
