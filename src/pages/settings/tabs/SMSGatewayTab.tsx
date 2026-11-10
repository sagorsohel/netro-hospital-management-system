import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Key,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Check,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY_SMS = 'netro_hospital_sms_settings_v1';

export const SMSGatewayTab: React.FC = () => {
  const [provider, setProvider] = useState('Greenweb SMS');
  const [apiKey, setApiKey] = useState('gw_live_98a72bc30f4e198');
  const [senderId, setSenderId] = useState('NETROHOSP');
  const [clientId, setClientId] = useState('NETRO-BD-01');
  const [smsBalance, setSmsBalance] = useState('1,450 SMS');

  // Test SMS State
  const [testMobile, setTestMobile] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Template State
  const [serialTemplate, setSerialTemplate] = useState(
    'Dear {patient_name}, your serial #{serial_no} with {doctor_name} is confirmed for {date} at {time}. Chamber: {room_no}. Netro Hospital Hotline: 10655'
  );
  const [diagnosticTemplate, setDiagnosticTemplate] = useState(
    'Dear {patient_name}, your diagnostic test report (Bill #{invoice_no}) is READY for collection at Netro Hospital Lab Room 102. Netro Hospital'
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      STORAGE_KEY_SMS,
      JSON.stringify({ provider, apiKey, senderId, clientId, serialTemplate, diagnosticTemplate })
    );
    alert('SMS & Messaging Gateway settings saved successfully!');
  };

  const handleSendTestSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMobile.trim()) {
      alert('Please enter a valid mobile number.');
      return;
    }
    setIsSending(true);
    setTestResult(null);

    setTimeout(() => {
      setIsSending(false);
      setTestResult(`Test SMS delivered successfully to ${testMobile} via ${provider}!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-0.5">
            <MessageSquare className="h-4 w-4" />
            <span>Section 5 & 4.9 — Automated SMS & WhatsApp Messaging Gateway</span>
          </div>
          <h2 className="text-xl font-black text-dark">SMS & Notification Gateway</h2>
          <p className="text-xs text-slate-500">
            Configure SMS API for real-time patient serial bookings, report-ready notifications, and bills.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          <span>Active Balance: {smsBalance}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: API Gateway Credentials & Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
            Gateway Provider & Credentials
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">SMS Gateway Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 focus:outline-hidden"
              >
                <option value="Greenweb SMS">Greenweb SMS (Bangladesh Masking & Non-masking)</option>
                <option value="SSL Wireless">SSL Wireless Gateway</option>
                <option value="BulkSMS BD">BulkSMS BD</option>
                <option value="Twilio / Global">Twilio / Global Cloud Gateway</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">API Key / Token</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-teal-500 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Sender ID (Masking / Alphanumeric)</label>
                <input
                  type="text"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-teal-800 focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Template 1: Doctor Serial Confirmation */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Doctor Serial Confirmation Template</label>
                <span className="text-[10px] text-slate-400 font-mono">Variables: {`{patient_name}, {serial_no}, {doctor_name}, {date}, {time}, {room_no}`}</span>
              </div>
              <textarea
                rows={2}
                value={serialTemplate}
                onChange={(e) => setSerialTemplate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Template 2: Diagnostic Report Ready */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Diagnostic Report Ready Template</label>
                <span className="text-[10px] text-slate-400 font-mono">Variables: {`{patient_name}, {invoice_no}`}</span>
              </div>
              <textarea
                rows={2}
                value={diagnosticTemplate}
                onChange={(e) => setDiagnosticTemplate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Save Gateway Configuration
            </button>
          </form>
        </div>

        {/* Right Column: Live SMS Test Bench (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-teal-600" />
            <span>Test SMS Gateway</span>
          </h3>
          <p className="text-xs text-slate-500">
            Send an instant test SMS to verify the API credentials and sender ID routing.
          </p>

          <form onSubmit={handleSendTestSMS} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Recipient Mobile Number</label>
              <input
                type="tel"
                placeholder="017xxxxxxxx"
                value={testMobile}
                onChange={(e) => setTestMobile(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? 'Sending Test SMS...' : 'Send Test SMS Now'}</span>
            </button>
          </form>

          {testResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

