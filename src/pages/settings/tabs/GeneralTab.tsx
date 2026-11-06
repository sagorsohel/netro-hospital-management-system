import React, { useState } from 'react';
import { Building2, Save, Phone, Mail, MapPin, Globe, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export const GeneralTab: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: 'Netro Adhunik Eye Hospital Ltd.',
    branchName: 'Central Campus (Branch #1)',
    hotline: '+880 1700-000001',
    ambulanceHotline: '+880 1700-000002',
    email: 'info@netrohospital.com',
    website: 'https://netrohospital.com',
    currency: 'BDT (৳ - Bangladeshi Taka)',
    taxNumber: 'TIN-4839201928',
    address: 'House 42, Road 11, Dhanmondi, Dhaka - 1205, Bangladesh',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6 max-w-4xl">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark">Hospital Profile & Institutional Metadata</h3>
          <p className="text-xs text-slate-500">
            Configure primary hospital identity, emergency hotline numbers, and billing entity details.
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Hospital Legal Registered Name</label>
            <Input
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Campus / Branch Identifier</label>
            <Input
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>24/7 Emergency Hotline</span>
            </label>
            <Input
              value={formData.hotline}
              onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
              className="h-10 rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-rose-500" />
              <span>Ambulance Dispatch Desk</span>
            </label>
            <Input
              value={formData.ambulanceHotline}
              onChange={(e) => setFormData({ ...formData, ambulanceHotline: e.target.value })}
              className="h-10 rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              <span>Official Support Email</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>Official Website</span>
            </label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Operational Currency</label>
            <Input value={formData.currency} disabled className="h-10 rounded-xl bg-slate-50 font-medium" />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Tax Identification / TIN</label>
            <Input
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="h-10 rounded-xl font-mono"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
              <span>Physical Hospital Location</span>
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button
            type="submit"
            className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Hospital Profile</span>
          </Button>

          {isSaved && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
              <Check className="h-4 w-4 stroke-[3]" />
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default GeneralTab;
