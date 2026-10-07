'use client';

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Check, X, RefreshCw } from 'lucide-react';

interface RewardItem {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  active: boolean;
}

export function RewardCatalog() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    points_required: 100,
    active: true,
  });

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/rewards?include_inactive=1');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load rewards.');
      }
      setRewards(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreate = async () => {
    setError(null);
    const res = await fetch('/api/v1/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formState.name,
        description: formState.description || null,
        points_required: Number(formState.points_required),
        active: formState.active,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Failed to create reward.');
      return;
    }
    setRewards((prev) => [...prev, json.data]);
    setIsCreateOpen(false);
    setFormState({ name: '', description: '', points_required: 100, active: true });
  };

  const handleEdit = async () => {
    if (!editingReward) return;
    setError(null);
    const res = await fetch(`/api/v1/rewards/${editingReward.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formState.name,
        description: formState.description || null,
        points_required: Number(formState.points_required),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Failed to update reward.');
      return;
    }
    setRewards((prev) =>
      prev.map((r) => (r.id === editingReward.id ? json.data : r))
    );
    setIsEditOpen(false);
    setEditingReward(null);
  };

  const handleToggleStatus = async (reward: RewardItem) => {
    setError(null);
    const res = await fetch(`/api/v1/rewards/${reward.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !reward.active }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Failed to toggle reward status.');
      return;
    }
    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? json.data : r))
    );
  };

  const handleDelete = async (reward: RewardItem) => {
    setError(null);
    const res = await fetch(`/api/v1/rewards/${reward.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setRewards((prev) => prev.filter((r) => r.id !== reward.id));
    }
  };

  const openEditDialog = (reward: RewardItem) => {
    setEditingReward(reward);
    setFormState({
      name: reward.name,
      description: reward.description ?? '',
      points_required: reward.points_required,
      active: reward.active,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Reward Catalog</h2>
          <Button variant="ghost" size="icon" onClick={fetchRewards} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Reward
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Reward</DialogTitle>
              <DialogDescription>
                Create a new loyalty reward in the catalog.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Free Cold Brew"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Any 16oz handcrafted cold brew"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({ ...formState, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="points">Points Required</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={formState.points_required}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      points_required: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create Reward</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading rewards catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className={!reward.active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{reward.name}</CardTitle>
                  <Badge variant={reward.active ? 'default' : 'secondary'}>
                    {reward.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>
                  {reward.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base font-semibold text-amber-800">
                  {reward.points_required.toLocaleString()} Points
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(reward)}
                  title="Edit Reward"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleStatus(reward)}
                  title={reward.active ? 'Deactivate' : 'Activate'}
                >
                  {reward.active ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(reward)}
                  title="Delete Reward"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>
              Update details for {editingReward?.name}.
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
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formState.description}
                onChange={(e) =>
                  setFormState({ ...formState, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-points">Points Required</Label>
              <Input
                id="edit-points"
                type="number"
                min={1}
                value={formState.points_required}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    points_required: Number(e.target.value) || 0,
                  })
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
