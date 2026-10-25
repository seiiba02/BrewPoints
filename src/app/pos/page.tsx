import { resolveRequestUser } from '@/lib/auth/serverAuth';
import { StaffPosPortal } from '@/components/pos/StaffPosPortal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Staff Interface | BrewFlow',
  description: 'Scan customer QR codes, manage incoming orders, and update order status.',
};

export default async function StaffPosPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto">
        <StaffPosPortal />
      </div>
    </div>
  );
}
