
import type { Timestamp } from 'firebase/firestore';

// --- Base and Role-Specific User Profiles ---

// Using a discriminated union for UserProfile makes our code type-safe.
// We can be sure that if a user has the role 'patient', they will have patientData.

type BaseProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type PatientProfile = BaseProfile & {
  role: 'patient';
  patientData: PatientData;
  privacySettings: PrivacySettings;
}

export type DoctorProfile = BaseProfile & {
  role: 'doctor';
}

export type AdminProfile = BaseProfile & {
  role: 'admin';
}

export type UserProfile = PatientProfile | DoctorProfile | AdminProfile;


// Data specific to a patient, stored in their user document
export interface PatientData {
  cognitionScore: {
    value: number;
    change: number;
  };
  mentalHealthGrade: string;
  sleepQuality: number;
  mood: string;
  moodPrediction: string;
  moodTrackerData: MoodTrackerDataPoint[];
}

export interface MoodTrackerDataPoint {
  name: string;
  mood: number;
  stress: number;
}


// Log entries, stored in subcollections of a user document
export interface SessionLog {
  id: string;
  type: string;
  date: string; // Consider using Timestamp for better querying
  duration: string;
  result: string;
}

export interface AccessLog {
  id: string;
  viewer: string;
  date: string; // Consider using Timestamp
  action: string;
  status: 'Authorized' | 'Violation';
  patientName?: string; // Used for aggregated views in Admin console
}

export interface TherapyContent {
  id: string;
  name: string;
  type: 'Audio' | 'Game' | 'VR Sim';
  category: string;
  added: string; // Consider using Timestamp
  description: string;
  image: string;
  data_ai_hint: string;
}

// Privacy settings, stored in the user document
export interface PrivacySettings {
    liveTherapyMode: boolean;
    anonymizedResearch: boolean;
    doctorAccess: { [doctorId: string]: boolean };
}

export interface JournalEntry {
    id:string;
    text: string;
    timestamp: Timestamp;
}
