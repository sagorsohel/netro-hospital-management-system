import React, { useRef } from 'react';
import {
  Printer,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Clock,
  Phone,
  DoorOpen,
  User,
  ShieldCheck,
} from 'lucide-react';
import type { DoctorSerial } from '../../store/api/serialApi';

interface DoctorSerialSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  serial: DoctorSerial | null;
  autoPrint?: boolean;
}

export const DoctorSerialSlipModal: React.FC<DoctorSerialSlipModalProps> = ({
  isOpen,
  onClose,
  serial,
  autoPrint = false,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && serial && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, serial, autoPrint]);

  if (!isOpen || !serial) return null;

  const handlePrint = () => {
    if (!serial) return;

    // Create an isolated hidden iframe for 100% reliable, pristine printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const formattedDate = new Date(serial.appointmentDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const feeNum = parseFloat(String(serial.consultationFee || 0));
    const discountNum = parseFloat(String(serial.discount || 0));
    const paidNum = parseFloat(String(serial.paidAmount || 0));
    const dueNum = parseFloat(String(serial.dueAmount || 0));
    const totalPayable = Math.max(0, feeNum - discountNum);

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Doctor Serial Token - ${serial.tokenNo}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A5 portrait;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
          }
          body {
            background: #ffffff;
            font-size: 11px;
            line-height: 1.4;
            padding: 10px;
          }
          .token-card {
            border: 2px dashed #0d9488;
            border-radius: 14px;
            padding: 16px;
            position: relative;
            background: #fafafa;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .hospital-name {
            font-size: 17px;
            font-weight: 800;
            color: #0f766e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .hospital-subtitle {
            font-size: 10.5px;
            color: #475569;
            margin-top: 2px;
          }
          .hospital-contact {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 3px;
          }
          .token-badge-box {
            background: #0f766e;
            color: #ffffff;
            border-radius: 10px;
            padding: 10px 14px;
            text-align: center;
            margin: 10px 0 14px 0;
            box-shadow: 0 2px 8px rgba(15, 118, 110, 0.2);
          }
          .token-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.9;
            font-weight: 600;
          }
          .token-number {
            font-size: 38px;
            font-weight: 900;
            line-height: 1;
            margin: 4px 0;
            letter-spacing: -1px;
          }
          .token-sub {
            font-size: 10.5px;
            opacity: 0.95;
            display: flex;
            justify-content: center;
            gap: 12px;
            font-weight: 500;
          }
          .grid-two {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
          }
          .box-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #0f766e;
            margin-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 4px;
          }
          .field {
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
          }
          .field-label {
            color: #64748b;
            font-size: 10px;
          }
          .field-value {
            font-weight: 600;
            color: #0f172a;
            font-size: 10.5px;
            text-align: right;
          }
          .doctor-name-strong {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .doctor-spec {
            font-size: 10px;
            color: #0d9488;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .room-pill {
            display: inline-block;
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            color: #0f766e;
            font-weight: 700;
            font-size: 10.5px;
            padding: 3px 8px;
            border-radius: 6px;
            margin-top: 4px;
          }
          .billing-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }
          .billing-table th {
            background: #f8fafc;
            padding: 6px 10px;
            text-align: left;
            font-size: 9.5px;
            font-weight: 700;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
          }
          .billing-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 10px;
          }
          .notice-bengali {
            background: #fefce8;
            border: 1px solid #fef08a;
            border-radius: 8px;
            padding: 8px 12px;
            margin-top: 12px;
            font-size: 10px;
            color: #854d0e;
            line-height: 1.5;
          }
          .footer {
            margin-top: 14px;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="token-card">
          <!-- Hospital Header -->
          <div class="header">
            <div class="hospital-name">NETRO GENERAL HOSPITAL</div>
            <div class="hospital-subtitle">Outpatient Consultation & Specialized Doctor Chambers</div>
            <div class="hospital-contact">House #14, Road #07, Dhanmondi, Dhaka | Hotline: 10655, 01711-002233</div>
          </div>

          <!-- Prominent Serial Banner -->
          <div class="token-badge-box">
            <div class="token-label">DOCTOR SERIAL TOKEN</div>
            <div class="token-number">SERIAL #${String(serial.serialNumber).padStart(2, '0')}</div>
            <div class="token-sub">
              <span>Token: <strong>${serial.tokenNo}</strong></span>
              <span>•</span>
              <span>Date: <strong>${formattedDate}</strong></span>
              <span>•</span>
              <span>Est. Time: <strong>${serial.estimatedTime}</strong></span>
            </div>
          </div>

          <!-- Doctor & Patient 2-Column Info -->
          <div class="grid-two">
            <!-- Doctor Details -->
            <div class="box">
              <div class="box-title">Doctor Chamber Details</div>
              <div class="doctor-name-strong">${serial.doctorName}</div>
              <div class="doctor-spec">${serial.doctorDepartment}</div>
              <div class="room-pill">Chamber: ${serial.doctorRoomNumber}</div>
              <div style="margin-top: 6px; font-size: 9.5px; color: #64748b;">
                Serial Hotline: <strong>${serial.doctorSerialContact || '01711-002233'}</strong>
              </div>
            </div>

            <!-- Patient Details -->
            <div class="box">
              <div class="box-title">Patient Profile</div>
              <div class="field">
                <span class="field-label">Patient Name:</span>
                <span class="field-value">${serial.patientName}</span>
              </div>
              <div class="field">
                <span class="field-label">Mobile:</span>
                <span class="field-value">${serial.patientPhone}</span>
              </div>
              <div class="field">
                <span class="field-label">Patient ID:</span>
                <span class="field-value">${serial.patientId || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Age & Gender:</span>
                <span class="field-value">${serial.patientAge ? `${serial.patientAge} yrs` : 'N/A'}, ${serial.patientGender || 'Male'}</span>
              </div>
              ${
                serial.symptoms
                  ? `<div class="field"><span class="field-label">Complaints:</span><span class="field-value" style="font-weight: 500; font-size: 9.5px;">${serial.symptoms}</span></div>`
                  : ''
              }
            </div>
          </div>

          <!-- Billing & Payment Receipt -->
          <table class="billing-table">
            <thead>
              <tr>
                <th>Consultation Type</th>
                <th style="text-align: right;">Fee (৳)</th>
                <th style="text-align: right;">Discount (৳)</th>
                <th style="text-align: right;">Paid (৳)</th>
                <th style="text-align: right;">Due (৳)</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${serial.visitType}</strong> (${serial.paymentMethod})</td>
                <td style="text-align: right;">৳${feeNum.toFixed(2)}</td>
                <td style="text-align: right;">৳${discountNum.toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: #0f766e;">৳${paidNum.toFixed(2)}</td>
                <td style="text-align: right; font-weight: 700; color: ${dueNum > 0 ? '#b91c1c' : '#475569'};">৳${dueNum.toFixed(2)}</td>
                <td style="text-align: center;">
                  <span style="background: ${serial.paymentStatus === 'Paid' ? '#dcfce7' : '#fee2e2'}; color: ${serial.paymentStatus === 'Paid' ? '#15803d' : '#b91c1c'}; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px;">
                    ${serial.paymentStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Bengali Instructions for Patient -->
          <div class="notice-bengali">
            <strong>রোগী ও সহযাত্রীদের জন্য নির্দেশনাবলী:</strong><br />
            ১. অনুগ্রহ করে আপনার সম্ভাব্য সময়ের অন্তত ১৫ মিনিট পূর্বে চেম্বার <strong>${serial.doctorRoomNumber}</strong> এর সামনে অবস্থিত অপেক্ষাগারে উপস্থিত থাকুন।<br />
            ২. সিরিয়াল নম্বর ঘোষণার সাথে সাথে এই টোকেনটি ডাক্তারের সহকারীর নিকট প্রদর্শন করুন।<br />
            ৩. পূর্ববর্তী সকল প্রেসক্রিপশন ও টেস্ট রিপোর্ট সাথে রাখুন।
          </div>

          <div class="footer">
            Printed at: ${new Date().toLocaleString('en-GB')} | Generated by Netro Hospital Smart Queue Management System
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  const formattedDate = new Date(serial.appointmentDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark">Doctor Serial Token Slip</h3>
              <p className="text-[11px] text-slate-500 font-mono">Token: {serial.tokenNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-xs cursor-pointer transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Token</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-dark transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={printAreaRef} className="p-5 overflow-y-auto space-y-4">
          {/* Hospital Header */}
          <div className="text-center pb-3 border-b border-slate-200">
            <h2 className="text-base font-extrabold text-teal-800 tracking-wide uppercase">
              Netro General Hospital
            </h2>
            <p className="text-xs text-slate-600">
              Specialist Consultation Chambers & Smart Outpatient Queue
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dhanmondi, Dhaka | Hotline: 10655, 01711-002233
            </p>
          </div>

          {/* Large Serial Badge Display */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-xl p-4 text-center shadow-md">
            <span className="text-[11px] font-semibold tracking-wider uppercase opacity-90">
              Allocated Serial Number
            </span>
            <div className="text-5xl font-black tracking-tight my-1">
              #{String(serial.serialNumber).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center gap-3 text-xs opacity-95 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-teal-300" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-teal-300" />
                Est. Time: {serial.estimatedTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DoorOpen className="h-3.5 w-3.5 text-teal-300" />
                {serial.doctorRoomNumber}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Doctor Card */}
            <div className="p-3 rounded-xl border border-teal-100 bg-teal-50/50 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">
                Assigned Specialist
              </span>
              <div className="font-bold text-dark text-sm">{serial.doctorName}</div>
              <p className="text-teal-700 font-medium">{serial.doctorDepartment}</p>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                <DoorOpen className="h-3 w-3" />
                {serial.doctorRoomNumber}
              </div>
              <p className="text-slate-500 text-[11px] flex items-center gap-1 pt-1">
                <Phone className="h-3 w-3 text-teal-600" />
                Serial Phone: {serial.doctorSerialContact || '01711-002233'}
              </p>
            </div>

            {/* Patient Card */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Patient Info
              </span>
              <div className="font-bold text-dark text-sm">{serial.patientName}</div>
              <p className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {serial.patientPhone}
              </p>
              <p className="text-slate-500 text-[11px]">
                ID: <span className="font-mono font-semibold">{serial.patientId || 'N/A'}</span> •{' '}
                {serial.patientGender}, {serial.patientAge ? `${serial.patientAge} yrs` : 'N/A'}
              </p>
              {serial.symptoms && (
                <p className="text-slate-600 text-[11px] italic bg-white p-1.5 rounded border border-slate-200">
                  "{serial.symptoms}"
                </p>
              )}
            </div>
          </div>

          {/* Fees & Billing Box */}
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-600">
                Consultation Type: <strong>{serial.visitType}</strong>
              </span>
              <span className="font-mono text-slate-500">Method: {serial.paymentMethod}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Doctor Fee</span>
                <p className="font-semibold text-slate-700">৳{serial.consultationFee}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Discount</span>
                <p className="font-semibold text-slate-700">৳{serial.discount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Paid</span>
                <p className="font-bold text-teal-700">৳{serial.paidAmount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Status</span>
                <p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      serial.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {serial.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bengali Patient Notice */}
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <p className="font-semibold text-amber-950 mb-0.5">রোগীদের বিশেষ নির্দেশনা:</p>
            অনুগ্রহ করে সিরিয়ালের সময় অনুযায়ী ১৫ মিনিট পূর্বে চেম্বার{' '}
            <strong>{serial.doctorRoomNumber}</strong> এর সামনে উপস্থিত থাকুন। আপনার সিরিয়াল ঘোষণা
            হওয়ার পর টোকেনটি ডাক্তারের সহকারীর নিকট জমা দিন।
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Current Queue Status: <strong className="text-teal-700">{serial.status}</strong></span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer font-medium"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

