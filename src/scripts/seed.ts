
import 'dotenv/config';
import { auth, firestore } from '../src/lib/firebase/admin';
import type { UserProfile, PatientProfile, DoctorProfile, AdminProfile, PatientData, PrivacySettings, NeuralScan, CognitiveTestResult, TherapyModule, Appointment } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// --- Data Definitions ---

const createTimestamp = (daysAgo: number) => Timestamp.fromDate(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));

const moodTrackerData = [
  { name: 'Mon', mood: 4, stress: 6 }, { name: 'Tue', mood: 6, stress: 5 }, { name: 'Wed', mood: 5, stress: 7 },
  { name: 'Thu', mood: 7, stress: 4 }, { name: 'Fri', mood: 8, stress: 3 }, { name: 'Sat', mood: 9, stress: 2 },
  { name: 'Sun', mood: 7, stress: 3 },
];

const defaultPatientData: PatientData = {
    cognitiveHealthScore: 88,
    moodTrackerData: moodTrackerData,
};

// Subcollection data for the patient
const neuralScans: Omit<NeuralScan, 'id'>[] = [
    { type: 'MRI', date: createTimestamp(7), imageUrl: 'https://placehold.co/800x600', findings: ["Elevated activity in the amygdala.", "Normal prefrontal cortex function."], doctorNotes: "Patient shows signs of anxiety, consistent with self-reported stress. Recommend Calm Room therapy." },
    { type: 'EEG', date: createTimestamp(30), imageUrl: 'https://placehold.co/800x600', findings: ["Alpha wave patterns are irregular.", "No epileptic activity detected."], doctorNotes: "Sleep patterns might be disturbed. Follow up in one month." },
];

const cognitiveTests: Omit<CognitiveTestResult, 'id'>[] = [
    { name: 'Memory Maze', date: createTimestamp(28), score: 85, memory: 85, focus: 75, reactionTime: 250 },
    { name: 'Focus Grid', date: createTimestamp(21), score: 88, memory: 82, focus: 85, reactionTime: 240 },
    { name: 'Synapse Speed', date: createTimestamp(14), score: 90, memory: 86, focus: 88, reactionTime: 220 },
    { name: 'Pattern Recognition', date: createTimestamp(7), score: 92, memory: 90, focus: 91, reactionTime: 210 },
];

const therapyModules: Omit<TherapyModule, 'id'>[] = [
    { name: "Mindful VR", type: 'VR', description: "Immerse yourself in calming virtual worlds to reduce stress.", progress: 75, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'vr landscape' },
    { name: "Guided Audio", type: 'Audio', description: "Listen to guided meditations for focus and relaxation.", progress: 40, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'calm meditation' },
    { name: "Biofeedback Sync", type: 'Biofeedback', description: "Learn to control physiological responses through feedback.", progress: 90, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'biofeedback wave' },
    { name: "Dream Weaving", type: 'VR', description: "Explore and understand subconscious patterns in a dream state.", progress: 100, status: 'Completed', image: 'https://placehold.co/600x400', data_ai_hint: 'surreal dream' }
];

const createFutureTimestamp = (daysFromNow: number) => Timestamp.fromDate(new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000));

const appointments = (doctorId: string): Omit<Appointment, 'id'>[] => [
    { doctorId, date: createFutureTimestamp(7), purpose: "Quarterly Cognitive Review", status: 'Scheduled' },
    { doctorId, date: createTimestamp(20), purpose: "Initial Consultation", status: 'Completed', notes: "Patient presented with symptoms of anxiety and sleep disruption. Recommended initial therapy modules and scheduled a follow-up EEG." },
    { doctorId, date: createTimestamp(90), purpose: "Onboarding Session", status: 'Completed', notes: "Introduced patient to the NeuroCore platform and capabilities." },
];

async function seed() {
  console.log('Starting database seed...');

  const usersToSeed = [
    { email: 'patient@neurocore.dev', password: 'password123', displayName: 'John Doe', role: 'patient' as const },
    { email: 'doctor@neurocore.dev', password: 'password123', displayName: 'Dr. Anya Sharma', role: 'doctor' as const, specialty: "Neuropsychology" },
    { email: 'admin@neurocore.dev', password: 'password123', displayName: 'Sys Admin', role: 'admin' as const },
  ];

  const userRecords = await Promise.all(
    usersToSeed.map(async (user) => {
      try {
        let userRecord = await auth.getUserByEmail(user.email).catch(() => null);
        if (userRecord) {
          console.log(`Updating user: ${user.email}`);
          await auth.updateUser(userRecord.uid, { password: user.password, displayName: user.displayName });
          return userRecord;
        } else {
          console.log(`Creating user: ${user.email}`);
          return auth.createUser({ email: user.email, password: user.password, displayName: user.displayName });
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
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
    displayName: 'John Doe',
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
    displayName: 'Dr. Anya Sharma',
    role: 'doctor',
    specialty: 'Neuropsychology',
  };
  batch.set(firestore.collection('users').doc(doctorRecord.uid), doctorProfile, { merge: true });

  const adminProfile: AdminProfile = {
    uid: adminRecord.uid,
    email: adminRecord.email!,
    displayName: 'Sys Admin',
    role: 'admin',
  };
  batch.set(firestore.collection('users').doc(adminRecord.uid), adminProfile, { merge: true });


  // --- Seed Patient Subcollections (clear existing first) ---
  const patientSubcollections = ['neural_scans', 'cognitive_tests', 'therapy_modules', 'appointments'];
  for (const sub of patientSubcollections) {
    const snapshot = await firestore.collection('users').doc(patientRecord.uid).collection(sub).get();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    console.log(`Cleared existing documents in '${sub}' subcollection.`);
  }

  neuralScans.forEach(item => {
      const docRef = firestore.collection('users').doc(patientRecord.uid).collection('neural_scans').doc();
      batch.set(docRef, item);
  });
  cognitiveTests.forEach(item => {
      const docRef = firestore.collection('users').doc(patientRecord.uid).collection('cognitive_tests').doc();
      batch.set(docRef, item);
  });
  therapyModules.forEach(item => {
      const docRef = firestore.collection('users').doc(patientRecord.uid).collection('therapy_modules').doc();
      batch.set(docRef, item);
  });
  appointments(doctorRecord.uid).forEach(item => {
      const docRef = firestore.collection('users').doc(patientRecord.uid).collection('appointments').doc();
      batch.set(docRef, item);
  });
  
  await batch.commit();
  console.log('Successfully seeded all data.');
}

seed().catch(console.error);
