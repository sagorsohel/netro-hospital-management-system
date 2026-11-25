import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Layers, Loader2, Plus, Power, X } from 'lucide-react';
import {
  money,
  useCreateSharePlanMutation,
  useGetSharePlansQuery,
  useUpdateSharePlanMutation,
  useUpdateSharePlanStatusMutation,
  type SharePlan,
} from '../../store/api/shareholderApi';

const inputCls =
  'w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 focus:outline-hidden';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  DRAFT: 'bg-slate-100 text-slate-600',
  INACTIVE: 'bg-rose-50 text-rose-700',
};

const emptyForm = { code: '', name: '', planYear: String(new Date().getFullYear()), price: '', description: '', status: 'ACTIVE' };

/** Admin catalogue of share packages (e.g. "Single (2026)"). Plans are deactivated, never deleted. */
export const SharePlansPage: React.FC = () => {
  const { data, isLoading } = useGetSharePlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateSharePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSharePlanMutation();
  const [setPlanStatus] = useUpdateSharePlanStatusMutation();

  const [editing, setEditing] = useState<SharePlan | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const plans = data?.data || [];

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (p: SharePlan) => {
    setEditing(p);
    setForm({
      code: p.code,
      name: p.name,
      planYear: p.planYear ? String(p.planYear) : '',
      price: p.price != null ? String(Number(p.price)) : '',
      description: p.description || '',
      status: p.status,
    });
    setError('');
    setOpen(true);
  };

  // Suggest a code from the name + year while creating
  const setName = (name: string) =>
    setForm((f) => ({
      ...f,
      name,
      code: editing ? f.code : `${name.replace(/\(.*?\)/g, '').trim()}-${f.planYear}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const body = {
      code: form.code.trim(),
      name: form.name.trim(),
      planYear: form.planYear ? Number(form.planYear) : undefined,
      price: form.price === '' ? undefined : Number(form.price),
      description: form.description,
      status: form.status as SharePlan['status'],
    };
    try {
      if (editing) await updatePlan({ id: editing.id, data: body }).unwrap();
      else await createPlan(body).unwrap();
      setOpen(false);
    } catch (err: any) {
      setError([err?.data?.message || 'Failed to save plan.', err?.data?.cause].filter(Boolean).join(' — '));
    }
  };

  const toggle = async (p: SharePlan) => {
    const next = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (next === 'INACTIVE' && !confirm(`Deactivate "${p.name}"? Existing purchases keep it, but it can't be chosen for new ones.`)) return;
    try {
      await setPlanStatus({ id: p.id, status: next }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to change plan status.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16 text-slate-900">
      <div className="bg-white rounded-2xl px-5 py-4 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/shareholders" className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight">Share Plans</h1>
            <p className="text-xs text-slate-400">Packages a shareholder can buy. Used plans are deactivated, not deleted.</p>
          </div>
        </div>
        <button type="button" onClick={openNew} className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <Plus className="h-4 w-4" /> New plan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Year</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-center">Shares sold</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">Loading plans...</td>
              </tr>
            )}
            {!isLoading && plans.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Layers className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No share plans yet</p>
                  <p className="text-slate-400 mt-0.5">Create one, e.g. "Single (2026)", then assign it to shareholders.</p>
                </td>
              </tr>
            )}
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-bold">{p.name}</div>
                  {p.description && <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</div>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">{p.code}</td>
                <td className="py-3 px-4">{p.planYear || '—'}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold">{p.price != null ? money(p.price) : '—'}</td>
                <td className="py-3 px-4 text-center font-semibold">{p.purchaseCount ?? 0}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex gap-1.5">
                    <button type="button" onClick={() => openEdit(p)} title="Edit" className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(p)}
                      title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      className={`p-1.5 rounded-lg border border-slate-200 cursor-pointer ${p.status === 'ACTIVE' ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={submit} className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold">{editing ? 'Edit share plan' : 'New share plan'}</h3>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-xs">
              <label className="col-span-2 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Plan name *</span>
                <input className={inputCls} required value={form.name} onChange={(e) => setName(e.target.value)} placeholder="Single (2026)" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Code *</span>
                <input className={`${inputCls} font-mono uppercase`} required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SINGLE-2026" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Year</span>
                <input className={inputCls} type="number" min={2000} max={2100} value={form.planYear} onChange={(e) => setForm({ ...form, planYear: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Price per share (৳)</span>
                <input className={`${inputCls} font-mono`} type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 500000" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Status</span>
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
              <label className="col-span-2 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Description</span>
                <textarea className={`${inputCls} h-auto py-2`} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              {error && <p className="col-span-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2">{error}</p>}
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer">
                {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editing ? 'Save plan' : 'Create plan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SharePlansPage;
