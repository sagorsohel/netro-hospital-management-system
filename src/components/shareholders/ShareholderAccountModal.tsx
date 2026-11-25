import React, { useState } from 'react';
import { CheckCircle2, Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw, X } from 'lucide-react';
import {
  generatePassword,
  useCreateShareholderAccountMutation,
  useResetShareholderPasswordMutation,
  type Shareholder,
} from '../../store/api/shareholderApi';

interface Props {
  shareholder: Shareholder;
  mode: 'create' | 'reset';
  onClose: () => void;
}

const inputCls =
  'w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-hidden';

/** Admin creates a shareholder login or sets a new password, then copies the details to hand over. */
export const ShareholderAccountModal: React.FC<Props> = ({ shareholder, mode, onClose }) => {
  const [createAccount, { isLoading: isCreating }] = useCreateShareholderAccountMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetShareholderPasswordMutation();

  const [email, setEmail] = useState(mode === 'create' ? shareholder.email || '' : shareholder.account?.email || '');
  const [password, setPassword] = useState(generatePassword());
  const [show, setShow] = useState(true);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const busy = isCreating || isResetting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    try {
      if (mode === 'create') {
        await createAccount({ id: shareholder.id, email: email.trim(), password }).unwrap();
      } else {
        await resetPassword({ id: shareholder.id, newPassword: password }).unwrap();
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.data?.message || 'Something went wrong.');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Netro Hospital — Shareholder Login\nEmail: ${email.trim()}\nPassword: ${password}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'create' ? 'Create Shareholder Login' : 'Reset Password'}
              </h3>
              <p className="text-[11px] text-slate-500">{shareholder.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              {mode === 'create' ? 'Login created.' : 'Password has been reset.'} Give these details to the shareholder:
            </div>
            <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-[13px] space-y-1">
              <div>
                <span className="text-slate-400">Email: </span>
                {email.trim()}
              </div>
              <div>
                <span className="text-slate-400">Password: </span>
                {password}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              This password is not shown again. The shareholder can view their own shares plus hospital expenses and equipment — nothing can be changed.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={copy} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 cursor-pointer">
                <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold cursor-pointer">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3.5 text-xs">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">Login email</span>
              <input
                type="email"
                required
                className={`${inputCls} ${mode === 'reset' ? 'bg-slate-50 text-slate-500' : ''}`}
                value={email}
                readOnly={mode === 'reset'}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shareholder@email.com"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">
                {mode === 'create' ? 'Password' : 'New password'}
              </span>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type={show ? 'text' : 'password'}
                    className={`${inputCls} font-mono pr-8`}
                    value={password}
                    minLength={6}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-2.5 text-slate-400 cursor-pointer">
                    {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  title="Generate a new password"
                  className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="block text-[10px] text-slate-400">At least 6 characters. Type your own or generate one.</span>
            </label>

            {error && <p className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2">{error}</p>}

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {mode === 'create' ? 'Create login' : 'Reset password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShareholderAccountModal;
