import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
}

export function PageHeader({ title, subtitle, action, backHref }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
