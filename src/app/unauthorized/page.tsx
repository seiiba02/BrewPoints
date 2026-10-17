import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6F0] text-[#111110] p-6">
      <div className="w-full max-w-md border-2 border-[#111110] bg-[#FFFFFF] p-8 space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          403 — Access Restricted
        </h1>
        <p className="text-sm text-[#4A4843]">
          Your current role session does not have permission to open this
          workspace. Switch to an authorized role account to continue.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-[#E02E24] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#F8F6F0] hover:bg-[#B82219] transition-colors"
          >
            Return to Role Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
