'use client';

import { create } from 'zustand';
import type { Skill, CareerPath, Course, UserProfile, Achievement } from '@/types';

const SAMPLE_SKILLS: Skill[] = [
  { id: 's1', name: 'Quality Control', category: 'Operations', level: 'expert', transferable: true, years: 12 },
  { id: 's2', name: 'Process Documentation', category: 'Operations', level: 'advanced', transferable: true, years: 10 },
  { id: 's3', name: 'Data Analysis', category: 'Analytical', level: 'intermediate', transferable: true, years: 5 },
  { id: 's4', name: 'Team Leadership', category: 'Management', level: 'advanced', transferable: true, years: 8 },
  { id: 's5', name: 'Microsoft Excel', category: 'Software', level: 'advanced', transferable: true, years: 12 },
  { id: 's6', name: 'Root Cause Analysis', category: 'Analytical', level: 'expert', transferable: true, years: 10 },
  { id: 's7', name: 'Compliance & Regulations', category: 'Operations', level: 'advanced', transferable: true, years: 8 },
  { id: 's8', name: 'Report Writing', category: 'Communication', level: 'intermediate', transferable: true, years: 6 },
  { id: 's9', name: 'Six Sigma', category: 'Methodology', level: 'intermediate', transferable: true, years: 4 },
  { id: 's10', name: 'Machine Operation', category: 'Technical', level: 'expert', transferable: false, years: 18 },
];

const SAMPLE_PATHS: CareerPath[] = [
  {
    id: 'cp1',
    title: 'Data Quality Analyst',
    industry: 'Technology',
    median_salary: 78000,
    growth_rate: '+22%',
    match_score: 87,
    skills_overlap: 7,
    skills_gap: 3,
    time_to_ready_weeks: 12,
    description: 'Use your quality control expertise to ensure data accuracy and integrity in tech organizations. Your existing skills in anomaly detection and process documentation map directly to this role.',
    required_skills: ['SQL', 'Python Basics', 'Data Quality Tools', 'Quality Control', 'Documentation', 'Root Cause Analysis', 'Excel', 'Compliance', 'Report Writing', 'Analytical Thinking'],
    transferable_skills: ['Quality Control', 'Process Documentation', 'Data Analysis', 'Root Cause Analysis', 'Compliance & Regulations', 'Report Writing', 'Microsoft Excel'],
    missing_skills: ['SQL', 'Python Basics', 'Data Quality Tools'],
    status: 'active',
  },
  {
    id: 'cp2',
    title: 'Compliance Specialist',
    industry: 'Finance / Healthcare',
    median_salary: 72000,
    growth_rate: '+18%',
    match_score: 82,
    skills_overlap: 6,
    skills_gap: 2,
    time_to_ready_weeks: 8,
    description: 'Your compliance background and attention to detail are highly valued in financial services and healthcare. This transition leverages your strongest skills with minimal retraining.',
    required_skills: ['Regulatory Knowledge', 'Risk Assessment', 'Compliance & Regulations', 'Documentation', 'Root Cause Analysis', 'Report Writing', 'Excel', 'Audit Skills'],
    transferable_skills: ['Compliance & Regulations', 'Process Documentation', 'Root Cause Analysis', 'Report Writing', 'Microsoft Excel', 'Quality Control'],
    missing_skills: ['Regulatory Knowledge', 'Risk Assessment'],
    status: 'exploring',
  },
  {
    id: 'cp3',
    title: 'Operations Analyst',
    industry: 'Business Services',
    median_salary: 68000,
    growth_rate: '+15%',
    match_score: 79,
    skills_overlap: 6,
    skills_gap: 3,
    time_to_ready_weeks: 10,
    description: 'Bridge your manufacturing experience to office-based operations roles. Business process analysis, efficiency optimization, and performance metrics are all in your wheelhouse.',
    required_skills: ['Process Improvement', 'Data Visualization', 'Project Management', 'Operations', 'Analysis', 'Documentation', 'Leadership', 'Excel'],
    transferable_skills: ['Team Leadership', 'Process Documentation', 'Data Analysis', 'Quality Control', 'Root Cause Analysis', 'Microsoft Excel'],
    missing_skills: ['Data Visualization', 'Project Management Software', 'Business Analytics'],
    status: 'exploring',
  },
];

const SAMPLE_COURSES: Course[] = [
  { id: 'c1', title: 'SQL for Data Analysis', provider: 'Coursera', duration_hours: 20, cost: 0, skill_id: 'sql', skill_name: 'SQL', url: '#', status: 'in_progress', progress: 45, rating: 4.8 },
  { id: 'c2', title: 'Python for Beginners', provider: 'freeCodeCamp', duration_hours: 30, cost: 0, skill_id: 'python', skill_name: 'Python Basics', url: '#', status: 'not_started', progress: 0, rating: 4.7 },
  { id: 'c3', title: 'Data Quality Fundamentals', provider: 'Udemy', duration_hours: 12, cost: 14, skill_id: 'dq', skill_name: 'Data Quality Tools', url: '#', status: 'not_started', progress: 0, rating: 4.6 },
  { id: 'c4', title: 'Excel Advanced Functions', provider: 'LinkedIn Learning', duration_hours: 8, cost: 30, skill_id: 's5', skill_name: 'Microsoft Excel', url: '#', status: 'completed', progress: 100, rating: 4.5 },
  { id: 'c5', title: 'Introduction to Risk Management', provider: 'edX', duration_hours: 16, cost: 0, skill_id: 'risk', skill_name: 'Risk Assessment', url: '#', status: 'not_started', progress: 0, rating: 4.4 },
];

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Step', description: 'Completed your skills assessment', icon: '🎯', earned: true, earned_at: '2025-01-10' },
  { id: 'a2', title: 'Pathfinder', description: 'Explored your first career path', icon: '🗺️', earned: true, earned_at: '2025-01-11' },
  { id: 'a3', title: 'Learner', description: 'Started your first course', icon: '📚', earned: true, earned_at: '2025-01-15' },
  { id: 'a4', title: 'Skilled', description: 'Completed 5 courses', icon: '⭐', earned: false },
  { id: 'a5', title: 'Half Way There', description: 'Completed 50% of your learning plan', icon: '🏃', earned: false },
  { id: 'a6', title: 'Ready to Launch', description: 'Closed all critical skills gaps', icon: '🚀', earned: false },
];

interface AppState {
  user: UserProfile;
  skills: Skill[];
  paths: CareerPath[];
  courses: Course[];
  achievements: Achievement[];
  activePathId: string | null;
  overallProgress: number;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  setActivePath: (id: string) => void;
  addSkill: (skill: Skill) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    name: 'Maria Rodriguez',
    current_role: 'Quality Control Supervisor',
    years_experience: 18,
    education: 'Associate Degree, Manufacturing Technology',
    location: 'Detroit, MI',
    target_salary: 65000,
  },
  skills: SAMPLE_SKILLS,
  paths: SAMPLE_PATHS,
  courses: SAMPLE_COURSES,
  achievements: SAMPLE_ACHIEVEMENTS,
  activePathId: 'cp1',
  overallProgress: 32,
  updateCourse: (id, updates) => set((s) => ({
    courses: s.courses.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),
  setActivePath: (id) => set({ activePathId: id }),
  addSkill: (skill) => set((s) => ({ skills: [...s.skills, skill] })),
}));
