import React, { useRef } from 'react';
import {
  Printer,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import type { InpatientAdmission } from '../../store/api/admissionApi';

interface AdmissionSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: InpatientAdmission | null;
  autoPrint?: boolean;
}

export const AdmissionSlipModal: React.FC<AdmissionSlipModalProps> = ({
  isOpen,
  onClose,
  admission,
  autoPrint = false,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && admission && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, admission, autoPrint]);

  if (!isOpen || !admission) return null;

  const extraCharges = Array.isArray(admission.extraCharges) ? admission.extraCharges : [];

  const handlePrint = () => {
    if (!admission) return;

    // Create an isolated hidden iframe for 100% reliable, pristine A4 printing
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

    const formattedDate = new Date(admission.admissionDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const grandTotalNum = parseFloat(String(admission.grandTotal || 0));
    const advanceNum = parseFloat(String(admission.advancePayment || 0));
    const dueNum = parseFloat(String(admission.dueAmount || 0));
    const discountNum = parseFloat(String(admission.discountAmount || 0));
    const subtotalNum = parseFloat(String(admission.subtotal || 0));
    const admFeeNum = parseFloat(String(admission.admissionFee || 0));
    const roomChargeNum = parseFloat(String(admission.roomCharge || admission.perDayCharge || 0));
    const opChargeNum = parseFloat(String(admission.operationCharge || 0));

    const extraRowsHtml = extraCharges
      .map(
        (c, idx) => `
        <tr style="${idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
          <td style="padding: 7px 12px; font-weight: 500; color: #334155; border-bottom: 1px solid #f1f5f9;">
            Extra: ${c.key}
          </td>
          <td style="padding: 7px 12px; text-align: center; color: #64748b; border-bottom: 1px solid #f1f5f9;">
            ${c.unit || 'Service'}
          </td>
          <td style="padding: 7px 12px; text-align: right; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
            ৳${parseFloat(String(c.value)).toFixed(2)}
          </td>
        </tr>`
      )
      .join('');

    const procedureHtml =
      admission.operationName || admission.diagnosis
        ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11.5px;">
          ${
            admission.operationName
              ? `<div style="display: flex; justify-content: space-between; font-weight: 700; color: #78350f;">
                   <span>Surgical Procedure:</span>
                   <span>${admission.operationName}</span>
                 </div>`
              : ''
          }
          ${
            admission.diagnosis
              ? `<div style="margin-top: 3px; color: #334155;">
                   <strong style="color: #0f172a;">Provisional Diagnosis:</strong> ${admission.diagnosis}
                 </div>`
              : ''
          }
        </div>`
        : '';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission Slip - ${admission.admissionNo}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 12mm 8mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 0;
              font-size: 11.5px;
              line-height: 1.35;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 10px;
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 12px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .brand-logo {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              object-fit: cover;
              border: 1px solid #e2e8f0;
            }
            .hospital-title {
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.02em;
              line-height: 1.1;
            }
            .hospital-subtitle {
              font-size: 9.5px;
              font-weight: 700;
              color: #008A3D;
              letter-spacing: 0.05em;
              margin-top: 2px;
            }
            .address-info {
              font-size: 10.5px;
              color: #64748b;
              margin-top: 3px;
              line-height: 1.3;
            }
            .voucher-badge {
              text-align: right;
            }
            .badge-no {
              background: #0f172a;
              color: #ffffff;
              font-family: monospace;
              font-size: 12px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 5px;
              display: inline-block;
              margin-bottom: 3px;
            }
            .badge-status {
              display: inline-block;
              background: #dcfce7;
              color: #166534;
              font-size: 9.5px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 9999px;
              text-transform: uppercase;
              margin-top: 3px;
            }
            .grid-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 10px 12px;
              margin-bottom: 12px;
              font-size: 11px;
            }
            .info-col {
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            .info-col:first-child {
              border-right: 1px solid #e2e8f0;
              padding-right: 12px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-label {
              color: #64748b;
              font-weight: 500;
            }
            .info-val {
              font-weight: 700;
              color: #0f172a;
            }
            .info-val.patient-id {
              color: #008A3D;
              font-family: monospace;
              font-weight: 800;
            }
            .bed-badge {
              background: #008A3D;
              color: #ffffff;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 4px;
            }
            .table-container {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              background: #008A3D !important;
              color: #ffffff !important;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.05em;
              padding: 7px 12px;
              text-align: left;
            }
            td {
              padding: 6px 12px;
              border-bottom: 1px solid #f1f5f9;
            }
            .ledger-summary {
              background: #f8fafc;
              padding: 9px 12px;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .ledger-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #475569;
            }
            .grand-total-row {
              border-top: 1px solid #cbd5e1;
              padding-top: 5px;
              margin-top: 2px;
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
            }
            .grand-total-val {
              color: #008A3D;
              font-size: 15px;
              font-weight: 900;
            }
            .due-row {
              border-top: 1px solid #cbd5e1;
              padding-top: 4px;
              font-weight: 800;
            }
            .due-val {
              color: #e11d48;
              font-weight: 900;
            }
            .paid-val {
              color: #166534;
              font-weight: 800;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 22px;
              padding-top: 14px;
              border-top: 1px solid #cbd5e1;
              text-align: center;
              font-size: 10.5px;
            }
            .signature-line {
              width: 140px;
              margin: 0 auto 3px auto;
              border-bottom: 1px solid #64748b;
            }
            .signature-title {
              font-weight: 700;
              color: #334155;
            }
            .signature-sub {
              font-size: 9px;
              color: #94a3b8;
            }
            .disclaimer {
              font-size: 8.5px;
              color: #94a3b8;
              text-align: center;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <!-- Brand Header -->
          <div class="header">
            <div>
              <div class="brand">
                <img src="/logo.png" alt="Netro Adhunik Eye Hospital" class="brand-logo" />
                <div>
                  <h1 class="hospital-title">Netro Adhunik Eye Hospital</h1>
                  <p class="hospital-subtitle">INPATIENT DEPARTMENT (IPD) ADMISSION & BILLING VOUCHER</p>
                </div>
              </div>
              <p class="address-info">House 42, Road 11, Banani, Dhaka-1213, Bangladesh</p>
              <p class="address-info">Emergency Hotline: +880 9610-000999 | IPD Desk: Ext. 402</p>
            </div>
            <div class="voucher-badge">
              <div class="badge-no">${admission.admissionNo}</div>
              <p style="font-size: 10px; color: #64748b;">Date: ${formattedDate}</p>
              <div><span class="badge-status">✓ ${admission.status.toUpperCase()}</span></div>
            </div>
          </div>

          <!-- Patient & Bed Grid -->
          <div class="grid-info">
            <div class="info-col">
              <div class="info-row">
                <span class="info-label">Patient ID:</span>
                <span class="info-val patient-id">${admission.patientUniqueId || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Patient Name:</span>
                <span class="info-val">${admission.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Age / Gender:</span>
                <span class="info-val">${admission.patientAge ? `${admission.patientAge} Yrs` : 'N/A'} / ${admission.patientGender || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Contact Phone:</span>
                <span class="info-val">${admission.patientPhone || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Guardian:</span>
                <span class="info-val">${admission.guardianName ? `${admission.guardianName} (${admission.guardianRelation || 'Relation'})` : 'N/A'}</span>
              </div>
            </div>

            <div class="info-col" style="padding-left: 12px;">
              <div class="info-row">
                <span class="info-label">Assigned Bed:</span>
                <span class="bed-badge">${admission.bedNumber || 'Bed 1'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Room & Ward:</span>
                <span class="info-val">Room ${admission.roomNumber || 'N/A'} (${admission.roomName || 'IPD Cabin'})</span>
              </div>
              <div class="info-row">
                <span class="info-label">Per-Day Rate:</span>
                <span class="info-val">৳${parseFloat(String(admission.perDayCharge || 0)).toLocaleString()} / day</span>
              </div>
              <div class="info-row">
                <span class="info-label">Attending Doctor:</span>
                <span class="info-val">${admission.doctorName || 'Dr. On Duty'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Department:</span>
                <span class="info-val">${admission.department || 'General Medicine'}</span>
              </div>
            </div>
          </div>

          <!-- Procedure & Diagnosis -->
          ${procedureHtml}

          <!-- Charges Table -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Charge Description</th>
                  <th style="text-align: center;">Unit / Rate</th>
                  <th style="text-align: right;">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: #ffffff;">
                  <td style="font-weight: 600; color: #1e293b;">Inpatient Admission & Registration Fee</td>
                  <td style="text-align: center; color: #64748b;">One-time</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">৳${admFeeNum.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="font-weight: 600; color: #1e293b;">Room / Cabin Charge (Day 1)</td>
                  <td style="text-align: center; color: #64748b;">1 Day</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">৳${roomChargeNum.toFixed(2)}</td>
                </tr>
                ${
                  opChargeNum > 0
                    ? `<tr style="background-color: #ffffff;">
                         <td style="font-weight: 600; color: #1e293b;">Surgical / Procedure Fee (${admission.operationName})</td>
                         <td style="text-align: center; color: #64748b;">Procedure</td>
                         <td style="text-align: right; font-weight: 700; color: #0f172a;">৳${opChargeNum.toFixed(2)}</td>
                       </tr>`
                    : ''
                }
                ${extraRowsHtml}
              </tbody>
            </table>

            <!-- Ledger Totals -->
            <div class="ledger-summary">
              <div class="ledger-row">
                <span>Subtotal Gross Amount:</span>
                <span style="font-weight: 700; color: #1e293b;">৳${subtotalNum.toLocaleString()}</span>
              </div>
              ${
                discountNum > 0
                  ? `<div class="ledger-row" style="color: #008A3D; font-weight: 600;">
                       <span>Special Hospital Discount:</span>
                       <span>-৳${discountNum.toLocaleString()}</span>
                     </div>`
                  : ''
              }
              <div class="ledger-row grand-total-row">
                <span>Grand Total:</span>
                <span class="grand-total-val">৳${grandTotalNum.toLocaleString()}</span>
              </div>
              <div class="ledger-row" style="padding-top: 3px;">
                <span>Advance Deposit Paid (${admission.paymentMethod || 'Cash'}):</span>
                <span class="paid-val">৳${advanceNum.toLocaleString()}</span>
              </div>
              <div class="ledger-row due-row">
                <span>Outstanding Balance Due:</span>
                <span class="${dueNum > 0 ? 'due-val' : 'paid-val'}">৳${dueNum.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div class="signatures">
            <div>
              <div class="signature-line"></div>
              <p class="signature-title">Billing Officer / Cashier</p>
              <p class="signature-sub">Netro Adhunik Eye Hospital IPD</p>
            </div>
            <div>
              <div class="signature-line"></div>
              <p class="signature-title">Patient / Guardian Signature</p>
              <p class="signature-sub">Acknowledged & Accepted</p>
            </div>
          </div>

          <!-- Disclaimer -->
          <p class="disclaimer">
            This is a computer-generated inpatient billing slip. Retain this slip for all subsequent medical investigations, consultations, and discharge settlements.
          </p>
        </body>
      </html>
    `);
    doc.close();

    // Trigger print once document is ready
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
      {/* Modal Container: Responsive height, flex column, sticky header, internal scroll */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden my-auto">
        
        {/* Screen Header Controls (Sticky Top - Never cut off!) */}
        <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Official Digital Slip
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              {admission.admissionNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print A4 Slip</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-dark hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body on Screen */}
        <div
          ref={printAreaRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 text-dark font-sans space-y-4 sm:space-y-5"
        >
          {/* Hospital Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b-2 border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Netro Adhunik Eye Hospital"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shrink-0 border border-emerald-100 shadow-xs"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                    Netro Adhunik Eye Hospital
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-primary tracking-wide">
                    INPATIENT DEPARTMENT (IPD) ADMISSION & BILLING VOUCHER
                  </p>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
                House 42, Road 11, Banani, Dhaka-1213, Bangladesh
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Emergency Hotline: +880 9610-000999 | IPD Desk: Ext. 402
              </p>
            </div>

            {/* Admission No & Badge */}
            <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
              <div>
                <div className="inline-block bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg mb-1">
                  {admission.admissionNo}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  Date:{' '}
                  {new Date(admission.admissionDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    admission.status === 'Admitted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {admission.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Profile & Inpatient Assignment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs">
            {/* Patient Info */}
            <div className="space-y-1.5 sm:border-r border-slate-200/70 sm:pr-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Patient ID:</span>
                <span className="font-mono font-bold text-primary">
                  {admission.patientUniqueId || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Patient Name:</span>
                <span className="font-bold text-slate-900">{admission.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Age / Gender:</span>
                <span className="font-semibold text-slate-800">
                  {admission.patientAge ? `${admission.patientAge} Yrs` : 'N/A'} /{' '}
                  {admission.patientGender || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Contact Phone:</span>
                <span className="font-semibold text-slate-800">
                  {admission.patientPhone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Guardian:</span>
                <span className="font-semibold text-slate-800">
                  {admission.guardianName
                    ? `${admission.guardianName} (${admission.guardianRelation || 'Relation'})`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Inpatient Stay & Doctor Info */}
            <div className="space-y-1.5 sm:pl-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Assigned Bed:</span>
                <span className="px-2 py-0.5 rounded-md bg-primary text-white font-bold text-[11px]">
                  {admission.bedNumber || 'Bed 1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Room & Ward:</span>
                <span className="font-bold text-slate-900">
                  Room {admission.roomNumber || 'N/A'} ({admission.roomName || 'IPD Cabin'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Per-Day Rate:</span>
                <span className="font-semibold text-slate-800">
                  ৳{parseFloat(String(admission.perDayCharge || 0)).toLocaleString()} / day
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Attending Doctor:</span>
                <span className="font-bold text-slate-900">
                  {admission.doctorName || 'Dr. On Duty'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Department:</span>
                <span className="font-semibold text-slate-700">
                  {admission.department || 'General Medicine'}
                </span>
              </div>
            </div>
          </div>

          {/* Procedure & Diagnosis if any */}
          {(admission.operationName || admission.diagnosis) && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
              {admission.operationName && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Surgical Procedure:</span>
                  <span className="font-semibold text-amber-950">{admission.operationName}</span>
                </div>
              )}
              {admission.diagnosis && (
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Provisional Diagnosis: </span>
                  {admission.diagnosis}
                </div>
              )}
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-primary text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2 sm:py-2.5 px-3 sm:px-4">Charge Description</th>
                  <th className="py-2 sm:py-2.5 px-3 sm:px-4 text-center">Unit / Rate</th>
                  <th className="py-2 sm:py-2.5 px-3 sm:px-4 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-white">
                  <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-slate-800">
                    Inpatient Admission & Registration Fee
                  </td>
                  <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-slate-500">One-time</td>
                  <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900">
                    ৳{parseFloat(String(admission.admissionFee || 0)).toFixed(2)}
                  </td>
                </tr>

                <tr className="bg-slate-50/80">
                  <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-slate-800">
                    Room / Cabin Charge (Day 1)
                  </td>
                  <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-slate-500">1 Day</td>
                  <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900">
                    ৳{parseFloat(String(admission.roomCharge || admission.perDayCharge || 0)).toFixed(2)}
                  </td>
                </tr>

                {parseFloat(String(admission.operationCharge || 0)) > 0 && (
                  <tr className="bg-white">
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-slate-800">
                      Surgical / Procedure Fee ({admission.operationName})
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-slate-500">Procedure</td>
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900">
                      ৳{parseFloat(String(admission.operationCharge)).toFixed(2)}
                    </td>
                  </tr>
                )}

                {extraCharges.map((c, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                  >
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-medium text-slate-700">
                      Extra: {c.key}
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-center text-slate-500">
                      {c.unit || 'Service'}
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900">
                      ৳{parseFloat(String(c.value)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Ledger Summary */}
            <div className="bg-slate-50 p-3.5 sm:p-4 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gross Amount:</span>
                <span className="font-semibold text-slate-800">
                  ৳{parseFloat(String(admission.subtotal || 0)).toLocaleString()}
                </span>
              </div>

              {parseFloat(String(admission.discountAmount || 0)) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Special Hospital Discount:</span>
                  <span className="font-semibold">
                    -৳{parseFloat(String(admission.discountAmount || 0)).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-base sm:text-lg text-primary font-black">
                  ৳{parseFloat(String(admission.grandTotal || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-700 pt-1">
                <span>
                  Advance Deposit Paid ({admission.paymentMethod || 'Cash'}):
                </span>
                <span className="font-bold text-emerald-700">
                  ৳{parseFloat(String(admission.advancePayment || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                <span>Outstanding Balance Due:</span>
                <span
                  className={
                    parseFloat(String(admission.dueAmount || 0)) > 0
                      ? 'text-rose-600 font-black text-sm'
                      : 'text-emerald-600'
                  }
                >
                  ৳{parseFloat(String(admission.dueAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Authorization & Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 sm:pt-8 mt-4 sm:mt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <div className="w-28 sm:w-36 mx-auto border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700">Billing Officer / Cashier</p>
              <p className="text-[10px] text-slate-400">Netro Adhunik Eye Hospital IPD</p>
            </div>
            <div>
              <div className="w-28 sm:w-36 mx-auto border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700">Patient / Guardian Signature</p>
              <p className="text-[10px] text-slate-400">Acknowledged & Accepted</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[9px] sm:text-[10px] text-center text-slate-400 pt-1">
            This is a computer-generated inpatient billing slip. Retain this slip for all
            subsequent medical investigations, consultations, and discharge settlements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionSlipModal;
