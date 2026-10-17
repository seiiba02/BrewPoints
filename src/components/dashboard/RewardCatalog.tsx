'use client';

import { useEffect, useState } from 'react';
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
import { computeSpecimenAxes } from '@/lib/design-tokens';

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
    setFormState({
      name: '',
      description: '',
      points_required: 100,
      active: true,
    });
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

  const maxPoints = Math.max(
    200,
    ...rewards.map((r) => r.points_required),
    formState.points_required
  );
  const formSpecimen = computeSpecimenAxes(
    formState.points_required,
    maxPoints
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#111110]">
            Active &amp; Archived Specimens ({rewards.length})
          </h2>
          <button
            type="button"
            onClick={fetchRewards}
            title="Refresh Catalog"
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
                <span>Add Reward Specimen</span>
              </button>
            }
          />
          <DialogContent className="border-2 border-[#111110] bg-[#F8F6F0] text-[#111110] rounded-none sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#111110]">
                New Reward Specimen
              </DialogTitle>
              <DialogDescription className="text-xs text-[#4A4843]">
                Define the reward name, tasting description, and point threshold
                ($1.00 = 1 pt).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <label
                  htmlFor="name"
                  className="font-mono text-xs font-semibold uppercase text-[#111110]"
                >
                  Reward Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Single-Origin Cold Brew"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="description"
                  className="font-mono text-xs font-semibold uppercase text-[#111110]"
                >
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="16oz slow-steeped washed Ethiopian cold brew"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({ ...formState, description: e.target.value })
                  }
                  className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="points"
                  className="font-mono text-xs font-semibold uppercase text-[#111110]"
                >
                  Points Required
                </label>
                <input
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
                  className="border-2 border-[#111110] bg-[#FFFFFF] px-3 py-2 font-mono text-base font-bold text-[#111110] tabular-nums"
                />
              </div>
              <div className="border border-[#111110] bg-[#FFFFFF] p-4 flex items-baseline justify-between">
                <span
                  className="font-specimen text-4xl text-[#111110]"
                  style={{
                    ['--specimen-wght' as string]: formSpecimen.wght,
                    ['--specimen-opsz' as string]: formSpecimen.opsz,
                  }}
                >
                  {formState.points_required} pts
                </span>
                <span className="font-mono text-xs text-[#4A4843]">
                  &apos;wght&apos; {formSpecimen.wght} · $
                  {formState.points_required.toFixed(2)} USD
                </span>
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCreate}
                className="w-full bg-[#E02E24] py-3 px-5 font-mono text-xs font-bold uppercase text-[#F8F6F0] hover:bg-[#B82219] cursor-pointer"
              >
                Publish Reward Specimen
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

      {loading ? (
        <div className="border-2 border-[#111110] bg-[#FFFFFF] p-12 text-center font-mono text-xs text-[#4A4843]">
          LOADING REWARD SPECIMENS...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t-2 border-l-2 border-[#111110] bg-[#FFFFFF]">
          {rewards.map((reward, index) => {
            const axis = computeSpecimenAxes(reward.points_required, maxPoints);
            const code = `RWD-${String(index + 1).padStart(2, '0')}`;
            return (
              <div
                key={reward.id}
                className={`flex flex-col justify-between border-r-2 border-b-2 border-[#111110] p-6 ${
                  !reward.active ? 'bg-[#EFECE3]/60 opacity-75' : 'bg-[#FFFFFF]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-[#111110]">
                      {reward.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                      <span className="border border-[#111110] bg-[#F8F6F0] px-2 py-0.5 text-[#111110]">
                        {code}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-semibold uppercase ${
                          reward.active
                            ? 'bg-[#DCFCE7] text-[#15803D] border border-[#15803D]'
                            : 'bg-[#D4D0C5] text-[#4A4843]'
                        }`}
                      >
                        {reward.active ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#4A4843]">
                    {reward.description || 'No tasting description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D4D0C5] space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div
                      className="font-specimen text-4xl text-[#111110]"
                      style={{
                        ['--specimen-wght' as string]: axis.wght,
                        ['--specimen-opsz' as string]: axis.opsz,
                      }}
                    >
                      {reward.points_required.toLocaleString()}
                      <span className="ml-1.5 text-sm font-normal text-[#4A4843]">
                        pts
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#4A4843] tabular-nums">
                      &apos;wght&apos; {axis.wght}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4D0C5]">
                    <button
                      type="button"
                      onClick={() => openEditDialog(reward)}
                      title="Edit Reward"
                      className="inline-flex items-center gap-1 border border-[#111110] bg-[#FFFFFF] px-3 py-1.5 font-mono text-xs font-semibold text-[#111110] hover:bg-[#F8F6F0] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(reward)}
                      title={reward.active ? 'Deactivate' : 'Activate'}
                      className="inline-flex items-center gap-1 border border-[#111110] bg-[#FFFFFF] px-3 py-1.5 font-mono text-xs font-semibold text-[#111110] hover:bg-[#F8F6F0] cursor-pointer"
                    >
                      {reward.active ? (
                        <>
                          <X className="h-3.5 w-3.5" />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#15803D]" />
                          <span>Enable</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reward)}
                      title="Delete Reward"
                      className="inline-flex items-center gap-1 border border-[#B91C1C] bg-[#FEF2F2] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#B91C1C] hover:bg-[#B91C1C] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-2 border-[#111110] bg-[#F8F6F0] text-[#111110] rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#111110]">
              Edit Reward Specimen
            </DialogTitle>
            <DialogDescription className="text-xs text-[#4A4843]">
              Update configuration for {editingReward?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-name"
                className="font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                Reward Name
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
                htmlFor="edit-description"
                className="font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                Description
              </label>
              <input
                id="edit-description"
                type="text"
                value={formState.description}
                onChange={(e) =>
                  setFormState({ ...formState, description: e.target.value })
                }
                className="border border-[#111110] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111110]"
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="edit-points"
                className="font-mono text-xs font-semibold uppercase text-[#111110]"
              >
                Points Required
              </label>
              <input
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
                className="border-2 border-[#111110] bg-[#FFFFFF] px-3 py-2 font-mono text-base font-bold text-[#111110] tabular-nums"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleEdit}
              className="w-full bg-[#E02E24] py-3 px-5 font-mono text-xs font-bold uppercase text-[#F8F6F0] hover:bg-[#B82219] cursor-pointer"
            >
              Save Specimen Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
