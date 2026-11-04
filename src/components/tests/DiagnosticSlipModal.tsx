import React, { useRef } from 'react';
import {
  Printer,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import type { DiagnosticInvoice } from '../../store/api/diagnosticInvoiceApi';

interface DiagnosticSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: DiagnosticInvoice | null;
}

export const DiagnosticSlipModal: React.FC<DiagnosticSlipModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const handlePrint = () => {
    if (!invoice) return;

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

    const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const grandTotalNum = parseFloat(String(invoice.grandTotal || 0));
    const paidNum = parseFloat(String(invoice.paidAmount || 0));
    const dueNum = parseFloat(String(invoice.dueAmount || 0));
    const discountNum = parseFloat(String(invoice.discountAmount || 0));
    const subtotalNum = parseFloat(String(invoice.subtotal || 0));

    const itemRowsHtml = items
      .map(
        (t, idx) => `
        <tr style="${idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
          <td style="padding: 7px 10px; font-weight: 700; color: #475569; border-bottom: 1px solid #f1f5f9; text-align: center;">
            ${idx + 1}
          </td>
          <td style="padding: 7px 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
            ${t.testName}
            ${t.roomNumber ? `<span style="font-size: 9.5px; color: #64748b; display: block;">Room: ${t.roomNumber}</span>` : ''}
          </td>
          <td style="padding: 7px 10px; color: #64748b; border-bottom: 1px solid #f1f5f9;">
            ${t.category || 'Pathology'}
          </td>
          <td style="padding: 7px 10px; text-align: center; color: #64748b; border-bottom: 1px solid #f1f5f9;">
            ${t.deliveryDate || invoice.deliveryDate || 'Tomorrow'}
          </td>
          <td style="padding: 7px 12px; text-align: right; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
            ৳${parseFloat(String(t.price)).toFixed(2)}
          </td>
        </tr>`
      )
      .join('');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Diagnostic Slip - ${invoice.invoiceNo}</title>
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
              gap: 10px;
            }
            .brand-icon {
              width: 38px;
              height: 38px;
              background-color: #008A3D;
              color: #ffffff;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 18px;
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
              padding: 7px 10px;
              text-align: left;
            }
            td {
              padding: 6px 10px;
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
              margin-top: 24px;
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
                <div class="brand-icon">🔬</div>
                <div>
                  <h1 class="hospital-title">NETRO CENTRAL HOSPITAL</h1>
                  <p class="hospital-subtitle">PATHOLOGY & DIAGNOSTIC INVESTIGATION INVOICE</p>
                </div>
              </div>
              <p class="address-info">House 42, Road 11, Banani, Dhaka-1213, Bangladesh</p>
              <p class="address-info">Diagnostics Hotline: +880 9610-000999 | Sample Lab: Ext. 302</p>
            </div>
            <div class="voucher-badge">
              <div class="badge-no">${invoice.invoiceNo}</div>
              <p style="font-size: 10px; color: #64748b;">Date: ${formattedDate}</p>
              <div><span class="badge-status">✓ ${invoice.sampleStatus.toUpperCase()}</span></div>
            </div>
          </div>

          <!-- Patient & Doctor Grid -->
          <div class="grid-info">
            <div class="info-col">
              <div class="info-row">
                <span class="info-label">Patient ID:</span>
                <span class="info-val patient-id">${invoice.patientUniqueId || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Patient Name:</span>
                <span class="info-val">${invoice.patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Age / Gender:</span>
                <span class="info-val">${invoice.patientAge ? `${invoice.patientAge} Yrs` : 'N/A'} / ${invoice.patientGender || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Contact Phone:</span>
                <span class="info-val">${invoice.patientPhone || 'N/A'}</span>
              </div>
            </div>

            <div class="info-col" style="padding-left: 12px;">
              <div class="info-row">
                <span class="info-label">Ref. Physician:</span>
                <span class="info-val">${invoice.doctorName || 'Dr. Medical Officer'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expected Delivery:</span>
                <span class="info-val" style="color: #008A3D;">${invoice.deliveryDate || 'Tomorrow'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Tests:</span>
                <span class="info-val">${items.length} Test(s)</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-val" style="color: ${dueNum > 0 ? '#e11d48' : '#166534'};">${invoice.paymentStatus}</span>
              </div>
            </div>
          </div>

          <!-- Test Items Table -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 35px; text-align: center;">#</th>
                  <th>Diagnostic Test Description</th>
                  <th>Category</th>
                  <th style="text-align: center;">Delivery</th>
                  <th style="text-align: right;">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
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
                       <span>Special Diagnostic Discount:</span>
                       <span>-৳${discountNum.toLocaleString()}</span>
                     </div>`
                  : ''
              }
              <div class="ledger-row grand-total-row">
                <span>Grand Total:</span>
                <span class="grand-total-val">৳${grandTotalNum.toLocaleString()}</span>
              </div>
              <div class="ledger-row" style="padding-top: 3px;">
                <span>Paid Amount (${invoice.paymentMethod || 'Cash'}):</span>
                <span class="paid-val">৳${paidNum.toLocaleString()}</span>
              </div>
              <div class="ledger-row due-row">
                <span>Remaining Balance Due:</span>
                <span class="${dueNum > 0 ? 'due-val' : 'paid-val'}">৳${dueNum.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div class="signatures">
            <div>
              <div class="signature-line"></div>
              <p class="signature-title">Medical Technologist / Cashier</p>
              <p class="signature-sub">Netro Pathology Laboratory</p>
            </div>
            <div>
              <div class="signature-line"></div>
              <p class="signature-title">Patient / Attendant Signature</p>
              <p class="signature-sub">Verified & Received</p>
            </div>
          </div>

          <!-- Disclaimer -->
          <p class="disclaimer">
            Please bring this receipt for collecting test reports. For emergency inquiries or report status, contact +880 9610-000999.
          </p>
        </body>
      </html>
    `);
    doc.close();

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
        
        {/* Screen Header Controls (Sticky Top) */}
        <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              Diagnostic Lab Slip
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              {invoice.invoiceNo}
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
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shrink-0">
                  <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                    NETRO CENTRAL HOSPITAL
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-primary tracking-wide">
                    PATHOLOGY & DIAGNOSTIC INVESTIGATION INVOICE
                  </p>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
                House 42, Road 11, Banani, Dhaka-1213, Bangladesh
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Diagnostics Hotline: +880 9610-000999 | Sample Lab: Ext. 302
              </p>
            </div>

            {/* Invoice No & Badge */}
            <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
              <div>
                <div className="inline-block bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg mb-1">
                  {invoice.invoiceNo}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  Date:{' '}
                  {new Date(invoice.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  {invoice.sampleStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Profile & Doctor Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs">
            {/* Patient Info */}
            <div className="space-y-1.5 sm:border-r border-slate-200/70 sm:pr-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Patient ID:</span>
                <span className="font-mono font-bold text-primary">
                  {invoice.patientUniqueId || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Patient Name:</span>
                <span className="font-bold text-slate-900">{invoice.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Age / Gender:</span>
                <span className="font-semibold text-slate-800">
                  {invoice.patientAge ? `${invoice.patientAge} Yrs` : 'N/A'} /{' '}
                  {invoice.patientGender || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Contact Phone:</span>
                <span className="font-semibold text-slate-800">
                  {invoice.patientPhone || 'N/A'}
                </span>
              </div>
            </div>

            {/* Doctor & Delivery Info */}
            <div className="space-y-1.5 sm:pl-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Ref. Physician:</span>
                <span className="font-bold text-slate-900">
                  {invoice.doctorName || 'Dr. Medical Officer'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Expected Delivery:</span>
                <span className="font-bold text-primary">
                  {invoice.deliveryDate || 'Tomorrow'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Tests Count:</span>
                <span className="font-semibold text-slate-800">
                  {items.length} Test(s) Ordered
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span
                  className={`font-bold ${
                    parseFloat(String(invoice.dueAmount || 0)) > 0
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Test Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-primary text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2 sm:py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2 sm:py-2.5 px-3 sm:px-4">Test Description</th>
                  <th className="py-2 sm:py-2.5 px-3">Category</th>
                  <th className="py-2 sm:py-2.5 px-3 text-center">Delivery</th>
                  <th className="py-2 sm:py-2.5 px-3 sm:px-4 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((t, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                  >
                    <td className="py-2 sm:py-2.5 px-3 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-slate-900">
                      {t.testName}
                      {t.roomNumber && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Room: {t.roomNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 text-slate-500">
                      {t.category || 'Pathology'}
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 text-center text-slate-500">
                      {t.deliveryDate || invoice.deliveryDate || 'Tomorrow'}
                    </td>
                    <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-right font-bold text-slate-900">
                      ৳{parseFloat(String(t.price)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Ledger Summary */}
            <div className="bg-slate-50 p-3.5 sm:p-4 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gross:</span>
                <span className="font-semibold text-slate-800">
                  ৳{parseFloat(String(invoice.subtotal || 0)).toLocaleString()}
                </span>
              </div>

              {parseFloat(String(invoice.discountAmount || 0)) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Special Diagnostic Discount:</span>
                  <span className="font-semibold">
                    -৳{parseFloat(String(invoice.discountAmount || 0)).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-base sm:text-lg text-primary font-black">
                  ৳{parseFloat(String(invoice.grandTotal || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-700 pt-1">
                <span>
                  Paid Amount ({invoice.paymentMethod || 'Cash'}):
                </span>
                <span className="font-bold text-emerald-700">
                  ৳{parseFloat(String(invoice.paidAmount || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                <span>Remaining Balance Due:</span>
                <span
                  className={
                    parseFloat(String(invoice.dueAmount || 0)) > 0
                      ? 'text-rose-600 font-black text-sm'
                      : 'text-emerald-600'
                  }
                >
                  ৳{parseFloat(String(invoice.dueAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Authorization & Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 sm:pt-8 mt-4 sm:mt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <div className="w-28 sm:w-36 mx-auto border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700">Medical Technologist / Cashier</p>
              <p className="text-[10px] text-slate-400">Netro Central Hospital Lab</p>
            </div>
            <div>
              <div className="w-28 sm:w-36 mx-auto border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700">Patient / Attendant Signature</p>
              <p className="text-[10px] text-slate-400">Verified & Received</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[9px] sm:text-[10px] text-center text-slate-400 pt-1">
            Please bring this receipt for collecting diagnostic test reports. For emergency inquiries or report status, contact +880 9610-000999.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticSlipModal;
