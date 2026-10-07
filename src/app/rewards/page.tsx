import { AppNav } from '@/components/layout/AppNav';
import { RewardCatalog } from '@/components/dashboard/RewardCatalog';

export const dynamic = 'force-dynamic';

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <AppNav />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reward Catalog Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure loyalty rewards and point thresholds for customers
          </p>
        </div>

        <RewardCatalog />
      </main>
    </div>
  );
}
