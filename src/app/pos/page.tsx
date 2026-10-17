import { resolveRequestUser } from '@/lib/auth/serverAuth';
import { StaffPosPortal } from '@/components/pos/StaffPosPortal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Barista Counter POS & QR Scanner | BrewFlow',
  description: 'Fast counter spend point allocation and single-use reward redemptions',
};

export default async function StaffPosPage() {
  const user = await resolveRequestUser();

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] pb-20 md:pb-12">
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111110] pb-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111110]">
              Barista Counter POS &amp; QR Scanner
            </h1>
            <p className="mt-1 text-sm text-[#4A4843]">
              Scan customer dynamic QR passes to allocate spend points ($1.00
              USD = 1 pt, half-up) or confirm single-use reward redemptions in
              under 10 seconds.
            </p>
          </div>
          <div className="border border-[#111110] bg-[#111110] px-3.5 py-2 font-mono text-xs text-[#F8F6F0] tabular-nums">
            OPERATOR: {user?.name.toUpperCase() || 'CHLOE BARISTA'} · TARGET &lt;10.0S
          </div>
        </div>

        <StaffPosPortal />
      </main>
    </div>
  );
}
