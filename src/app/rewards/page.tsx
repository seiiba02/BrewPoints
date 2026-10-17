import { RewardCatalog } from '@/components/dashboard/RewardCatalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reward Specimen Catalog | BrewFlow',
  description: 'Configure loyalty rewards and point thresholds',
};

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] pb-20 md:pb-12">
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111110] pb-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111110]">
              Reward Specimen Catalog
            </h1>
            <p className="mt-1 text-sm text-[#4A4843]">
              Configure loyalty reward items, point thresholds ($1.00 USD = 1
              pt), and active availability.
            </p>
          </div>
        </div>

        <RewardCatalog />
      </main>
    </div>
  );
}
