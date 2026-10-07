'use client';

import { useTransition } from 'react';
import { Coffee, ShieldCheck, QrCode, Wallet } from 'lucide-react';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = (role: 'customer' | 'staff' | 'owner') => {
    startTransition(async () => {
      await login(role);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            <Coffee className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">BrewPoints</CardTitle>
          <CardDescription>
            Digital Loyalty Platform — Select a role to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={() => handleLogin('owner')}
            variant="default"
            size="lg"
            className="w-full justify-start gap-3"
            disabled={isPending}
          >
            <ShieldCheck className="h-5 w-5" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold">Shop Owner</span>
              <span className="text-xs opacity-80">
                Analytics, Staff Management & Reward Catalog
              </span>
            </div>
          </Button>

          <Button
            onClick={() => handleLogin('staff')}
            variant="secondary"
            size="lg"
            className="w-full justify-start gap-3"
            disabled={isPending}
          >
            <QrCode className="h-5 w-5" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold">Barista / Staff</span>
              <span className="text-xs text-muted-foreground">
                Scan QR Codes, Allocate Points & Confirm Redemptions
              </span>
            </div>
          </Button>

          <Button
            onClick={() => handleLogin('customer')}
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3"
            disabled={isPending}
          >
            <Wallet className="h-5 w-5" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold">Customer</span>
              <span className="text-xs text-muted-foreground">
                Loyalty Card, Dynamic QR, Rewards & History
              </span>
            </div>
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Connected to MySQL via Prisma (Dual-Mode Firebase Auth)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
