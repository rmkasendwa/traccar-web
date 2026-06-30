import type { ReactNode } from 'react';
import ReportsShell from '@/features/reports/components/ReportsShell';

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <ReportsShell>{children}</ReportsShell>;
}
