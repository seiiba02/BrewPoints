'use client';

import { useState } from 'react';
import {
  QrCode,
  Coins,
  Gift,
  CheckCircle2,
  UserCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ScanPreviewResult {
  mode: 'allocate' | 'redeem';
  qr_payload: string;
  expires_at?: number;
  customer: {
    id: number;
    name: string;
    email: string;
    firebase_uid: string;
    current_points: number;
  };
  reward?: {
    id: number;
    name: string;
    description: string | null;
    points_required: number;
  };
}

interface ReceiptData {
  type: 'allocate' | 'redeem';
  customer_name: string;
  points_delta: number;
  new_balance: number;
  reward_name?: string;
  amount?: string;
}

export function StaffPosPortal() {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<ScanPreviewResult | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanLookup = async (payloadOverride?: string) => {
    const payload = (payloadOverride ?? qrInput).trim();
    if (!payload) {
      setError('Please enter or scan a QR payload or customer UID.');
      return;
    }

    setScanning(true);
    setError(null);
    setReceipt(null);

    try {
      const res = await fetch('/api/v1/staff/scan-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_payload: payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'Invalid QR code.');
        return;
      }
      setPreview(json.data);
      setQrInput(payload);
    } catch {
      setError('Failed to verify QR payload.');
    } finally {
      setScanning(false);
    }
  };

  const handleAllocatePoints = async () => {
    if (!preview) return;
    setSubmitting(true);
    setError(null);

    const numericAmount = Number(amountInput);
    const isDynamicQr = preview.qr_payload.startsWith('brewpoints://allocate?token=');

    try {
      const res = await fetch('/api/v1/points/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isDynamicQr
            ? { qr_payload: preview.qr_payload }
            : { customer_firebase_uid: preview.customer.firebase_uid }),
          amount: numericAmount,
          note: noteInput.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'Failed to allocate points.');
        return;
      }

      setReceipt({
        type: 'allocate',
        customer_name: preview.customer.name,
        points_delta: json.data.points_credited,
        new_balance: json.data.new_balance,
        amount: numericAmount.toFixed(2),
      });
      setPreview(null);
      setAmountInput('');
      setNoteInput('');
      setQrInput('');
    } catch {
      setError('Failed to allocate points.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRedemption = async () => {
    if (!preview) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/staff/redemptions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_payload: preview.qr_payload,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'Failed to confirm redemption.');
        return;
      }

      setReceipt({
        type: 'redeem',
        customer_name: json.data.customer_name,
        reward_name: json.data.reward_name,
        points_delta: json.data.points_deducted,
        new_balance: json.data.new_balance,
      });
      setPreview(null);
      setQrInput('');
    } catch {
      setError('Failed to confirm redemption.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewPoints =
    amountInput && Number.isFinite(Number(amountInput)) && Number(amountInput) >= 1
      ? Math.floor(Number(amountInput) + 0.5)
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Confirmation Receipt Screen */}
      {receipt && (
        <Card className="border-green-200 bg-green-50/60">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle>
                {receipt.type === 'allocate'
                  ? 'Points Credited Successfully!'
                  : 'Reward Redemption Confirmed!'}
              </CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Transaction has been committed atomically to the MySQL ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Customer</p>
              <p className="font-semibold text-base">{receipt.customer_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                {receipt.type === 'allocate'
                  ? `Points Added ($${receipt.amount})`
                  : `Redeemed (${receipt.reward_name})`}
              </p>
              <p className="font-bold text-base text-green-700">
                {receipt.type === 'allocate' ? '+' : '-'}
                {receipt.points_delta} pts
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Updated Balance</p>
              <p className="font-bold text-base">{receipt.new_balance} pts</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setReceipt(null)}>
              Scan Next Customer
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 1: Unified QR Scanner Input */}
      {!preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-700" />
              Unified QR Scanner & Customer Lookup
            </CardTitle>
            <CardDescription>
              Scan or paste a customer&apos;s{' '}
              <code>brewpoints://allocate?token=...</code> or{' '}
              <code>brewpoints://redeem?token=...</code> QR code payload, or
              select a customer below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste brewpoints://allocate?token=... or brewpoints://redeem?token=..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScanLookup();
                }}
              />
              <Button onClick={() => handleScanLookup()} disabled={scanning}>
                {scanning ? 'Verifying...' : 'Scan / Verify'}
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Quick Counter Lookup (Seeded Demo Customer)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleScanLookup('customer-dummy-uid-001')}
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  Jane Customer (customer@brewpoints.local)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2A: Points Allocation Flow */}
      {preview && preview.mode === 'allocate' && (
        <Card className="border-amber-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-700">Point Allocation</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setError(null);
                }}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Scanner
              </Button>
            </div>
            <CardTitle className="text-2xl mt-2">
              Allocate Points to {preview.customer.name}
            </CardTitle>
            <CardDescription>
              {preview.customer.email} • Current Balance:{' '}
              <strong className="text-foreground">
                {preview.customer.current_points} pts
              </strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="spend-amount">
                Purchase Amount ($1.00 – $1,000.00)
              </Label>
              <Input
                id="spend-amount"
                type="number"
                step="0.01"
                min="1"
                max="1000"
                placeholder="e.g. 125.50"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="alloc-note">Note (Optional)</Label>
              <Input
                id="alloc-note"
                placeholder="e.g. 2x Iced Caramel Macchiato + Croissant"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900">
                <Coins className="h-5 w-5 text-amber-700" />
                <span className="font-medium text-sm">
                  Points to Credit (1 pt / $1.00, rounded half-up):
                </span>
              </div>
              <span className="text-2xl font-bold text-amber-900">
                +{previewPoints} pts
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setPreview(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAllocatePoints}
              disabled={submitting || previewPoints < 1}
            >
              {submitting
                ? 'Crediting Points...'
                : `Confirm & Credit +${previewPoints} Points`}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2B: Reward Redemption Confirmation Flow */}
      {preview && preview.mode === 'redeem' && preview.reward && (
        <Card className="border-amber-300 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default">Reward Redemption Verification</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setError(null);
                }}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Scanner
              </Button>
            </div>
            <CardTitle className="text-2xl mt-2 flex items-center gap-2">
              <Gift className="h-6 w-6 text-amber-700" />
              Confirm Reward: {preview.reward.name}
            </CardTitle>
            <CardDescription>
              Verify customer details below and click Confirm to deduct points
              and fulfill the reward.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg border p-4 bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-semibold">{preview.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="font-semibold">
                  {preview.customer.current_points} pts
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reward Cost</p>
                <p className="font-bold text-amber-700">
                  -{preview.reward.points_required} pts
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setPreview(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRedemption} disabled={submitting}>
              {submitting
                ? 'Confirming Redemption...'
                : `Confirm Redemption (-${preview.reward.points_required} pts)`}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
