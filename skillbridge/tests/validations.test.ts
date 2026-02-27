import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  skillSchema,
  profileSchema,
  careerFilterSchema,
  jobFilterSchema,
  questionnaireAnswerSchema,
  resumeSchema,
  applicationStatusSchema,
} from '@/lib/validations/schemas';

describe('signUpSchema', () => {
  it('accepts valid sign-up data', () => {
    const result = signUpSchema.safeParse({
      email: 'maria@example.com',
      password: 'securepassword123',
      full_name: 'Maria Gonzalez',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'securepassword123',
      full_name: 'Maria',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'maria@example.com',
      password: '123',
      full_name: 'Maria',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = signUpSchema.safeParse({
      email: 'maria@example.com',
      password: 'securepassword123',
      full_name: 'M',
    });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'maria@example.com',
      password: 'any-password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'maria@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('skillSchema', () => {
  it('accepts valid skill data', () => {
    const result = skillSchema.safeParse({
      name: 'Data Analysis',
      category: 'analytical',
      proficiency: 'intermediate',
      source: 'resume',
    });
    expect(result.success).toBe(true);
  });

  it('defaults proficiency to beginner', () => {
    const result = skillSchema.safeParse({
      name: 'Excel',
      category: 'tools',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.proficiency).toBe('beginner');
    }
  });

  it('rejects invalid category', () => {
    const result = skillSchema.safeParse({
      name: 'Cooking',
      category: 'culinary',
      proficiency: 'expert',
    });
    expect(result.success).toBe(false);
  });

  it('rejects skill name with special characters', () => {
    const result = skillSchema.safeParse({
      name: 'Skill <script>alert("xss")</script>',
      category: 'technical',
    });
    expect(result.success).toBe(false);
  });

  it('accepts skill name with allowed special chars (C++, C#, .NET)', () => {
    const names = ['C++', 'C#', '.NET', 'Node.js', 'HTML/CSS'];
    for (const name of names) {
      const result = skillSchema.safeParse({ name, category: 'technical' });
      expect(result.success).toBe(true);
    }
  });

  it('validates optional onet_code format', () => {
    const valid = skillSchema.safeParse({
      name: 'Management',
      category: 'managerial',
      onet_code: '15-1252.00',
    });
    expect(valid.success).toBe(true);

    const invalid = skillSchema.safeParse({
      name: 'Management',
      category: 'managerial',
      onet_code: 'invalid-code',
    });
    expect(invalid.success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts valid profile data', () => {
    const result = profileSchema.safeParse({
      current_industry: 'Manufacturing',
      current_job_title: 'Quality Inspector',
      years_experience: 12,
      education_level: 'high_school',
      is_currently_employed: true,
      weekly_learning_hours: 10,
      course_budget: 'free_only',
    });
    expect(result.success).toBe(true);
  });

  it('uses defaults for optional fields', () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.years_experience).toBe(0);
      expect(result.data.weekly_learning_hours).toBe(5);
      expect(result.data.course_budget).toBe('free_only');
    }
  });

  it('rejects excessive years experience', () => {
    const result = profileSchema.safeParse({
      years_experience: 75,
    });
    expect(result.success).toBe(false);
  });
});

describe('careerFilterSchema', () => {
  it('accepts valid filter data', () => {
    const result = careerFilterSchema.safeParse({
      industry: ['technology', 'healthcare'],
      salary_min: 40000,
      salary_max: 100000,
      remote_min: 50,
      sort_by: 'salary',
    });
    expect(result.success).toBe(true);
  });

  it('defaults sort to match_score', () => {
    const result = careerFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort_by).toBe('match_score');
    }
  });

  it('rejects invalid sort value', () => {
    const result = careerFilterSchema.safeParse({
      sort_by: 'random',
    });
    expect(result.success).toBe(false);
  });
});

describe('jobFilterSchema', () => {
  it('accepts valid job filter data', () => {
    const result = jobFilterSchema.safeParse({
      min_score: 70,
      is_remote: true,
      career_changer_friendly: true,
      posted_within_days: 7,
      job_type: ['full_time', 'contract'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects score out of range', () => {
    const result = jobFilterSchema.safeParse({
      min_score: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe('applicationStatusSchema', () => {
  it('accepts valid status update', () => {
    const result = applicationStatusSchema.safeParse({
      job_match_id: '123e4567-e89b-12d3-a456-426614174000',
      status: 'applied',
      notes: 'Applied through company website',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = applicationStatusSchema.safeParse({
      job_match_id: '123e4567-e89b-12d3-a456-426614174000',
      status: 'hired',
    });
    expect(result.success).toBe(false);
  });
});

describe('resumeSchema', () => {
  it('accepts valid resume data', () => {
    const result = resumeSchema.safeParse({
      career_path_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Data Analyst Resume',
      template: 'modern',
      professional_summary: 'Career changer with strong analytical skills.',
    });
    expect(result.success).toBe(true);
  });

  it('defaults template to modern', () => {
    const result = resumeSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.template).toBe('modern');
    }
  });
});
