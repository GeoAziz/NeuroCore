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

// Data specific to a patient
export interface PatientData {
  cognitionScore: {
    value: number;
    change: number;
  };
  mentalHealthGrade: string;
  sleepQuality: number;
  mood: string;
  moodPrediction: string;
}

export interface MoodTrackerDataPoint {
  name: string;
  mood: number;
  stress: number;
}


// Log entries
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
}

// Admin data
export interface AdminAccessLog {
  id: string;
  user: string;
  timestamp: string; // Consider using Timestamp
  action: string;
  status: 'Authorized' | 'Violation';
}

export interface TherapyContent {
  id: string;
  name: string;
  type: 'Audio' | 'Game' | 'VR Sim';
  category: string;
  added: string; // Consider using Timestamp
}

// Privacy settings
export interface PrivacySettings {
    liveTherapyMode: boolean;
    anonymizedResearch: boolean;
    doctorAccess: { [doctorId: string]: boolean };
}

export interface JournalEntry {
    id: string;
    text: string;
    timestamp: Timestamp;
}
