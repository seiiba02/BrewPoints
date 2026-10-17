import { resolveRequestUser } from '@/lib/auth/serverAuth';
import { CustomerWallet } from '@/components/wallet/CustomerWallet';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Customer Loyalty Pass & Ledger | BrewFlow',
  description: 'Digital loyalty card, dynamic JWS passes, and transaction history',
};

export default async function WalletPage() {
  const user = await resolveRequestUser();

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] pb-20 md:pb-12">
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <CustomerWallet userName={user?.name || 'Jane Customer'} />
      </main>
    </div>
  );
}
