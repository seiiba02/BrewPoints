import { computeSpecimenAxes } from '@/lib/design-tokens';

interface AnalyticsCardsProps {
  data: {
    totalPointsIssued: number;
    activeUsers: number;
    totalRedemptions: number;
  };
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const issuedAxis = computeSpecimenAxes(data.totalPointsIssued, 1000);
  const usersAxis = computeSpecimenAxes(data.activeUsers, 50);
  const redemptionsAxis = computeSpecimenAxes(data.totalRedemptions, 25);

  const avgPointsPerUser =
    data.activeUsers > 0
      ? Math.round(data.totalPointsIssued / data.activeUsers)
      : 0;

  return (
    <section
      aria-label="Program Ledger Summary"
      className="grid grid-cols-1 md:grid-cols-3 border-2 border-[#111110] bg-[#FFFFFF] divide-y md:divide-y-0 md:divide-x divide-[#111110]"
    >
      {/* Column 1: Points Issued & Verified USD Spend */}
      <div className="p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-[#111110]">
            Total Points Issued
          </h2>
          <span className="font-mono text-xs text-[#4A4843] tabular-nums">
            &apos;wght&apos; {issuedAxis.wght}
          </span>
        </div>

        <div
          className="font-specimen text-5xl lg:text-6xl leading-none text-[#111110]"
          style={{
            ['--specimen-wght' as string]: issuedAxis.wght,
            ['--specimen-opsz' as string]: issuedAxis.opsz,
          }}
        >
          {data.totalPointsIssued.toLocaleString()}
          <span className="ml-2 text-xl font-normal text-[#4A4843]">pts</span>
        </div>

        <div className="border-t border-[#D4D0C5] pt-3 flex items-center justify-between font-mono text-xs text-[#4A4843] tabular-nums">
          <span>VERIFIED HOUSE SPEND</span>
          <span className="font-semibold text-[#15803D]">
            ${data.totalPointsIssued.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Column 2: Active Customer Accounts */}
      <div className="p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-[#111110]">
            Active Member Accounts
          </h2>
          <span className="font-mono text-xs text-[#4A4843] tabular-nums">
            &apos;wght&apos; {usersAxis.wght}
          </span>
        </div>

        <div
          className="font-specimen text-5xl lg:text-6xl leading-none text-[#111110]"
          style={{
            ['--specimen-wght' as string]: usersAxis.wght,
            ['--specimen-opsz' as string]: usersAxis.opsz,
          }}
        >
          {data.activeUsers.toLocaleString()}
          <span className="ml-2 text-xl font-normal text-[#4A4843]">
            members
          </span>
        </div>

        <div className="border-t border-[#D4D0C5] pt-3 flex items-center justify-between font-mono text-xs text-[#4A4843] tabular-nums">
          <span>AVG ISSUED PER MEMBER</span>
          <span className="font-semibold text-[#111110]">
            {avgPointsPerUser.toLocaleString()} PTS
          </span>
        </div>
      </div>

      {/* Column 3: Confirmed Redemptions */}
      <div className="p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-[#111110]">
            Confirmed Redemptions
          </h2>
          <span className="font-mono text-xs text-[#4A4843] tabular-nums">
            &apos;wght&apos; {redemptionsAxis.wght}
          </span>
        </div>

        <div
          className="font-specimen text-5xl lg:text-6xl leading-none text-[#E02E24]"
          style={{
            ['--specimen-wght' as string]: redemptionsAxis.wght,
            ['--specimen-opsz' as string]: redemptionsAxis.opsz,
          }}
        >
          {data.totalRedemptions.toLocaleString()}
          <span className="ml-2 text-xl font-normal text-[#4A4843]">
            rewards
          </span>
        </div>

        <div className="border-t border-[#D4D0C5] pt-3 flex items-center justify-between font-mono text-xs text-[#4A4843] tabular-nums">
          <span>VERIFICATION PROTOCOL</span>
          <span className="font-semibold text-[#111110]">
            SINGLE-USE JWS JTI
          </span>
        </div>
      </div>
    </section>
  );
}
