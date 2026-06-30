'use client';

import { FileBarChart, SearchX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type ReportEmptyStateProps = {
  title?: string;
  description?: string;
};

export default function ReportEmptyState({ title, description }: ReportEmptyStateProps) {
  const searchParams = useSearchParams();
  const generated = searchParams.has('from') && searchParams.has('to');
  const Icon = generated ? SearchX : FileBarChart;

  return (
    <div className="grid min-h-64 place-items-center p-6 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon size={22} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-bold text-slate-900">
          {title || (generated ? 'No matching report data' : 'No report generated yet')}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          {description ||
            (generated
              ? 'Try another period, device, or group to broaden your results.'
              : 'Choose your report criteria above and generate a report to see the results.')}
        </p>
      </div>
    </div>
  );
}
