'use client';

import { useState, useTransition } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { rewriteResumeAction } from '@/lib/actions/resume';
import { Loader2, FileText, Sparkles, Copy, Check } from 'lucide-react';

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleRewrite = () => {
    startTransition(async () => {
      const res = await rewriteResumeAction(resumeText, targetRole);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        setResult(res.data ?? '');
        showToast('Resume rewritten successfully!', 'success');
      }
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Resume Rewriter"
        description="Paste your resume and target role. AI will rewrite it to maximize your chances."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Your Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Product Manager, Data Scientist..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume Text <span className="text-gray-400">({resumeText.length}/10000)</span>
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={16}
                maxLength={10000}
                placeholder="Paste your current resume here..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
              />
            </div>
            <Button
              onClick={handleRewrite}
              disabled={!resumeText.trim() || !targetRole.trim() || isPending}
              className="w-full"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isPending ? 'Rewriting with AI...' : 'Rewrite Resume'}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Optimized Resume
              </CardTitle>
              {result && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed max-h-[480px] overflow-y-auto">
                {result}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                {isPending ? (
                  <>
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">AI is rewriting your resume...</p>
                    <p className="text-xs text-gray-400 mt-1">This may take 15-30 seconds</p>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">Your rewritten resume will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Tailored for your target role</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
