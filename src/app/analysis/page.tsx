'use client';

import { Header } from '@/components/Header';
import { AnalysisPanel } from '@/components/AnalysisPanel';

export default function AnalysisPage() {
  return (
    <div>
      <Header
        title="Analysis"
        subtitle="Discover insights from your bookmarks"
        showBack
      />

      <div className="p-4">
        <AnalysisPanel />
      </div>
    </div>
  );
}
