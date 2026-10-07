import { redirect } from 'next/navigation';
import { resolveRequestUser } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await resolveRequestUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'owner') {
    redirect('/dashboard');
  }

  if (user.role === 'staff') {
    redirect('/pos');
  }

  redirect('/wallet');
}
