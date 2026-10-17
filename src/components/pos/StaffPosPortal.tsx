'use client';

import { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  ClipboardPaste,
} from 'lucide-react';
import { computeSpecimenAxes } from '@/lib/design-tokens';

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

const QUICK_SPEND_PRESETS = [
  { label: 'Espresso', amount: '4.50' },
  { label: 'Cortado', amount: '6.50' },
  { label: 'Pour-Over + Pastry', amount: '12.50' },
  { label: 'Two Drinks', amount: '18.50' },
  { label: 'Whole Bean Bag', amount: '24.00' },
  { label: 'Group Order', amount: '42.00' },
];

export function StaffPosPortal() {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<ScanPreviewResult | null>(null);
  const [amountInput, setAmountInput] = useState('18.50');
  const [noteInput, setNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanLookup = async (payloadOverride?: string) => {
    const payload = (payloadOverride ?? qrInput).trim();
    if (!payload) {
      setError('Enter or paste a customer QR URI or UID to verify.');
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
        setError(json.message ?? 'Invalid or expired QR token.');
        return;
      }
      setPreview(json.data);
      setQrInput(payload);
    } catch {
      setError('Network error while verifying QR payload.');
    } finally {
      setScanning(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setQrInput(text.trim());
        await handleScanLookup(text.trim());
      }
    } catch {
      setError('Clipboard read permission denied. Paste manually into the field.');
    }
  };

  const handleAllocatePoints = async () => {
    if (!preview) return;
    setSubmitting(true);
    setError(null);

    const numericAmount = Number(amountInput);
    const isDynamicQr = preview.qr_payload.startsWith(
      'brewpoints://allocate?token='
    );

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

  const numericSpend = Number(amountInput);
  const previewPoints =
    amountInput && Number.isFinite(numericSpend) && numericSpend >= 1
      ? Math.floor(numericSpend + 0.5)
      : 0;

  const specimen = computeSpecimenAxes(previewPoints, 50);

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="border-2 border-[#B91C1C] bg-[#FEF2F2] p-4 font-mono text-xs font-semibold text-[#B91C1C]"
        >
          SCANNER ALERT: {error}
        </div>
      )}

      {/* Atomic Ledger Receipt Banner */}
      {receipt && (
        <section className="border-2 border-[#15803D] bg-[#DCFCE7] p-6 text-[#111110]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#15803D]/40 pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#15803D] shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-[#111110]">
                  {receipt.type === 'allocate'
                    ? 'Points Credited to Ledger'
                    : 'Reward Redemption Confirmed'}
                </h2>
                <p className="font-mono text-xs text-[#15803D]">
                  ATOMIC TRANSACTION COMMITTED · JTI NONCE CONSUMED
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="bg-[#111110] px-4 py-2 font-mono text-xs font-semibold uppercase text-[#F8F6F0] hover:bg-[#E02E24] transition-colors cursor-pointer"
            >
              Scan Next Customer
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs tabular-nums">
            <div>
              <div className="text-[#4A4843]">CUSTOMER</div>
              <div className="mt-1 text-base font-bold text-[#111110]">
                {receipt.customer_name}
              </div>
            </div>
            <div>
              <div className="text-[#4A4843]">
                {receipt.type === 'allocate'
                  ? `VERIFIED SPEND ($${receipt.amount} USD)`
                  : `FULFILLED REWARD (${receipt.reward_name})`}
              </div>
              <div className="mt-1 text-base font-bold text-[#15803D]">
                {receipt.type === 'allocate' ? '+' : '-'}
                {receipt.points_delta} PTS
              </div>
            </div>
            <div>
              <div className="text-[#4A4843]">UPDATED BALANCE</div>
              <div className="mt-1 text-base font-bold text-[#111110]">
                {receipt.new_balance} PTS
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Two-Column Counter Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-2 border-[#111110] bg-[#FFFFFF]">
        {/* Left 5 Columns: QR Scanner & Customer Verification */}
        <section className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#111110] bg-[#EFECE3]">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-2 border-b border-[#111110] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111110]">
                  QR Scanner &amp; Lookup
                </h2>
                <p className="mt-1 text-xs text-[#4A4843]">
                  Scan or paste a <code>brewpoints://allocate</code> or{' '}
                  <code>brewpoints://redeem</code> JWS URI, or tap a quick
                  counter member below.
                </p>
              </div>
              <QrCode className="h-5 w-5 text-[#111110] shrink-0 mt-1" />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="pos-qr-input"
                className="block font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                QR Payload or Customer UID
              </label>
              <div className="flex gap-2">
                <input
                  id="pos-qr-input"
                  type="text"
                  placeholder="brewpoints://allocate?token=..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleScanLookup();
                  }}
                  className="flex-1 border-2 border-[#111110] bg-[#FFFFFF] px-3.5 py-2.5 font-mono text-xs text-[#111110] placeholder:text-[#4A4843]"
                />
                <button
                  type="button"
                  onClick={() => handleScanLookup()}
                  disabled={scanning}
                  className="bg-[#111110] px-4 py-2.5 font-mono text-xs font-semibold uppercase text-[#F8F6F0] hover:bg-[#E02E24] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  {scanning ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="flex items-center justify-center gap-1.5 border border-[#111110] bg-[#FFFFFF] px-3 py-2 font-mono text-xs font-semibold text-[#111110] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Paste QR URI</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanLookup('customer-dummy-uid-001')}
                  className="flex items-center justify-center gap-1.5 border border-[#111110] bg-[#FFFFFF] px-3 py-2 font-mono text-xs font-semibold text-[#111110] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#E02E24]" />
                  <span>Load Jane Customer</span>
                </button>
              </div>
            </div>

            {/* Verified Customer Status Box */}
            {preview ? (
              <div className="border-2 border-[#111110] bg-[#FFFFFF] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#D4D0C5] pb-2.5">
                  <span className="font-mono text-xs font-bold uppercase text-[#15803D]">
                    ● VERIFIED MEMBER
                  </span>
                  <span className="bg-[#111110] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-[#F8F6F0]">
                    MODE: {preview.mode}
                  </span>
                </div>

                <div>
                  <div className="text-lg font-bold text-[#111110]">
                    {preview.customer.name}
                  </div>
                  <div className="font-mono text-xs text-[#4A4843]">
                    {preview.customer.email}
                  </div>
                </div>

                <div className="flex items-baseline justify-between border-t border-[#D4D0C5] pt-3 font-mono text-xs tabular-nums">
                  <span className="text-[#4A4843]">CURRENT BALANCE</span>
                  <span className="text-base font-bold text-[#111110]">
                    {preview.customer.current_points} PTS
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setError(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 border border-[#111110] bg-[#EFECE3] py-2 font-mono text-xs font-semibold uppercase text-[#111110] hover:bg-[#D4D0C5] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear Scanned Member</span>
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-[#111110] bg-[#F8F6F0] p-5 font-mono text-xs text-[#4A4843] space-y-1">
                <div className="font-semibold text-[#111110]">
                  STANDBY FOR CUSTOMER SCAN
                </div>
                <p>
                  Tap &ldquo;Load Jane Customer&rdquo; above or paste a QR
                  payload from the Customer Wallet to bind this transaction.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-[#D4D0C5] pt-4 font-mono text-[11px] text-[#4A4843] tabular-nums">
            ANTI-REPLAY: JWS SIGNATURE + ATOMIC JTI LOCK
          </div>
        </section>

        {/* Right 7 Columns: Kinetic Variable-Type Spend Calculator or Redemption Confirmation */}
        <section className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-[#FFFFFF]">
          {preview?.mode === 'redeem' && preview.reward ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 border-b-2 border-[#111110] pb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#111110]">
                      Confirm Reward: {preview.reward.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#4A4843]">
                      {preview.reward.description ||
                        'Verify customer balance below and confirm to deduct points atomically.'}
                    </p>
                  </div>
                  <span className="bg-[#DCFCE7] border border-[#15803D] px-2.5 py-1 font-mono text-xs font-semibold text-[#15803D]">
                    JWS VALID
                  </span>
                </div>

                <div className="border-y-2 border-[#111110] bg-[#F8F6F0] p-6 flex flex-wrap items-baseline justify-between gap-4">
                  <div
                    className="font-specimen text-6xl md:text-7xl leading-none text-[#E02E24]"
                    style={{
                      ['--specimen-wght' as string]: 850,
                      ['--specimen-opsz' as string]: 120,
                    }}
                  >
                    -{preview.reward.points_required}
                    <span className="ml-2 text-2xl font-normal text-[#4A4843]">
                      pts
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#4A4843] text-right tabular-nums space-y-1">
                    <div className="font-semibold text-[#111110]">
                      MEMBER: {preview.customer.name.toUpperCase()}
                    </div>
                    <div>
                      BALANCE: {preview.customer.current_points} PTS →{' '}
                      {preview.customer.current_points -
                        preview.reward.points_required}{' '}
                      PTS
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-[#D4D0C5]">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="border border-[#111110] bg-[#FFFFFF] px-5 py-3.5 font-mono text-xs font-semibold uppercase text-[#111110] hover:bg-[#EFECE3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmRedemption}
                  className="flex-1 bg-[#15803D] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F8F6F0] hover:bg-[#166534] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting
                    ? 'CONFIRMING REDEMPTION...'
                    : `Confirm & Deduct -${preview.reward.points_required} Points`}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#111110] pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#111110]">
                      {preview
                        ? `Allocate Spend for ${preview.customer.name}`
                        : 'Purchase Spend & Point Calculator'}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#4A4843]">
                      Select a quick menu preset or enter custom USD spend
                      ($1.00 – $1,000.00).
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#4A4843] tabular-nums">
                    $1.00 = 1 PT (HALF-UP)
                  </span>
                </div>

                {/* Quick Menu Presets */}
                <div className="space-y-2">
                  <div className="font-mono text-xs font-semibold uppercase text-[#4A4843]">
                    Quick Espresso Bar Presets (USD)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {QUICK_SPEND_PRESETS.map((preset) => {
                      const isSelected = amountInput === preset.amount;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setAmountInput(preset.amount)}
                          className={`p-2.5 text-left border transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[#111110] bg-[#111110] text-[#F8F6F0]'
                              : 'border-[#D4D0C5] bg-[#F8F6F0] text-[#111110] hover:border-[#111110]'
                          }`}
                        >
                          <div className="text-xs font-semibold truncate">
                            {preset.label}
                          </div>
                          <div className="font-mono text-xs opacity-80 tabular-nums">
                            ${preset.amount} → +
                            {Math.floor(Number(preset.amount) + 0.5)} pts
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom USD Input & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="spend-amount"
                      className="block font-mono text-xs font-semibold uppercase text-[#111110]"
                    >
                      Purchase Total ($ USD)
                    </label>
                    <input
                      id="spend-amount"
                      type="number"
                      step="0.01"
                      min="1"
                      max="1000"
                      placeholder="18.50"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full border-2 border-[#111110] bg-[#F8F6F0] px-3.5 py-2.5 font-mono text-base font-bold text-[#111110] tabular-nums"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="alloc-note"
                      className="block font-mono text-xs font-semibold uppercase text-[#111110]"
                    >
                      Order Note (Optional)
                    </label>
                    <input
                      id="alloc-note"
                      type="text"
                      placeholder="e.g. 2x Cortado + Almond Croissant"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full border border-[#111110] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#111110] placeholder:text-[#4A4843]"
                    />
                  </div>
                </div>

                {/* Live Kinetic Variable-Axis Award Specimen */}
                <div className="border-y-2 border-[#111110] bg-[#F8F6F0] p-5 flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div
                      className="font-specimen text-6xl sm:text-7xl leading-none text-[#111110]"
                      style={{
                        ['--specimen-wght' as string]: specimen.wght,
                        ['--specimen-opsz' as string]: specimen.opsz,
                      }}
                    >
                      +{previewPoints}
                      <span className="ml-2 text-2xl font-normal tracking-normal text-[#4A4843]">
                        pts
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-xs text-[#4A4843] text-left sm:text-right space-y-1 tabular-nums">
                    <div className="font-semibold text-[#111110]">
                      AWARD SPECIMEN READOUT
                    </div>
                    <div>
                      &apos;wght&apos; {specimen.wght} · &apos;opsz&apos;{' '}
                      {specimen.opsz}
                    </div>
                    {preview && (
                      <div className="text-[#15803D] font-semibold">
                        NEW BALANCE:{' '}
                        {preview.customer.current_points + previewPoints} PTS
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#D4D0C5]">
                {preview ? (
                  <button
                    type="button"
                    disabled={submitting || previewPoints < 1}
                    onClick={handleAllocatePoints}
                    className="w-full bg-[#E02E24] py-4 px-6 font-mono text-xs font-bold uppercase tracking-wider text-[#F8F6F0] hover:bg-[#B82219] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {submitting
                      ? 'CREDITING LEDGER...'
                      : `Confirm & Credit +${previewPoints} Points to ${preview.customer.name}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleScanLookup('customer-dummy-uid-001')}
                    className="w-full bg-[#111110] py-4 px-6 font-mono text-xs font-bold uppercase tracking-wider text-[#F8F6F0] hover:bg-[#E02E24] transition-colors cursor-pointer"
                  >
                    Load Jane Customer to Credit +{previewPoints} Points
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
