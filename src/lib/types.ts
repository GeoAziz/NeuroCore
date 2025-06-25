
import type { Timestamp } from 'firebase/firestore';

// --- Base and Role-Specific User Profiles ---

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
  specialty?: string;
}

export type AdminProfile = BaseProfile & {
  role: 'admin';
}

export type UserProfile = PatientProfile | DoctorProfile | AdminProfile;


// Data specific to a patient, stored in their user document
export interface PatientData {
  cognitiveHealthScore: number;
  moodTrackerData: MoodTrackerDataPoint[];
}

export interface MoodTrackerDataPoint {
  name: string; // e.g., 'Mon', 'Tue' or a date string
  mood: number;
  stress: number;
}

// --- Subcollection Interfaces ---

export interface NeuralScan {
    id: string;
    type: 'MRI' | 'EEG';
    date: Timestamp;
    imageUrl: string;
    findings: string[];
    doctorNotes: string;
}

export interface CognitiveTestResult {
    id: string;
    name: string; // e.g., 'Memory Maze', 'Focus Grid'
    date: Timestamp;
    score: number;
    // Specific metrics
    memory: number; // as percentage
    focus: number; // as percentage
    reactionTime: number; // in milliseconds
}

export interface TherapyModule {
    id: string;
    name: string;
    type: 'VR' | 'Audio' | 'Biofeedback';
    description: string;
    progress: number; // percentage
    status: 'Not Started' | 'In Progress' | 'Completed';
    image: string;
    data_ai_hint: string;
}

export interface Appointment {
    id: string;
    doctorId: string;
    doctorName?: string; // Denormalized for easy display
    doctorAvatar?: string; // Denormalized
    date: Timestamp;
    purpose: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    transcript?: { speaker: string, text: string, timestamp: number }[];
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
