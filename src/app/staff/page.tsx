import { AppNav } from '@/components/layout/AppNav';
import { StaffManagement } from '@/components/dashboard/StaffManagement';

export const dynamic = 'force-dynamic';

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <AppNav />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, activate, or deactivate barista staff accounts
          </p>
        </div>

        <StaffManagement />
      </main>
    </div>
  );
}
