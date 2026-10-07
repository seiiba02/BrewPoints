import { redirect } from 'next/navigation';
import { AppNav } from '@/components/layout/AppNav';
import { resolveRequestUser } from '@/lib/auth/serverAuth';
import { CustomerWallet } from '@/components/wallet/CustomerWallet';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const user = await resolveRequestUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <AppNav />
      <main className="container mx-auto p-4 md:p-8 space-y-6">
        <CustomerWallet userName={user.name} />
      </main>
    </div>
  );
}
