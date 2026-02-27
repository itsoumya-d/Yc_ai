import Link from "next/link";
import { MapPin, DollarSign, TrendingUp, ExternalLink } from "lucide-react";

const SEED_JOBS = [
  { id: "1", title: "Data Analyst", company: "Accenture", location: "Remote", salary_min: 65000, salary_max: 95000, match_score: 88, skills: ["Excel", "SQL", "Data Visualization"], url: "#" },
  { id: "2", title: "Project Manager", company: "Amazon", location: "Seattle, WA", salary_min: 85000, salary_max: 120000, match_score: 82, skills: ["Communication", "Agile", "Leadership"], url: "#" },
  { id: "3", title: "Business Analyst", company: "Deloitte", location: "New York, NY", salary_min: 70000, salary_max: 100000, match_score: 79, skills: ["Requirements Gathering", "Process Improvement", "Excel"], url: "#" },
  { id: "4", title: "UX Researcher", company: "Figma", location: "San Francisco, CA", salary_min: 90000, salary_max: 130000, match_score: 74, skills: ["User Interviews", "Usability Testing", "Data Analysis"], url: "#" },
  { id: "5", title: "Operations Manager", company: "FedEx", location: "Memphis, TN", salary_min: 60000, salary_max: 85000, match_score: 71, skills: ["Logistics", "Team Leadership", "Process Optimization"], url: "#" },
  { id: "6", title: "HR Business Partner", company: "Microsoft", location: "Redmond, WA", salary_min: 75000, salary_max: 110000, match_score: 68, skills: ["Communication", "Employee Relations", "HR Systems"], url: "#" },
];

export default function JobsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Job Matches</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Jobs matched to your skills profile. Demo data for illustration.</p>
      </div>
      <div className="space-y-4">
        {SEED_JOBS.map((job) => (
          <div key={job.id} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{job.title}</h2>
                <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>{job.company}</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>
                <TrendingUp className="w-3.5 h-3.5" />{job.match_score}% match
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <MapPin className="w-3.5 h-3.5" />{job.location}
              </span>
              <span className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <DollarSign className="w-3.5 h-3.5" />${Math.round(job.salary_min/1000)}k - ${Math.round(job.salary_max/1000)}k
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill) => (
                <span key={skill} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{skill}</span>
              ))}
            </div>
            <Link href={job.url} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
              View Listing <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
