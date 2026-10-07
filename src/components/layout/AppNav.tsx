import Link from 'next/link';
import { Coffee, LayoutDashboard, Users, Gift, QrCode, Wallet, LogOut } from 'lucide-react';
import { resolveRequestUser } from '@/lib/auth/serverAuth';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export async function AppNav() {
  const user = await resolveRequestUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link
            href={
              user?.role === 'owner'
                ? '/dashboard'
                : user?.role === 'staff'
                ? '/pos'
                : '/wallet'
            }
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
          >
            <Coffee className="h-5 w-5 text-amber-700" />
            <span>BrewPoints</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {user.role === 'owner' && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Analytics
                  </Link>
                  <Link
                    href="/staff"
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    Staff
                  </Link>
                  <Link
                    href="/rewards"
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Gift className="h-4 w-4" />
                    Rewards
                  </Link>
                </>
              )}

              {(user.role === 'staff' || user.role === 'owner') && (
                <Link
                  href="/pos"
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  Staff POS
                </Link>
              )}

              <Link
                href="/wallet"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Wallet className="h-4 w-4" />
                Customer Wallet
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="font-medium">{user.name}</span>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
