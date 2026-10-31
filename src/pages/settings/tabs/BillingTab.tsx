import React, { useState } from 'react';
import { CreditCard, Save, Check, Percent, Receipt, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export const BillingTab: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    admissionFee: '500',
    calculationCycle: '24 Hours Cycle (Calculated from admission time)',
    vatRate: '0',
    emergencyBaseFee: '1000',
    otSanitizationFee: '1500',
    invoicePrefix: 'INV-NETRO-',
    allowDiscountOverride: true,
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
          <h3 className="text-lg font-bold text-dark">Hospital Tariffs & Admission Rates</h3>
          <p className="text-xs text-slate-500">
            Configure baseline admission processing fee, taxes, invoice sequence, and automated billing cycles.
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Inpatient (IPD) Admission Processing Fee (৳)</label>
            <Input
              value={formData.admissionFee}
              onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
              className="h-10 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Bed Charge Calculation Cycle</label>
            <Select
              value={formData.calculationCycle}
              onValueChange={(val) => setFormData({ ...formData, calculationCycle: val })}
            >
              <SelectTrigger className="h-10 rounded-xl text-xs bg-white border-slate-200">
                <SelectValue placeholder="Select Cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24 Hours Cycle (Calculated from admission time)">
                  24 Hours Cycle (Calculated from admission time)
                </SelectItem>
                <SelectItem value="Fixed Midnight Cut-off (12:00 AM)">
                  Fixed Midnight Cut-off (12:00 AM)
                </SelectItem>
                <SelectItem value="Fixed 12:00 PM (Noon Cut-off)">
                  Fixed 12:00 PM (Noon Cut-off)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Hospital VAT / Service Tax (%)</label>
            <Input
              type="number"
              min="0"
              max="30"
              value={formData.vatRate}
              onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
              className="h-10 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Emergency Triage Consultation Base Fee (৳)</label>
            <Input
              value={formData.emergencyBaseFee}
              onChange={(e) => setFormData({ ...formData, emergencyBaseFee: e.target.value })}
              className="h-10 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">OT Room Sanitization Base Charge (৳)</label>
            <Input
              value={formData.otSanitizationFee}
              onChange={(e) => setFormData({ ...formData, otSanitizationFee: e.target.value })}
              className="h-10 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Invoice Number Prefix</label>
            <Input
              value={formData.invoicePrefix}
              onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
              className="h-10 rounded-xl font-mono"
            />
          </div>

          <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700">Permit Receptionist Discount Override</span>
              <p className="text-[11px] text-slate-500">
                Allow billers to apply custom approved promotional discounts during discharge checkout.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.allowDiscountOverride}
                onChange={(e) => setFormData({ ...formData, allowDiscountOverride: e.target.checked })}
                className="h-4 w-4 rounded-sm text-primary focus:ring-primary cursor-pointer"
              />
              <span className="font-bold text-xs text-slate-700">
                {formData.allowDiscountOverride ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button
            type="submit"
            className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Update Billing Rules</span>
          </Button>

          {isSaved && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
              <Check className="h-4 w-4 stroke-[3]" />
              Billing rules updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default BillingTab;
