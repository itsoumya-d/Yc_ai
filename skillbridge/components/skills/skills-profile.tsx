'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Users,
  Briefcase,
  ArrowRightLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Cpu,
  FileText,
  User,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { addSkill, updateSkill, deleteSkill } from '@/lib/actions/skills';
import type { Skill } from '@/types/database';

interface SkillsProfileProps {
  skills: Skill[];
  skillsByCategory: Record<string, Skill[]>;
}

const CATEGORIES: {
  key: Skill['category'];
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: 'technical', label: 'Technical', icon: <Cpu className="h-5 w-5" /> },
  { key: 'soft', label: 'Soft Skills', icon: <Users className="h-5 w-5" /> },
  { key: 'industry', label: 'Industry', icon: <Briefcase className="h-5 w-5" /> },
  { key: 'transferable', label: 'Transferable', icon: <ArrowRightLeft className="h-5 w-5" /> },
];

const PROFICIENCY_LEVELS: Skill['proficiency'][] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];

function getProficiencyVariant(level: Skill['proficiency']) {
  switch (level) {
    case 'expert':
      return 'default' as const;
    case 'advanced':
      return 'default' as const;
    case 'intermediate':
      return 'sunrise' as const;
    case 'beginner':
      return 'secondary' as const;
  }
}

function getProficiencyClass(level: Skill['proficiency']) {
  switch (level) {
    case 'expert':
      return 'bg-brand-100 text-brand-700';
    case 'advanced':
      return 'bg-brand-50 text-brand-500';
    case 'intermediate':
      return 'bg-sunrise-100 text-sunrise-700';
    case 'beginner':
      return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
  }
}

function getSourceIcon(source: Skill['source']) {
  switch (source) {
    case 'ai_assessment':
      return <span title="AI Assessment"><Cpu className="h-3.5 w-3.5" /></span>;
    case 'resume_parsed':
      return <span title="Resume Parsed"><FileText className="h-3.5 w-3.5" /></span>;
    case 'self_reported':
      return <span title="Self Reported"><User className="h-3.5 w-3.5" /></span>;
    case 'quiz':
      return <span title="Quiz"><HelpCircle className="h-3.5 w-3.5" /></span>;
  }
}

export function SkillsProfile({ skills, skillsByCategory }: SkillsProfileProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Add skill dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<Skill['category']>('technical');
  const [newSkillProficiency, setNewSkillProficiency] = useState<Skill['proficiency']>('intermediate');
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editProficiency, setEditProficiency] = useState<Skill['proficiency']>('intermediate');

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Summary counts
  const totalCount = skills.length;
  const technicalCount = skillsByCategory['technical']?.length ?? 0;
  const softCount = skillsByCategory['soft']?.length ?? 0;
  const transferableCount = skillsByCategory['transferable']?.length ?? 0;

  async function handleAddSkill() {
    if (!newSkillName.trim()) return;
    setIsAdding(true);
    try {
      await addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
      });
      addToast('Skill added successfully', 'success');
      setAddDialogOpen(false);
      setNewSkillName('');
      setNewSkillCategory('technical');
      setNewSkillProficiency('intermediate');
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to add skill',
        'error'
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdateProficiency(skillId: string, proficiency: Skill['proficiency']) {
    try {
      await updateSkill(skillId, { proficiency });
      addToast('Skill updated', 'success');
      setEditingSkillId(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to update skill',
        'error'
      );
    }
  }

  async function handleDeleteSkill() {
    if (!skillToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSkill(skillToDelete.id);
      addToast('Skill removed', 'success');
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to delete skill',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function openDeleteDialog(skill: Skill) {
    setSkillToDelete(skill);
    setDeleteDialogOpen(true);
  }

  function startEditing(skill: Skill) {
    setEditingSkillId(skill.id);
    setEditProficiency(skill.proficiency);
  }

  if (skills.length === 0) {
    return (
      <div>
        <PageHeader title="Skills Profile">
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </PageHeader>

        <Card>
          <CardContent>
            <EmptyState
              icon={<Zap className="h-8 w-8" />}
              title="No skills identified yet"
              description="Complete a skills assessment or add your skills manually to build your profile."
              action={{
                label: 'Start Assessment',
                onClick: () => {
                  window.location.href = '/assessment';
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Add Skill Dialog */}
        <AddSkillDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          name={newSkillName}
          onNameChange={setNewSkillName}
          category={newSkillCategory}
          onCategoryChange={setNewSkillCategory}
          proficiency={newSkillProficiency}
          onProficiencyChange={setNewSkillProficiency}
          onSubmit={handleAddSkill}
          isLoading={isAdding}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Skills Profile">
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </PageHeader>

      {/* Summary Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Skills" value={totalCount} icon={<Zap className="h-4 w-4 text-brand-600" />} />
        <SummaryCard label="Technical" value={technicalCount} icon={<Cpu className="h-4 w-4 text-brand-600" />} />
        <SummaryCard label="Soft Skills" value={softCount} icon={<Users className="h-4 w-4 text-brand-600" />} />
        <SummaryCard label="Transferable" value={transferableCount} icon={<ArrowRightLeft className="h-4 w-4 text-brand-600" />} />
      </div>

      {/* Category Sections */}
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const categorySkills = skillsByCategory[cat.key];
          if (!categorySkills || categorySkills.length === 0) return null;

          return (
            <section key={cat.key}>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  {cat.icon}
                </div>
                <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
                  {cat.label}
                </h2>
                <Badge variant="secondary" size="sm">
                  {categorySkills.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((skill) => (
                  <Card key={skill.id} className="transition-shadow duration-normal hover:shadow-card-hover">
                    <CardContent className="p-4">
                      {editingSkillId === skill.id ? (
                        /* Inline Edit Mode */
                        <div className="space-y-3">
                          <p className="font-semibold text-[var(--card-foreground)]">
                            {skill.name}
                          </p>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-[var(--muted-foreground)]">
                              Proficiency
                            </label>
                            <select
                              value={editProficiency}
                              onChange={(e) => setEditProficiency(e.target.value as Skill['proficiency'])}
                              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                            >
                              {PROFICIENCY_LEVELS.map((level) => (
                                <option key={level} value={level}>
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateProficiency(skill.id, editProficiency)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSkillId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode */
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[var(--card-foreground)] truncate">
                                {skill.name}
                              </p>
                              {skill.verified && (
                                <span title="Verified"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /></span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getProficiencyClass(skill.proficiency)}`}>
                                {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                                {getSourceIcon(skill.source)}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => startEditing(skill)}
                              className="rounded-md p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                              title="Edit skill"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(skill)}
                              className="rounded-md p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete skill"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add Skill Dialog */}
      <AddSkillDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        name={newSkillName}
        onNameChange={setNewSkillName}
        category={newSkillCategory}
        onCategoryChange={setNewSkillCategory}
        proficiency={newSkillProficiency}
        onProficiencyChange={setNewSkillProficiency}
        onSubmit={handleAddSkill}
        isLoading={isAdding}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &ldquo;{skillToDelete?.name}&rdquo; from your profile?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSkillToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSkill}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Sub-components ---- */

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-card">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
        <p className="font-heading text-xl font-semibold text-[var(--card-foreground)]">{value}</p>
      </div>
    </div>
  );
}

function AddSkillDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  category,
  onCategoryChange,
  proficiency,
  onProficiencyChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  category: Skill['category'];
  onCategoryChange: (category: Skill['category']) => void;
  proficiency: Skill['proficiency'];
  onProficiencyChange: (proficiency: Skill['proficiency']) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
          <DialogDescription>
            Add a new skill to your profile. You can set its category and proficiency level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            label="Skill Name"
            placeholder="e.g. React, Project Management, Data Analysis"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as Skill['category'])}
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Proficiency
            </label>
            <select
              value={proficiency}
              onChange={(e) => onProficiencyChange(e.target.value as Skill['proficiency'])}
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isLoading} disabled={!name.trim()}>
            Add Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
