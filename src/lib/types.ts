
import type { Timestamp } from 'firebase/firestore';

// Base user data
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'patient' | 'doctor' | 'admin';
  patientData?: PatientData;
  privacySettings?: PrivacySettings;
}

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

// Admin data - This is now represented by fetching from user subcollections or global collections
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
