import { BrewFlowOwnerDashboard } from '@/components/dashboard/BrewFlowOwnerDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Owner Administration & Telemetry | BrewFlow',
  description: 'Sales telemetry, order history, and live menu catalog manager',
};

export default function DashboardPage() {
  return <BrewFlowOwnerDashboard />;
}
