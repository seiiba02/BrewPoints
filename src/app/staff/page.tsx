import { StaffManagement } from '@/components/dashboard/StaffManagement';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Barista & Staff Roster | BrewFlow',
  description: 'Provision staff and audit scan volume',
};

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#111110] pb-20 md:pb-12">
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111110] pb-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111110]">
              Barista &amp; Staff Roster
            </h1>
            <p className="mt-1 text-sm text-[#4A4843]">
              Provision, update, or suspend counter POS operator accounts and
              audit scan volume.
            </p>
          </div>
        </div>

        <StaffManagement />
      </main>
    </div>
  );
}
