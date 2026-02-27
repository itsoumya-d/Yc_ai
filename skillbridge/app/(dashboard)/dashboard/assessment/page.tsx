import { getUser } from '@/lib/actions/auth';
import { fetchProfile } from '@/lib/actions/dashboard';
import { redirect } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, MessageSquare, ArrowRight, Upload } from 'lucide-react';

export const metadata = {
  title: 'Skills Assessment',
};

export default async function AssessmentPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const profileResult = await fetchProfile();
  const profile = profileResult.success ? profileResult.data : null;
  const step = profile?.assessment_step ?? 0;
  const status = profile?.assessment_status ?? 'not_started';

  // If assessment is complete, redirect to skills
  if (status === 'completed') {
    redirect('/dashboard/skills');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          {status === 'in_progress'
            ? 'Continue Your Assessment'
            : "Let's get to know your experience"}
        </h1>
        <p className="mt-2 text-stone-500 max-w-md mx-auto">
          {status === 'in_progress'
            ? 'Pick up right where you left off.'
            : "We'll identify your transferable skills and match them to growing careers."}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`
              h-2 rounded-full transition-all
              ${s <= step + 1 ? 'bg-teal-500 w-12' : 'bg-stone-200 w-8'}
            `}
          />
        ))}
      </div>

      {/* Choose Path Cards (Step 1) */}
      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <Card hover className="cursor-pointer text-center">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-teal-50 p-4">
                <Upload className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  We&apos;ll analyze your resume and identify your transferable skills in under 2 minutes
                </CardDescription>
              </div>
              <Button variant="primary" className="mt-2">
                <FileText className="h-4 w-4" />
                Upload Resume
              </Button>
              <p className="text-xs text-stone-400">PDF or DOCX, up to 10MB</p>
            </div>
          </Card>

          {/* Questionnaire */}
          <Card hover className="cursor-pointer text-center">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-sunrise-50 p-4">
                <MessageSquare className="h-8 w-8 text-sunrise-600" />
              </div>
              <div>
                <CardTitle>Answer Questions</CardTitle>
                <CardDescription>
                  No resume? No problem. We&apos;ll guide you through a short questionnaire about your work experience
                </CardDescription>
              </div>
              <Button variant="accent" className="mt-2">
                <ArrowRight className="h-4 w-4" />
                Start Questionnaire
              </Button>
              <p className="text-xs text-stone-400">About 10 minutes</p>
            </div>
          </Card>
        </div>
      )}

      {/* Questionnaire Steps (Step 2+) */}
      {step > 0 && step < 3 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-stone-500">
              Assessment questionnaire — Step {step} of 3
            </p>
            <p className="text-sm text-stone-400 mt-2">
              Full questionnaire flow coming soon. Your progress has been saved.
            </p>
          </div>
        </Card>
      )}

      {/* Footer Note */}
      <p className="text-center text-sm text-stone-400">
        You can always edit your skills profile later.{' '}
        <Link href="/dashboard/skills" className="text-teal-600 hover:underline">
          View existing skills
        </Link>
      </p>
    </div>
  );
}
