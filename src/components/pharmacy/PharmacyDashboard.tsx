import React, { useState } from 'react';
import {
  Pill,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Send,
  MessageSquare,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  CalendarClock,
  Building,
  Sparkles,
  Tag,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MedicineStockItem {
  id: string;
  name: string;
  generic: string;
  cartonQty: number;
  packetPerCarton: number;
  piecePerPacket: number;
  totalPieces: number;
  batchNo: string;
  expiryDate: string;
  unitPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Near Expiry';
}

interface PosSaleRecord {
  id: string;
  invoiceNo: string;
  customerName: string;
  phone: string;
  isMember: boolean;
  memberId?: string;
  prescription: boolean;
  itemsCount: number;
  totalAmount: number;
  discount: number;
  date: string;
  status: 'Paid' | 'Due';
}

export const PharmacyDashboard: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);

  // Demo inventory showing multi-unit conversion (Carton -> Packet -> Piece)
  const [stockList] = useState<MedicineStockItem[]>([
    {
      id: 'med-01',
      name: 'Napa Extra 500mg',
      generic: 'Paracetamol + Caffeine',
      cartonQty: 10,
      packetPerCarton: 10,
      piecePerPacket: 10,
      totalPieces: 1000,
      batchNo: 'NP-2026-X1',
      expiryDate: '15 Nov 2026',
      unitPrice: 3.5,
      status: 'Near Expiry',
    },
    {
      id: 'med-02',
      name: 'Seclo 20mg Capsule',
      generic: 'Omeprazole BP',
      cartonQty: 25,
      packetPerCarton: 10,
      piecePerPacket: 10,
      totalPieces: 2500,
      batchNo: 'SEC-8821',
      expiryDate: '20 Dec 2027',
      unitPrice: 6.0,
      status: 'In Stock',
    },
    {
      id: 'med-03',
      name: 'Azithromycin 500mg',
      generic: 'Azithromycin Dihydrate',
      cartonQty: 2,
      packetPerCarton: 10,
      piecePerPacket: 3,
      totalPieces: 60,
      batchNo: 'AZ-1140',
      expiryDate: '10 Feb 2027',
      unitPrice: 35.0,
      status: 'Low Stock',
    },
    {
      id: 'med-04',
      name: 'Monas 10mg Tablet',
      generic: 'Montelukast Sodium',
      cartonQty: 15,
      packetPerCarton: 5,
      piecePerPacket: 10,
      totalPieces: 750,
      batchNo: 'MON-440',
      expiryDate: '18 Aug 2027',
      unitPrice: 17.5,
      status: 'In Stock',
    },
  ]);

  // Demo POS sales history with WhatsApp and SMS features
  const [salesHistory] = useState<PosSaleRecord[]>([
    {
      id: 'inv-101',
      invoiceNo: 'POS-2026-0891',
      customerName: 'MD Mobarok Hossain',
      phone: '+8801712345678',
      isMember: true,
      memberId: 'MEM-772',
      prescription: true,
      itemsCount: 4,
      totalAmount: 1250,
      discount: 125,
      date: 'Today, 02:45 PM',
      status: 'Paid',
    },
    {
      id: 'inv-102',
      invoiceNo: 'POS-2026-0892',
      customerName: 'Nasrin Sultana',
      phone: '+8801819876543',
      isMember: false,
      prescription: true,
      itemsCount: 2,
      totalAmount: 480,
      discount: 0,
      date: 'Today, 03:15 PM',
      status: 'Paid',
    },
    {
      id: 'inv-103',
      invoiceNo: 'POS-2026-0893',
      customerName: 'Tanvir Ahmed',
      phone: '+8801911223344',
      isMember: true,
      memberId: 'MEM-104',
      prescription: false,
      itemsCount: 1,
      totalAmount: 210,
      discount: 21,
      date: 'Today, 04:02 PM',
      status: 'Paid',
    },
  ]);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-hover to-emerald-900 rounded-2xl p-7 text-white shadow-lg shadow-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
            <Pill className="h-3.5 w-3.5 text-cream" />
            <span>Pharmacy Operations & Point of Sale Hub</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Pharmacy Management & POS</h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Multi-unit stock conversion (Carton ➔ Strip ➔ Piece), FEFO expiry tracking, and WhatsApp digital invoicing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-28">
            <div className="text-xs text-emerald-200">Active Branch</div>
            <div className="text-sm font-bold text-white mt-0.5">Main Branch #1</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center min-w-28">
            <div className="text-xs text-emerald-200">Total Medicines</div>
            <div className="text-sm font-bold text-white mt-0.5">1,420 Items</div>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Pharmacy Sales
            </div>
            <div className="text-2xl font-black text-dark mt-1">$48,250</div>
            <div className="text-xs text-primary font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> +12.5% increase (142 invoices)
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Valuation
            </div>
            <div className="text-2xl font-black text-dark mt-1">$8,45,000</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              1,420 Active Branded Medicines
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary">
            <Boxes className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              FEFO Expiry Alerts
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">3 Batches</div>
            <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <CalendarClock className="h-3.5 w-3.5" /> Expiring within 30 days
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low-Stock Alerts
            </div>
            <div className="text-2xl font-black text-red-600 mt-1">8 Items</div>
            <div className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
              Reorder threshold exceeded
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Multi-Unit Stock Breakdown Feature Demo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-primary border border-primary/20 mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Section 3.1 Live Feature Demo</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Multi-Unit Inventory Stock (Carton ➔ Packet/Strip ➔ Piece)
            </h3>
            <p className="text-xs text-slate-500">
              The system automatically tracks carton, strip, and piece units and converts them based on sales in real-time.
            </p>
          </div>
          <Button
            onClick={() => triggerToast('New medicine stock-in window opened')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Stock-In Entry</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Medicine & Generic</th>
                <th className="py-3.5 px-6">Batch & Expiry (FEFO)</th>
                <th className="py-3.5 px-6">Carton Qty</th>
                <th className="py-3.5 px-6">Packets / Strips</th>
                <th className="py-3.5 px-6">Total Pieces (Live Stock)</th>
                <th className="py-3.5 px-6">Unit Price / Piece</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.generic}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-mono text-slate-800">{item.batchNo}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-slate-400" /> {item.expiryDate}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {item.cartonQty} Cartons
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900">
                      {item.cartonQty * item.packetPerCarton} Strips
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({item.packetPerCarton} per carton)
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-black text-sm text-primary">
                      {item.totalPieces.toLocaleString()} Pcs
                    </div>
                    <span className="text-[10px] text-slate-500">
                      (Auto Converted)
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    {item.status === 'In Stock' && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold">
                        In Stock
                      </Badge>
                    )}
                    {item.status === 'Low Stock' && (
                      <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold animate-pulse">
                        Low Stock Alert
                      </Badge>
                    )}
                    {item.status === 'Near Expiry' && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold">
                        FEFO Near Expiry
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counter POS Recent Invoices & Direct WhatsApp/SMS Trigger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-secondary border border-secondary/20 mb-1">
              <Tag className="h-3 w-3" />
              <span>Section 3.2 Counter Billing & Messaging</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Counter POS Sales & Digital Invoice History
            </h3>
            <p className="text-xs text-slate-500">
              Instantly send digital PDF invoices via WhatsApp or SMS bill summaries after each sale.
            </p>
          </div>
          <Button
            onClick={() => setIsQuickSaleOpen(true)}
            className="bg-secondary hover:bg-secondary-hover text-white text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Counter Sale (POS)</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Invoice No</th>
                <th className="py-3.5 px-6">Customer & Phone</th>
                <th className="py-3.5 px-6">Membership</th>
                <th className="py-3.5 px-6">Prescription</th>
                <th className="py-3.5 px-6">Items & Discount</th>
                <th className="py-3.5 px-6">Total Bill</th>
                <th className="py-3.5 px-6 text-center">Digital Delivery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesHistory.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {sale.invoiceNo}
                    <div className="text-[10px] font-normal text-slate-400">{sale.date}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900">{sale.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{sale.phone}</div>
                  </td>
                  <td className="py-4 px-6">
                    {sale.isMember ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {sale.memberId} (10% Discount)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Regular Customer</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {sale.prescription ? (
                      <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        Attached
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">OTC / None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">{sale.itemsCount} Medicines</div>
                    {sale.discount > 0 && (
                      <div className="text-[11px] text-emerald-600 font-medium">
                        -${sale.discount} Discount
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-black text-sm text-slate-900">${sale.totalAmount}</div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          triggerToast(`WhatsApp PDF invoice sent to: ${sale.phone}`)
                        }
                        title="Send PDF Invoice to Customer WhatsApp"
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Send className="h-3.5 w-3.5 text-primary" />
                        <span>WhatsApp PDF</span>
                      </button>
                      <button
                        onClick={() =>
                          triggerToast(`SMS bill summary sent to: ${sale.phone}`)
                        }
                        title="Send SMS Bill Summary"
                        className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-secondary" />
                        <span>SMS</span>
                      </button>
                      <button
                        onClick={() => triggerToast(`Receipt sent to printer: ${sale.invoiceNo}`)}
                        title="Print Thermal Receipt"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Sale Demo Modal */}
      {isQuickSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Pill className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">New POS Counter Sale</h4>
              </div>
              <button
                onClick={() => setIsQuickSaleOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Phone Number</label>
                <input
                  type="text"
                  placeholder="+88017XXXXXXXX"
                  defaultValue="+8801700000000"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Membership ID (Optional - 10% Auto Discount)</label>
                <input
                  type="text"
                  placeholder="e.g. MEM-881"
                  defaultValue="MEM-881"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Medicines</label>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Napa Extra 500mg (2 Strips / 20 Pcs)</span>
                    <span>$70.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Seclo 20mg Capsule (1 Strip / 10 Caps)</span>
                    <span>$60.00</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-primary">
                    <span>Membership Discount (10%)</span>
                    <span>-$13.00</span>
                  </div>
                  <div className="pt-1 flex justify-between font-black text-sm text-slate-900">
                    <span>Grand Total Payable</span>
                    <span>$117.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsQuickSaleOpen(false)}
                className="flex-1 rounded-xl text-xs h-10 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsQuickSaleOpen(false);
                  triggerToast('Sale completed successfully! WhatsApp PDF invoice sent to customer.');
                }}
                className="flex-1 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 cursor-pointer shadow-md shadow-primary/25"
              >
                Complete Sale & Send WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
