import { AppNav } from '@/components/layout/AppNav';
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards';
import { PointVelocityChart } from '@/components/dashboard/PointVelocityChart';
import { RewardPopularityChart } from '@/components/dashboard/RewardPopularityChart';
import { StaffActivityTable } from '@/components/dashboard/StaffActivityTable';
import { RedemptionGrowthChart } from '@/components/dashboard/RedemptionGrowthChart';
import { getProgramAnalytics } from '@/app/api/v1/analytics/route';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const analytics = await getProgramAnalytics();

  const cardsData = {
    totalPointsIssued: analytics.summary.totalPointsIssued,
    activeUsers: analytics.summary.activeCustomers,
    totalRedemptions: analytics.summary.totalRedemptions,
  };

  const velocityData = analytics.velocity.map((v) => ({
    name: v.date,
    points: v.issued,
  }));

  const popularityData = analytics.popularity.map((p) => ({
    name: p.name,
    redemptions: p.redemptions,
  }));

  const staffActivityData = analytics.staffActivity.map((s) => ({
    name: s.name,
    role: s.role.charAt(0).toUpperCase() + s.role.slice(1),
    activityCount: s.allocations + s.redemptions,
    lastActive: `${s.totalPointsProcessed.toLocaleString()} pts processed`,
  }));

  const growthData = analytics.growth.map((g) => ({
    name: g.period,
    redemptions: g.redemptions,
  }));

  return (
    <div className="min-h-screen bg-muted/20">
      <AppNav />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Program Health Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live loyalty metrics aggregated from MySQL (`brewpoints`)
          </p>
        </div>

        <AnalyticsCards data={cardsData} />

        <div className="grid gap-4 md:grid-cols-2">
          <PointVelocityChart data={velocityData} />
          <RewardPopularityChart data={popularityData} />
        </div>

        <StaffActivityTable data={staffActivityData} />

        <RedemptionGrowthChart data={growthData} />
      </main>
    </div>
  );
}
