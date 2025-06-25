import { AnalyticsView } from "@/components/analytics/analytics-view";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Neuro Analytics & AI Reports</h1>
      </div>
      <AnalyticsView />
    </div>
  );
}
