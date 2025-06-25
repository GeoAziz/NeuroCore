
import type { Timestamp } from 'firebase/firestore';

// --- Base and Role-Specific User Profiles ---

type BaseProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  status: 'Active' | 'Suspended';
  registrationDate: Timestamp;
  lastLogin: Timestamp;
}

export type PatientProfile = BaseProfile & {
  role: 'patient';
  patientData: PatientData;
  privacySettings: PrivacySettings;
}

export type DoctorProfile = BaseProfile & {
  role: 'doctor';
  specialty?: string;
  patients: string[]; // List of patient UIDs
}

export type AdminProfile = BaseProfile & {
  role: 'admin';
}

export type UserProfile = PatientProfile | DoctorProfile | AdminProfile;


// Data specific to a patient, stored in their user document
export interface PatientData {
  cognitiveHealthScore: number;
  moodTrackerData: MoodTrackerDataPoint[];
  riskScore: number; // 0-100, higher is more at-risk
  condition: string; // e.g., "General Anxiety Disorder"
}

export interface MoodTrackerDataPoint {
  name: string; // e.g., 'Mon', 'Tue' or a date string
  mood: number;
  stress: number;
}

// --- Top Level Collection Interfaces ---
export interface Alert {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    type: 'Anomaly' | 'Flag' | 'Info';
    message: string;
    timestamp: Timestamp;
    status: 'New' | 'Viewed';
}

export interface AccessLog {
    id: string;
    viewer: string;
    date: string;
    action: string;
    status: 'Authorized' | 'Violation';
    patientName?: string; // Denormalized for admin view
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
    id:string;
    patientId: string;
    patientName?: string; // Denormalized for easy display
    doctorId: string;
    doctorName?: string; // Denormalized
    doctorAvatar?: string; // Denormalized
    date: Timestamp;
    purpose: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    transcript?: { speaker: string, text: string, timestamp: number }[];
}

export interface SessionLog {
    id: string;
    type: string;
    date: string;
    duration: string;
    result: string;
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
