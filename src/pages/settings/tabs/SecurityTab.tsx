import React, { useState } from 'react';
import { Shield, Key, Lock, Check, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export const SecurityTab: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError(true);
      setStatusMessage('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setStatusMessage('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setIsError(true);
      setStatusMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsError(false);
    setStatusMessage('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6 max-w-2xl">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark">Admin Password & Session Security</h3>
          <p className="text-xs text-slate-500">
            Logged in as <strong className="text-dark">{user?.name || 'Administrator'}</strong> ({user?.email || 'admin@netro.com'}) with role:{' '}
            <strong className="text-primary uppercase">{user?.role || 'Admin'}</strong>.
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Shield className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Current Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">New Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Confirm New Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              isError
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Key className="h-3.5 w-3.5" />
            <span>Update Account Password</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecurityTab;
