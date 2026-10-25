import { BrewFlowOwnerDashboard } from '@/components/dashboard/BrewFlowOwnerDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Owner Dashboard | BrewFlow',
  description: 'Monitor sales, manage menu, and track customer engagement.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto">
        <BrewFlowOwnerDashboard />
      </div>
    </div>
  );
}
