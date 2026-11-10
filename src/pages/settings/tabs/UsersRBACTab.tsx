import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  User,
  Mail,
  Phone,
  Check,
  X,
  Trash2,
  Key,
  Shield,
  Eye,
} from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';

interface HospitalUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'receptionist' | 'lab_technician' | 'accountant' | 'doctor' | 'hr_manager' | 'shareholder';
  phone?: string;
  branchName: string;
  isActive: boolean;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'netro_hospital_users_list_v1';

const getInitialUsers = (): HospitalUser[] => [
  {
    id: 'usr-1',
    name: 'Dr. Sohel Sagor',
    email: 'admin@netro.com',
    role: 'admin',
    phone: '01711-000001',
    branchName: 'Main Hospital',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'usr-2',
    name: 'Nusrat Receptionist',
    email: 'reception@netro.com',
    role: 'receptionist',
    phone: '01711-000002',
    branchName: 'Main Hospital Lobby',
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'usr-3',
    name: 'Kabir Lab Tech',
    email: 'lab@netro.com',
    role: 'lab_technician',
    phone: '01711-000003',
    branchName: 'Diagnostic Center 2nd Floor',
    isActive: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-4',
    name: 'Rashedul Accounts',
    email: 'accounts@netro.com',
    role: 'accountant',
    phone: '01711-000004',
    branchName: 'Finance Wing',
    isActive: true,
    createdAt: '2026-02-01',
  },
];

export const UsersRBACTab: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const [users, setUsers] = useState<HospitalUser[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      return raw ? JSON.parse(raw) : getInitialUsers();
    } catch {
      return getInitialUsers();
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<HospitalUser['role']>('receptionist');
  const [phone, setPhone] = useState('');
  const [branchName, setBranchName] = useState('Main Hospital');

  const saveUsers = (newList: HospitalUser[]) => {
    setUsers(newList);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(newList));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: HospitalUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      phone: phone.trim(),
      branchName: branchName.trim(),
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveUsers([...users, newUser]);
    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
  };

  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    saveUsers(updated);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Delete this user account?')) {
      saveUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Add Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-0.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Section 4.11 — Super Admin & Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-xl font-black text-dark">Staff Accounts & User Roles</h2>
          <p className="text-xs text-slate-500">
            Create user accounts and assign role-based permissions (Receptionist, Lab Tech, Accountant, Doctor, HR).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* 2. Role Permissions Matrix Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
          Role-Based Access Control (RBAC) Permissions Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Allowed Modules & Scope</th>
                <th className="py-2.5 px-3 text-center">Restricted Modules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="py-2.5 px-3 font-bold text-teal-800">Super Admin</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">All Modules, Financials, Settings, DB</td>
                <td className="py-2.5 px-3 text-center text-slate-400">None (Full Access)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-800">Receptionist</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">Patient Intake, Admissions, Doctor Serials, Test POS</td>
                <td className="py-2.5 px-3 text-center text-rose-600 font-semibold">Expenses, HR, Settings, Shareholders</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-800">Lab Technician</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">Diagnostic Invoices, Lab Workstation Barcode Scanner</td>
                <td className="py-2.5 px-3 text-center text-rose-600 font-semibold">Financials, HR, Doctors, Settings</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">Accountant</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">Hospital Expenses, Invoices, Billing, P&L Reports</td>
                <td className="py-2.5 px-3 text-center text-rose-600 font-semibold">Clinical Data, Room Config</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-purple-800">Doctor</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">Doctor Chamber Serials & Patient Profiles</td>
                <td className="py-2.5 px-3 text-center text-rose-600 font-semibold">Admin Settings, Pharmacy Backend</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-800">Shareholder</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">Shareholder Panel (Strictly Read-Only Statement)</td>
                <td className="py-2.5 px-3 text-center text-rose-600 font-semibold">All Edit / Mutation Actions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Users List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-dark">Authorized Users ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User Info</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Branch / Dept</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-dark">{u.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{u.email}</span>
                      {u.phone && <span>• {u.phone}</span>}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold uppercase text-[10px]">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{u.branchName}</td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-dark">Create Hospital Staff Account</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nusrat Jahan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Login Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="user@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assign Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-8.5 px-2 rounded-lg border border-teal-300 bg-teal-50 text-xs font-bold text-teal-800 focus:outline-hidden"
                  >
                    <option value="admin">Super Admin</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="lab_technician">Lab Technician</option>
                    <option value="accountant">Accountant</option>
                    <option value="doctor">Doctor</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="shareholder">Shareholder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Branch / Location</label>
                <input
                  type="text"
                  placeholder="Main Hospital Lobby"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

