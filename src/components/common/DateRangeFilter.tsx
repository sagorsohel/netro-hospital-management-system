import React from 'react';
import { CalendarDays } from 'lucide-react';

export type DatePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth' | 'custom';

export interface DateRangeValue {
  preset: DatePreset;
  /** YYYY-MM-DD, only used for the custom range (inclusive both ends) */
  customFrom?: string;
  customTo?: string;
}

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'custom', label: 'Custom' },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Turns the picked range into API params using the browser's local day boundaries
 * (so "Today" is today in Dhaka). `to` is exclusive.
 */
export const dateRangeToParams = (v: DateRangeValue): { from?: string; to?: string } => {
  const today = startOfDay(new Date());
  let from: Date | undefined;
  let to: Date | undefined;
  switch (v.preset) {
    case 'today':
      from = today;
      to = addDays(today, 1);
      break;
    case 'yesterday':
      from = addDays(today, -1);
      to = today;
      break;
    case 'last7':
      from = addDays(today, -6);
      to = addDays(today, 1);
      break;
    case 'thisMonth':
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      break;
    case 'lastMonth':
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'custom':
      if (v.customFrom) from = parseYmd(v.customFrom);
      if (v.customTo) to = addDays(parseYmd(v.customTo), 1);
      break;
  }
  return { from: from?.toISOString(), to: to?.toISOString() };
};

/** Human label for the selected period, e.g. "Last 7 days (19 Nov – 25 Nov 2026)" */
export const dateRangeLabel = (v: DateRangeValue): string => {
  if (v.preset === 'all') return 'All time';
  const { from, to } = dateRangeToParams(v);
  const name = PRESETS.find((p) => p.value === v.preset)?.label || '';
  if (!from && !to) return name;
  const a = from ? fmt(new Date(from)) : '…';
  const b = to ? fmt(addDays(new Date(to), -1)) : 'now';
  return a === b ? `${name} (${a})` : `${name} (${a} – ${b})`;
};

interface Props {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  compact?: boolean;
}

/** Segmented date-range picker: Today / Yesterday / Last 7 days / This month / Last month / Custom */
export const DateRangeFilter: React.FC<Props> = ({ value, onChange, compact }) => {
  const btn = compact ? 'px-2.5 h-7 text-[11px]' : 'px-3 h-8 text-xs';
  const inputCls = `${compact ? 'h-7' : 'h-8'} px-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-primary focus:outline-hidden`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() =>
              onChange(
                p.value === 'custom'
                  ? {
                      preset: 'custom',
                      customFrom: value.customFrom || new Date(Date.now() - 6 * 864e5).toLocaleDateString('en-CA'),
                      customTo: value.customTo || new Date().toLocaleDateString('en-CA'),
                    }
                  : { preset: p.value }
              )
            }
            className={`${btn} rounded-md font-semibold whitespace-nowrap transition cursor-pointer ${
              value.preset === p.value ? 'bg-white text-primary shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            className={inputCls}
            value={value.customFrom || ''}
            max={value.customTo || undefined}
            onChange={(e) => onChange({ ...value, customFrom: e.target.value })}
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            className={inputCls}
            value={value.customTo || ''}
            min={value.customFrom || undefined}
            onChange={(e) => onChange({ ...value, customTo: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
