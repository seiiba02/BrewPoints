import { redirect } from 'next/navigation';
import { AppNav } from '@/components/layout/AppNav';
import { resolveRequestUser } from '@/lib/auth/serverAuth';
import { StaffPosPortal } from '@/components/pos/StaffPosPortal';

export const dynamic = 'force-dynamic';

export default async function StaffPosPage() {
  const user = await resolveRequestUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <AppNav />
      <main className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">
            Barista Point-of-Sale & QR Scanner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scan customer QR codes to credit purchase points or confirm reward
            redemptions in under 10 seconds
          </p>
        </div>

        <StaffPosPortal />
      </main>
    </div>
  );
}
