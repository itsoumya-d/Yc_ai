import { BookOpen, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const modules = [
  {
    title: 'Security Awareness',
    duration: '30 min',
    description: 'Foundational security practices for all employees',
  },
  {
    title: 'Data Privacy',
    duration: '20 min',
    description: 'How to handle personal and sensitive data responsibly',
  },
  {
    title: 'Phishing Awareness',
    duration: '15 min',
    description: 'Recognize and report phishing attempts',
  },
  {
    title: 'Incident Reporting',
    duration: '10 min',
    description: 'How to report security incidents and breaches',
  },
  {
    title: 'Acceptable Use',
    duration: '15 min',
    description: 'Company policies for technology and data usage',
  },
];

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Employee Training</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage and track security awareness training
        </p>
      </div>

      {/* Completion Overview */}
      <Card className="flex items-center gap-6 border-warn-200 bg-gradient-to-r from-warn-50 to-surface">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-warn-300 bg-warn-50">
          <GraduationCap className="h-8 w-8 text-warn-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">Training Completion</p>
          <p className="text-3xl font-bold text-warn-700">0%</p>
          <p className="mt-0.5 text-xs text-text-muted">0 of 0 employees completed all modules</p>
        </div>
        <div className="ml-auto">
          <Badge variant="amber">Not Started</Badge>
        </div>
      </Card>

      {/* Training Module Cards */}
      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module.title} hover className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-trust-50">
              <BookOpen className="h-6 w-6 text-trust-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary">{module.title}</h3>
                <Badge variant="gray">{module.duration}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">{module.description}</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-semibold text-text-primary">0/0</p>
                <p className="text-xs text-text-muted">Completed</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-muted">--</p>
                <p className="text-xs text-text-muted">Due Date</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <CheckCircle className="h-4 w-4 text-text-muted" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
