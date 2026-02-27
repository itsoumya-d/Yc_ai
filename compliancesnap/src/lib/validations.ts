import { z } from 'zod';

export const facilityFormSchema = z.object({
  name: z.string().min(1, 'Facility name is required').max(200),
  location: z.string().min(1, 'Location is required').max(300),
  score: z.number().int().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100'),
  violations_open: z.number().int().min(0).default(0),
  last_inspection: z.string().min(1, 'Last inspection date is required'),
});

export const violationFormSchema = z.object({
  title: z.string().min(1, 'Violation title is required').max(300),
  severity: z.enum(['critical', 'major', 'minor', 'observation']),
  regulation: z.string().min(1, 'Regulation reference is required').max(200),
  location: z.string().min(1, 'Location is required').max(300),
  status: z.enum(['pending', 'in-progress', 'completed', 'overdue']).default('pending'),
  detected_at: z.string().min(1, 'Detection date is required'),
});

export const inspectionFormSchema = z.object({
  facility: z.string().min(1, 'Facility is required').max(200),
  type: z.string().min(1, 'Inspection type is required').max(100),
  status: z.enum(['draft', 'in-progress', 'completed', 'syncing']).default('draft'),
  violations_found: z.number().int().min(0).default(0),
  score: z.number().int().min(0).max(100).default(100),
  date: z.string().min(1, 'Inspection date is required'),
  inspector: z.string().min(1, 'Inspector name is required').max(200),
});

export const correctiveActionFormSchema = z.object({
  violation_title: z.string().min(1, 'Violation title is required').max(300),
  severity: z.enum(['critical', 'major', 'minor', 'observation']),
  assigned_to: z.string().min(1, 'Assignee is required').max(200),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['pending', 'in-progress', 'completed', 'overdue']).default('pending'),
});

export const settingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  organizationName: z.string().min(1, 'Organization name is required').max(200),
  userName: z.string().min(1, 'User name is required').max(200),
  userRole: z.string().min(1, 'User role is required').max(100),
});

export type FacilityFormData = z.infer<typeof facilityFormSchema>;
export type ViolationFormData = z.infer<typeof violationFormSchema>;
export type InspectionFormData = z.infer<typeof inspectionFormSchema>;
export type CorrectiveActionFormData = z.infer<typeof correctiveActionFormSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
