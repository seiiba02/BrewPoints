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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, UserCheck, UserX, RefreshCw } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Staff Directory</h2>
          <Button variant="ghost" size="icon" onClick={fetchStaff} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogDescription>
                Create a new barista staff account in MySQL.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Alex Barista"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@brewpoints.local"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="+639000000099"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState({ ...formState, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading staff accounts...
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {member.transactions_processed} txns ({member.redemptions_confirmed} redemptions)
                  </TableCell>
                  <TableCell>
                    {member.active ? (
                      <span className="text-green-600 flex items-center text-sm font-medium">
                        <UserCheck className="mr-1 h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center text-sm font-medium">
                        <UserX className="mr-1 h-4 w-4" /> Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(member)}
                      title="Edit Staff"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(member)}
                      title={member.active ? 'Deactivate' : 'Activate'}
                    >
                      {member.active ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                    {member.active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member)}
                        title="Soft Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Update details for {editingStaff?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formState.phone}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
