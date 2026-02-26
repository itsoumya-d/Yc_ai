'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Star,
  Sparkles,
  Pencil,
  Trash2,
  X,
  GripVertical,
  Eye,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import {
  createResume,
  updateResume,
  deleteResume,
  setPrimaryResume,
} from '@/lib/actions/resume';
import { formatDate } from '@/lib/utils';
import type { Resume, Skill, Profile } from '@/types/database';

/* ---- Types ---- */

interface ResumeBuilderProps {
  resumes: Resume[];
  skills: Skill[];
  profile: Profile | null;
}

interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  year: string;
}

interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  selectedSkills: string[];
}

/* ---- Helpers ---- */

const TEMPLATE_OPTIONS: { value: Resume['template']; label: string }[] = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
  { value: 'executive', label: 'Executive' },
];

function getTemplateBadgeVariant(template: Resume['template']): BadgeVariant {
  switch (template) {
    case 'modern':
      return 'default';
    case 'classic':
      return 'secondary';
    case 'minimal':
      return 'outline';
    case 'creative':
      return 'sunrise';
    case 'executive':
      return 'warning';
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseResumeContent(
  content: Record<string, unknown>,
  profile: Profile | null,
  skills: Skill[]
): ResumeContent {
  const c = content as Partial<ResumeContent>;
  return {
    personalInfo: {
      name: c.personalInfo?.name ?? profile?.full_name ?? '',
      email: c.personalInfo?.email ?? '',
      phone: c.personalInfo?.phone ?? '',
      location: c.personalInfo?.location ?? profile?.location ?? '',
    },
    summary: c.summary ?? '',
    experience: (c.experience ?? []).map((e) => ({
      ...e,
      id: e.id || generateId(),
    })),
    education: (c.education ?? []).map((e) => ({
      ...e,
      id: e.id || generateId(),
    })),
    selectedSkills:
      c.selectedSkills ?? skills.map((s) => s.name),
  };
}

/* ---- Main Component ---- */

export function ResumeBuilder({ resumes, skills, profile }: ResumeBuilderProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // Dialog states
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // New resume form
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState<Resume['template']>('modern');
  const [newTargetRole, setNewTargetRole] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected resume editor
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<ResumeContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  const selectedResume = resumes.find((r) => r.id === selectedId) ?? null;

  // Select a resume and load its content
  const selectResume = useCallback(
    (resume: Resume) => {
      setSelectedId(resume.id);
      setEditorContent(
        parseResumeContent(resume.content, profile, skills)
      );
    },
    [profile, skills]
  );

  // Create new resume
  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const resume = await createResume({
        title: newTitle.trim(),
        template: newTemplate,
        target_role: newTargetRole.trim() || undefined,
      });
      addToast('Resume created successfully', 'success');
      setShowNewDialog(false);
      setNewTitle('');
      setNewTemplate('modern');
      setNewTargetRole('');
      router.refresh();
      // auto-select the new resume
      selectResume(resume);
    } catch {
      addToast('Failed to create resume', 'error');
    } finally {
      setCreating(false);
    }
  }

  // Save editor content
  async function handleSave() {
    if (!selectedId || !editorContent) return;
    setSaving(true);
    try {
      await updateResume(selectedId, {
        content: editorContent as unknown as Record<string, unknown>,
      });
      addToast('Resume saved', 'success');
      router.refresh();
    } catch {
      addToast('Failed to save resume', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Delete resume
  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await deleteResume(id);
      addToast('Resume deleted', 'success');
      if (selectedId === id) {
        setSelectedId(null);
        setEditorContent(null);
      }
      setShowDeleteDialog(null);
      router.refresh();
    } catch {
      addToast('Failed to delete resume', 'error');
    } finally {
      setDeleting(false);
    }
  }

  // Set primary
  async function handleSetPrimary(id: string) {
    setSettingPrimary(id);
    try {
      await setPrimaryResume(id);
      addToast('Primary resume updated', 'success');
      router.refresh();
    } catch {
      addToast('Failed to set primary resume', 'error');
    } finally {
      setSettingPrimary(null);
    }
  }

  // Editor field updaters
  function updatePersonalInfo(
    field: keyof ResumeContent['personalInfo'],
    value: string
  ) {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      personalInfo: { ...editorContent.personalInfo, [field]: value },
    });
  }

  function addExperience() {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      experience: [
        ...editorContent.experience,
        {
          id: generateId(),
          jobTitle: '',
          company: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    });
  }

  function updateExperience(
    id: string,
    field: keyof ExperienceEntry,
    value: string
  ) {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      experience: editorContent.experience.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  }

  function removeExperience(id: string) {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      experience: editorContent.experience.filter((e) => e.id !== id),
    });
  }

  function addEducation() {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      education: [
        ...editorContent.education,
        { id: generateId(), degree: '', school: '', year: '' },
      ],
    });
  }

  function updateEducation(
    id: string,
    field: keyof EducationEntry,
    value: string
  ) {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      education: editorContent.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  }

  function removeEducation(id: string) {
    if (!editorContent) return;
    setEditorContent({
      ...editorContent,
      education: editorContent.education.filter((e) => e.id !== id),
    });
  }

  function toggleSkill(skillName: string) {
    if (!editorContent) return;
    const selected = editorContent.selectedSkills;
    setEditorContent({
      ...editorContent,
      selectedSkills: selected.includes(skillName)
        ? selected.filter((s) => s !== skillName)
        : [...selected, skillName],
    });
  }

  return (
    <div>
      <PageHeader title="Resume Builder" description="Create and manage your resumes">
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4" />
          New Resume
        </Button>
      </PageHeader>

      {resumes.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Create your first resume"
              description="Build a professional resume tailored to your target roles. Choose from multiple templates and let AI optimize your content."
              action={{
                label: 'Create Resume',
                onClick: () => setShowNewDialog(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resume Cards Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className={`cursor-pointer transition-all duration-normal hover:shadow-card-hover ${
                  selectedId === resume.id
                    ? 'ring-2 ring-brand-500 shadow-card-hover'
                    : ''
                }`}
                onClick={() => selectResume(resume)}
              >
                <CardContent className="p-5">
                  {/* Title & Primary Star */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold text-[var(--card-foreground)] line-clamp-1">
                      {resume.title}
                    </h3>
                    {resume.is_primary && (
                      <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  {/* Badges */}
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={getTemplateBadgeVariant(resume.template)}
                      size="sm"
                    >
                      {resume.template.charAt(0).toUpperCase() +
                        resume.template.slice(1)}
                    </Badge>
                    {resume.is_primary && (
                      <Badge variant="warning" size="sm">
                        <Star className="mr-0.5 h-3 w-3" />
                        Primary
                      </Badge>
                    )}
                    {resume.ai_optimized && (
                      <Badge variant="success" size="sm">
                        <Sparkles className="mr-0.5 h-3 w-3" />
                        AI Optimized
                      </Badge>
                    )}
                  </div>

                  {/* Target Role */}
                  {resume.target_role && (
                    <p className="mb-2 text-sm text-[var(--muted-foreground)] line-clamp-1">
                      Target: {resume.target_role}
                    </p>
                  )}

                  {/* Updated date */}
                  <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                    Updated {formatDate(resume.updated_at)}
                  </p>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => selectResume(resume)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    {!resume.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(resume.id)}
                        isLoading={settingPrimary === resume.id}
                      >
                        <Star className="h-3.5 w-3.5" />
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(resume.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Resume Editor */}
          {selectedResume && editorContent && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left: Editor Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5" />
                    Edit: {selectedResume.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Info */}
                  <section>
                    <h4 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Full Name"
                        value={editorContent.personalInfo.name}
                        onChange={(e) =>
                          updatePersonalInfo('name', e.target.value)
                        }
                        placeholder="John Doe"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={editorContent.personalInfo.email}
                        onChange={(e) =>
                          updatePersonalInfo('email', e.target.value)
                        }
                        placeholder="john@example.com"
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={editorContent.personalInfo.phone}
                        onChange={(e) =>
                          updatePersonalInfo('phone', e.target.value)
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                      <Input
                        label="Location"
                        value={editorContent.personalInfo.location}
                        onChange={(e) =>
                          updatePersonalInfo('location', e.target.value)
                        }
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </section>

                  {/* Summary */}
                  <section>
                    <h4 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                      Professional Summary
                    </h4>
                    <div className="space-y-1.5">
                      <textarea
                        value={editorContent.summary}
                        onChange={(e) =>
                          setEditorContent({
                            ...editorContent,
                            summary: e.target.value,
                          })
                        }
                        placeholder="Write a brief professional summary highlighting your key strengths and career goals..."
                        rows={4}
                        className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
                      />
                    </div>
                  </section>

                  {/* Experience */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[var(--foreground)]">
                        Experience
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addExperience}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                    {editorContent.experience.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        No experience entries yet. Click &quot;Add&quot; to add
                        your work history.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {editorContent.experience.map((exp) => (
                          <div
                            key={exp.id}
                            className="rounded-lg border border-[var(--border)] p-4"
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <GripVertical className="mt-1 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                              <button
                                onClick={() => removeExperience(exp.id)}
                                className="shrink-0 rounded p-1 text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <Input
                                label="Job Title"
                                value={exp.jobTitle}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    'jobTitle',
                                    e.target.value
                                  )
                                }
                                placeholder="Software Engineer"
                              />
                              <Input
                                label="Company"
                                value={exp.company}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    'company',
                                    e.target.value
                                  )
                                }
                                placeholder="Acme Inc."
                              />
                              <Input
                                label="Start Date"
                                value={exp.startDate}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    'startDate',
                                    e.target.value
                                  )
                                }
                                placeholder="Jan 2022"
                              />
                              <Input
                                label="End Date"
                                value={exp.endDate}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    'endDate',
                                    e.target.value
                                  )
                                }
                                placeholder="Present"
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                                Description
                              </label>
                              <textarea
                                value={exp.description}
                                onChange={(e) =>
                                  updateExperience(
                                    exp.id,
                                    'description',
                                    e.target.value
                                  )
                                }
                                placeholder="Describe your responsibilities and achievements..."
                                rows={3}
                                className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Education */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[var(--foreground)]">
                        Education
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addEducation}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                    {editorContent.education.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        No education entries yet. Click &quot;Add&quot; to add
                        your education history.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {editorContent.education.map((edu) => (
                          <div
                            key={edu.id}
                            className="rounded-lg border border-[var(--border)] p-4"
                          >
                            <div className="mb-3 flex items-start justify-end">
                              <button
                                onClick={() => removeEducation(edu.id)}
                                className="shrink-0 rounded p-1 text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <Input
                                label="Degree"
                                value={edu.degree}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    'degree',
                                    e.target.value
                                  )
                                }
                                placeholder="B.S. Computer Science"
                              />
                              <Input
                                label="School"
                                value={edu.school}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    'school',
                                    e.target.value
                                  )
                                }
                                placeholder="MIT"
                              />
                              <Input
                                label="Year"
                                value={edu.year}
                                onChange={(e) =>
                                  updateEducation(
                                    edu.id,
                                    'year',
                                    e.target.value
                                  )
                                }
                                placeholder="2022"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Skills */}
                  <section>
                    <h4 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                      Skills
                    </h4>
                    {skills.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        No skills found in your profile. Add skills from the
                        Skills page first.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => {
                          const isSelected =
                            editorContent.selectedSkills.includes(skill.name);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => toggleSkill(skill.name)}
                              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                              }`}
                            >
                              {skill.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* Save Button */}
                  <Button onClick={handleSave} isLoading={saving} className="w-full">
                    Save Resume
                  </Button>
                </CardContent>
              </Card>

              {/* Right: Preview Pane */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                    <Badge
                      variant={getTemplateBadgeVariant(selectedResume.template)}
                      size="sm"
                      className="ml-auto"
                    >
                      {selectedResume.template.charAt(0).toUpperCase() +
                        selectedResume.template.slice(1)}{' '}
                      Template
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumePreview
                    content={editorContent}
                    template={selectedResume.template}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* New Resume Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
              Give your resume a title and choose a template to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Resume Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Template
              </label>
              <select
                value={newTemplate}
                onChange={(e) =>
                  setNewTemplate(e.target.value as Resume['template'])
                }
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
              >
                {TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Target Role (optional)"
              value={newTargetRole}
              onChange={(e) => setNewTargetRole(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowNewDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={creating}
              disabled={!newTitle.trim()}
            >
              Create Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
              isLoading={deleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Resume Preview Sub-component ---- */

function ResumePreview({
  content,
  template,
}: {
  content: ResumeContent;
  template: Resume['template'];
}) {
  const { personalInfo, summary, experience, education, selectedSkills } =
    content;

  const hasContent =
    personalInfo.name ||
    summary ||
    experience.length > 0 ||
    education.length > 0 ||
    selectedSkills.length > 0;

  if (!hasContent) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--muted-foreground)]">
        Fill in the form to see a preview of your resume.
      </div>
    );
  }

  // Template-specific wrapper styles
  const templateWrapperClass: Record<Resume['template'], string> = {
    modern:
      'font-sans',
    classic:
      'font-serif',
    minimal:
      'font-sans',
    creative:
      'font-sans',
    executive:
      'font-sans',
  };

  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-white text-gray-900 overflow-hidden ${templateWrapperClass[template]}`}
    >
      {/* Header - varies by template */}
      {template === 'executive' && (
        <div className="bg-gray-900 px-6 py-5 text-white">
          {personalInfo.name && (
            <h2 className="text-xl font-bold tracking-wide uppercase">
              {personalInfo.name}
            </h2>
          )}
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-300">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>
      )}

      {template === 'creative' && (
        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/3 bg-brand-600 px-4 py-5 text-white">
            {personalInfo.name && (
              <h2 className="text-lg font-bold">{personalInfo.name}</h2>
            )}
            <div className="mt-2 space-y-1 text-xs text-brand-100">
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.location && <p>{personalInfo.location}</p>}
            </div>
            {selectedSkills.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-200">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block rounded-full bg-brand-500 px-2 py-0.5 text-[10px] text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Main Content */}
          <div className="flex-1 px-5 py-5">
            {summary && (
              <div className="mb-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
                  Summary
                </h3>
                <p className="text-xs leading-relaxed text-gray-700">
                  {summary}
                </p>
              </div>
            )}
            {experience.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
                  Experience
                </h3>
                {experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <p className="text-xs font-semibold">{exp.jobTitle}</p>
                    <p className="text-[10px] text-gray-500">
                      {exp.company}
                      {exp.startDate &&
                        ` | ${exp.startDate} - ${exp.endDate || 'Present'}`}
                    </p>
                    {exp.description && (
                      <p className="mt-0.5 text-[10px] text-gray-600">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {education.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
                  Education
                </h3>
                {education.map((edu) => (
                  <div key={edu.id} className="mb-2">
                    <p className="text-xs font-semibold">{edu.degree}</p>
                    <p className="text-[10px] text-gray-500">
                      {edu.school}
                      {edu.year && ` | ${edu.year}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {template !== 'creative' && template !== 'executive' && (
        <div className="p-6">
          {/* Modern / Classic / Minimal Header */}
          {template === 'classic' ? (
            <div className="mb-4 text-center">
              {personalInfo.name && (
                <h2 className="text-xl font-bold">{personalInfo.name}</h2>
              )}
              <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
              </div>
              <hr className="mt-3 border-gray-300" />
            </div>
          ) : template === 'minimal' ? (
            <div className="mb-6">
              {personalInfo.name && (
                <h2 className="text-lg font-medium text-gray-900">
                  {personalInfo.name}
                </h2>
              )}
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
              </div>
            </div>
          ) : (
            /* modern */
            <div className="mb-4">
              {personalInfo.name && (
                <h2 className="text-xl font-bold text-brand-700">
                  {personalInfo.name}
                </h2>
              )}
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="mb-4">
              <h3
                className={`mb-1 text-xs font-semibold uppercase tracking-wider ${
                  template === 'modern'
                    ? 'text-brand-600'
                    : template === 'minimal'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                }`}
              >
                Summary
              </h3>
              {template === 'minimal' && (
                <div className="mb-1 border-t border-gray-200" />
              )}
              <p className="text-xs leading-relaxed text-gray-700">
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-4">
              <h3
                className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                  template === 'modern'
                    ? 'text-brand-600'
                    : template === 'minimal'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                }`}
              >
                Experience
              </h3>
              {template === 'minimal' && (
                <div className="mb-2 border-t border-gray-200" />
              )}
              {experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-semibold">{exp.jobTitle}</p>
                    {exp.startDate && (
                      <p className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                    )}
                  </div>
                  {exp.company && (
                    <p className="text-[10px] text-gray-500">{exp.company}</p>
                  )}
                  {exp.description && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-4">
              <h3
                className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                  template === 'modern'
                    ? 'text-brand-600'
                    : template === 'minimal'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                }`}
              >
                Education
              </h3>
              {template === 'minimal' && (
                <div className="mb-2 border-t border-gray-200" />
              )}
              {education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <p className="text-xs font-semibold">{edu.degree}</p>
                  <p className="text-[10px] text-gray-500">
                    {edu.school}
                    {edu.year && ` | ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {selectedSkills.length > 0 && (
            <div>
              <h3
                className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                  template === 'modern'
                    ? 'text-brand-600'
                    : template === 'minimal'
                      ? 'text-gray-400'
                      : 'text-gray-700'
                }`}
              >
                Skills
              </h3>
              {template === 'minimal' && (
                <div className="mb-2 border-t border-gray-200" />
              )}
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${
                      template === 'modern'
                        ? 'bg-brand-50 text-brand-700'
                        : template === 'minimal'
                          ? 'border border-gray-200 text-gray-600'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Executive body (outside header) */}
      {template === 'executive' && (
        <div className="p-6">
          {summary && (
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1">
                Executive Summary
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-700">
                {summary}
              </p>
            </div>
          )}
          {experience.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1">
                Professional Experience
              </h3>
              {experience.map((exp) => (
                <div key={exp.id} className="mt-3 mb-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-bold">{exp.jobTitle}</p>
                    {exp.startDate && (
                      <p className="text-[10px] text-gray-500 shrink-0 ml-2">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                    )}
                  </div>
                  {exp.company && (
                    <p className="text-[10px] font-medium text-gray-600">
                      {exp.company}
                    </p>
                  )}
                  {exp.description && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {education.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1">
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} className="mt-2 mb-2">
                  <p className="text-xs font-bold">{edu.degree}</p>
                  <p className="text-[10px] text-gray-500">
                    {edu.school}
                    {edu.year && ` | ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          )}
          {selectedSkills.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1">
                Core Competencies
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
