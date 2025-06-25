
import 'dotenv/config';
import { auth, firestore } from '../src/lib/firebase/admin';
import type { UserProfile, PatientProfile, DoctorProfile, AdminProfile, PatientData, JournalEntry, MoodTrackerDataPoint, SessionLog, AccessLog, TherapyContent, PrivacySettings } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// --- Data Definitions ---

const moodTrackerData: MoodTrackerDataPoint[] = [
  { name: 'Mon', mood: 4, stress: 6 }, { name: 'Tue', mood: 6, stress: 5 }, { name: 'Wed', mood: 5, stress: 7 },
  { name: 'Thu', mood: 7, stress: 4 }, { name: 'Fri', mood: 8, stress: 3 }, { name: 'Sat', mood: 9, stress: 2 },
  { name: 'Sun', mood: 7, stress: 3 },
];

const defaultPatientData: PatientData = {
    cognitionScore: { value: 8.2, change: 2.1 },
    mentalHealthGrade: 'B+',
    sleepQuality: 89,
    mood: 'Calm',
    moodPrediction: 'Stable',
    moodTrackerData: moodTrackerData,
};

const sessionLogs: Omit<SessionLog, 'id'>[] = [
    { type: 'Focus Gym', date: '2023-10-26 14:30', duration: '30min', result: 'Improved focus by 12%' },
    { type: 'Calm Room', date: '2023-10-25 09:00', duration: '20min', result: 'Stress reduced by 25%' },
];

const accessLogs: Omit<AccessLog, 'id' | 'patientName'>[] = [
    { viewer: 'Dr. Anya Sharma', date: '2023-10-26 14:00', action: 'Viewed Mind Map', status: 'Authorized' as const },
    { viewer: 'AI System', date: '2023-10-26 10:15', action: 'Generated AI Notes', status: 'Authorized' as const },
];

const journalEntries: Omit<JournalEntry, 'id'>[] = [
    { text: "Felt overwhelmed. The focus gym session helped.", timestamp: Timestamp.fromDate(new Date('2023-10-26T19:00:00')) },
    { text: "Feeling positive today. The calm room session must have helped.", timestamp: Timestamp.fromDate(new Date('2023-10-27T10:00:00')) },
];

const therapyContent: Omit<TherapyContent, 'id'>[] = [
    { name: 'Ocean Breath Soundscape', type: 'Audio' as const, category: 'Calm Room', added: '2023-10-01', description: 'Virtual relaxation spaces, soundscapes, and breathing exercises.', image: 'https://placehold.co/1200x800', data_ai_hint: 'calm beach' },
    { name: 'Neuro-Pathways', type: 'Game' as const, category: 'Focus Gym', added: '2023-10-05', description: 'Puzzle games designed to enhance focus and mental acuity.', image: 'https://placehold.co/1200x800', data_ai_hint: 'abstract puzzle' },
    { name: 'Starry Night Simulation', type: 'VR Sim' as const, category: 'Dream States', added: '2023-10-12', description: 'AI-simulated environments based on your current emotions.', image: 'https://placehold.co/1200x800', data_ai_hint: 'surreal dreamscape' },
    { name: 'Mnemonic Palace', type: 'Game' as const, category: 'Memory Maze', added: '2023-10-18', description: 'Strengthen memory recall through interactive challenges.', image: 'https://placehold.co/1200x800', data_ai_hint: 'glowing maze' },
];


async function seed() {
  console.log('Starting database seed...');

  // --- Create/Fetch Auth Users ---
  const usersToSeed = [
    { email: 'patient@neurocore.dev', password: 'password123', displayName: 'John Doe', role: 'patient' as const },
    { email: 'doctor@neurocore.dev', password: 'password123', displayName: 'Dr. Anya Sharma', role: 'doctor' as const },
    { email: 'admin@neurocore.dev', password: 'password123', displayName: 'Sys Admin', role: 'admin' as const },
  ];

  const userRecords = await Promise.all(
    usersToSeed.map(async (user) => {
      try {
        const userRecord = await auth.getUserByEmail(user.email);
        console.log(`User ${user.email} already exists. Updating password...`);
        // Forcefully update the password to ensure it's correct and script is idempotent.
        await auth.updateUser(userRecord.uid, {
            password: user.password,
            displayName: user.displayName,
        });
        return userRecord;
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log(`Creating user: ${user.email}`);
          return auth.createUser({ email: user.email, password: user.password, displayName: user.displayName });
        }
        throw error;
      }
    })
  );
  
  const patientRecord = userRecords.find(u => u.email === 'patient@neurocore.dev')!;
  const doctorRecord = userRecords.find(u => u.email === 'doctor@neurocore.dev')!;
  const adminRecord = userRecords.find(u => u.email === 'admin@neurocore.dev')!;

  const batch = firestore.batch();

  // --- Seed User Profiles ---
  const patientProfile: PatientProfile = {
    uid: patientRecord.uid,
    email: patientRecord.email!,
    displayName: usersToSeed.find(u => u.email === patientRecord.email)?.displayName || 'Patient',
    role: 'patient',
    patientData: defaultPatientData,
    privacySettings: {
        liveTherapyMode: true,
        anonymizedResearch: false,
        doctorAccess: { [doctorRecord.uid]: true },
    }
  };
  batch.set(firestore.collection('users').doc(patientRecord.uid), patientProfile, { merge: true });

  const doctorProfile: DoctorProfile = {
    uid: doctorRecord.uid,
    email: doctorRecord.email!,
    displayName: usersToSeed.find(u => u.email === doctorRecord.email)?.displayName || 'Doctor',
    role: 'doctor',
  };
  batch.set(firestore.collection('users').doc(doctorRecord.uid), doctorProfile, { merge: true });

  const adminProfile: AdminProfile = {
    uid: adminRecord.uid,
    email: adminRecord.email!,
    displayName: usersToSeed.find(u => u.email === adminRecord.email)?.displayName || 'Admin',
    role: 'admin',
  };
  batch.set(firestore.collection('users').doc(adminRecord.uid), adminProfile, { merge: true });


  // --- Seed Patient Subcollections (clear existing first) ---
  const patientSubcollections = ['sessionLogs', 'accessLogs', 'journalEntries'];
  for (const sub of patientSubcollections) {
    const snapshot = await firestore.collection('users').doc(patientRecord.uid).collection(sub).get();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
  }

  sessionLogs.forEach(log => {
      const docRef = firestore.collection('users').doc(patientRecord.uid).collection('sessionLogs').doc();
      batch.set(docRef, log);
  });
  accessLogs.forEach(log => {
       const docRef = firestore.collection('users').doc(patientRecord.uid).collection('accessLogs').doc();
      batch.set(docRef, log);
  });
  journalEntries.forEach(entry => {
       const docRef = firestore.collection('users').doc(patientRecord.uid).collection('journalEntries').doc();
      batch.set(docRef, entry);
  });

  // --- Seed Global Collections ---
  therapyContent.forEach((item, index) => {
    batch.set(firestore.collection('therapyContent').doc(`T${String(index + 1).padStart(2, '0')}`), item);
  });

  await batch.commit();
  console.log('Successfully seeded all data.');
}

seed().catch(console.error);

