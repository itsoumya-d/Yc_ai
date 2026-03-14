"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";

const QUESTIONS = [
  { id: 1, question: "What is your current or most recent job title?", placeholder: "e.g. Retail Store Manager" },
  { id: 2, question: "How many years of total work experience do you have?", placeholder: "e.g. 8 years" },
  { id: 3, question: "What are the main tasks or responsibilities you perform in your current/last role?", placeholder: "e.g. Managing a team of 10, handling inventory, customer service..." },
  { id: 4, question: "What software, tools, or technology do you use regularly at work?", placeholder: "e.g. Microsoft Office, POS systems, CRM software..." },
  { id: 5, question: "Describe a project or achievement you are most proud of from your career.", placeholder: "e.g. Increased store sales by 25% through..." },
  { id: 6, question: "What skills do others compliment you on most often?", placeholder: "e.g. Problem-solving, communication, attention to detail..." },
  { id: 7, question: "What type of work environment do you prefer?", placeholder: "e.g. Remote work, collaborative team, independent, fast-paced..." },
  { id: 8, question: "What salary range are you targeting in your next role?", placeholder: "e.g. $60,000 - $80,000 per year" },
  { id: 9, question: "Are you open to retraining or taking courses? If yes, how many hours per week can you dedicate?", placeholder: "e.g. Yes, 10 hours per week" },
  { id: 10, question: "What industries or types of companies excite you most for your next career?", placeholder: "e.g. Tech startups, healthcare, education, government..." },
];

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const question = QUESTIONS[currentStep];
  const totalSteps = QUESTIONS.length;
  const progress = ((currentStep) / totalSteps) * 100;
  const isLast = currentStep === totalSteps - 1;

  function handleNext() {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const answersArray = QUESTIONS.map((q) => ({
      question: q.question,
      answer: answers[q.id] || "",
    }));

    try {
      await fetch("/api/skills/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quiz", answers: answersArray }),
      });

      await fetch("/api/careers/generate", { method: "POST" });
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      console.error("Assessment error:", err);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Assessment Complete!</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Generating your career matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4" style={{ backgroundColor: "var(--primary)" }}>S</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Skills Assessment</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Question {currentStep + 1} of {totalSteps}</p>
        </div>

        <div className="h-2 rounded-full mb-8" style={{ backgroundColor: "var(--muted)" }}>
          <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }} />
        </div>

        <div className="p-8 rounded-2xl border mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--foreground)" }}>{question.question}</h2>
          <textarea
            value={answers[question.id] || ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLast ? (submitting ? "Generating matches..." : "Generate My Career Matches") : "Next"}
            {!isLast && !submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-center gap-1.5 mt-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === currentStep ? "24px" : "6px",
                backgroundColor: i <= currentStep ? "var(--primary)" : "var(--muted)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
