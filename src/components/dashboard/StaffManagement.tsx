'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  firebase_uid: string;
  role: string;
  active: boolean;
  transactions_processed: number;
  redemptions_confirmed: number;
}

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/staff');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load staff.');
      }
      setStaff(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async () => {
    setError(null);
    const res = await fetch('/api/v1/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formState.name,
        email: formState.email,
        phone: formState.phone || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Failed to create staff member.');
      return;
    }
    setStaff((prev) => [json.data, ...prev]);
    setIsCreateOpen(false);
    setFormState({ name: '', email: '', phone: '' });
  };

  const handleEdit = async () => {
    if (!editingStaff) return;
    setError(null);
    const res = await fetch(`/api/v1/staff/${editingStaff.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formState.name,
        email: formState.email,
        phone: formState.phone || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Failed to update staff member.');
      return;
    }
    setStaff((prev) =>
      prev.map((s) => (s.id === editingStaff.id ? json.data : s))
    );
    setIsEditOpen(false);
    setEditingStaff(null);
    setFormState({ name: '', email: '', phone: '' });
  };

  const handleToggleStatus = async (member: StaffMember) => {
    setError(null);
    const res = await fetch(`/api/v1/staff/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !member.active }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Failed to toggle status.');
      return;
    }
    setStaff((prev) => prev.map((s) => (s.id === member.id ? json.data : s)));
  };

  const handleDelete = async (member: StaffMember) => {
    setError(null);
    const res = await fetch(`/api/v1/staff/${member.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setStaff((prev) =>
        prev.map((s) => (s.id === member.id ? { ...s, active: false } : s))
      );
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setEditingStaff(member);
    setFormState({
      name: member.name,
      email: member.email,
      phone: member.phone ?? '',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#111110]">
            Registered Counter Operators ({staff.length})
          </h2>
          <button
            type="button"
            onClick={fetchStaff}
            title="Refresh Roster"
            className="inline-flex items-center gap-1.5 border border-[#111110] bg-[#FFFFFF] px-3 py-1.5 font-mono text-xs font-semibold uppercase text-[#111110] hover:bg-[#EFECE3] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-[#E02E24] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F8F6F0] hover:bg-[#B82219] transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Barista Account</span>
              </button>
            }
          />
          <DialogContent className="border-2 border-[#111110] bg-[#F8F6F0] text-[#111110] rounded-none sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#111110]">
                Provision Barista Account
              </DialogTitle>
              <DialogDescription className="text-xs text-[#4A4843]">
                Register a new staff operator authorized for the Counter POS.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <label
                  htmlFor="name"
                  className="font-mono text-xs font-semibold uppercase text-[#111110]"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Alex Barista"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="email"
                  className="font-mono text-xs font-semibold uppercase text-[#111110]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="alex@brewpoints.local"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="phone"
                  className="font-mono text-xs font-semibold uppercase text-[#111110]"
                >
                  Phone (Optional)
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="+1 (555) 019-2834"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState({ ...formState, phone: e.target.value })
                  }
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 font-mono text-xs text-[#111110]"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCreate}
                className="w-full bg-[#E02E24] py-3 px-5 font-mono text-xs font-bold uppercase text-[#F8F6F0] hover:bg-[#B82219] cursor-pointer"
              >
                Create Operator Account
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div
          role="alert"
          className="border-2 border-[#B91C1C] bg-[#FEF2F2] p-4 font-mono text-xs text-[#B91C1C]"
        >
          ERROR: {error}
        </div>
      )}

      <div className="border-2 border-[#111110] bg-[#FFFFFF]">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-[#111110] bg-[#EFECE3] hover:bg-[#EFECE3]">
              <TableHead className="font-mono text-xs uppercase text-[#111110]">
                Serial
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#111110]">
                Operator Name
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#111110]">
                Email
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#111110]">
                Phone
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#111110]">
                Counter Throughput
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#111110]">
                Status
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#111110] text-right">
                Controls
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 font-mono text-xs text-[#4A4843]"
                >
                  LOADING OPERATOR ROSTER...
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 font-mono text-xs text-[#4A4843]"
                >
                  NO STAFF OPERATORS REGISTERED.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member, idx) => {
                const serial = `STF-${String(idx + 1).padStart(2, '0')}`;
                return (
                  <TableRow
                    key={member.id}
                    className="border-b border-[#D4D0C5] hover:bg-[#F8F6F0]"
                  >
                    <TableCell className="font-mono text-xs text-[#4A4843]">
                      {serial}
                    </TableCell>
                    <TableCell className="font-semibold text-[#111110]">
                      {member.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#4A4843]">
                      {member.email}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#4A4843]">
                      {member.phone || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums text-[#111110]">
                      {member.transactions_processed} alloc ·{' '}
                      {member.redemptions_confirmed} redeem
                    </TableCell>
                    <TableCell>
                      {member.active ? (
                        <span className="inline-flex items-center gap-1 border border-[#15803D] bg-[#DCFCE7] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-[#15803D]">
                          <UserCheck className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 border border-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-[#B91C1C]">
                          <UserX className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditDialog(member)}
                        title="Edit Operator"
                        className="inline-flex items-center gap-1 border border-[#111110] bg-[#FFFFFF] px-2.5 py-1 font-mono text-xs font-semibold text-[#111110] hover:bg-[#EFECE3] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member)}
                        title={member.active ? 'Suspend' : 'Activate'}
                        className="inline-flex items-center gap-1 border border-[#111110] bg-[#FFFFFF] px-2.5 py-1 font-mono text-xs font-semibold text-[#111110] hover:bg-[#EFECE3] cursor-pointer"
                      >
                        {member.active ? 'Suspend' : 'Activate'}
                      </button>
                      {member.active && (
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          title="Deactivate Operator"
                          className="inline-flex items-center border border-[#B91C1C] bg-[#FEF2F2] p-1.5 text-[#B91C1C] hover:bg-[#B91C1C] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-2 border-[#111110] bg-[#F8F6F0] text-[#111110] rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#111110]">
              Edit Operator Account
            </DialogTitle>
            <DialogDescription className="text-xs text-[#4A4843]">
              Update contact details for {editingStaff?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-name"
                className="font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                Full Name
              </label>
              <input
                id="edit-name"
                type="text"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
                className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-email"
                className="font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                Email Address
              </label>
              <input
                id="edit-email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-phone"
                className="font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                Phone
              </label>
              <input
                id="edit-phone"
                type="text"
                value={formState.phone}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
                className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 font-mono text-xs text-[#111110]"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleEdit}
              className="w-full bg-[#E02E24] py-3 px-5 font-mono text-xs font-bold uppercase text-[#F8F6F0] hover:bg-[#B82219] cursor-pointer"
            >
              Save Operator Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
