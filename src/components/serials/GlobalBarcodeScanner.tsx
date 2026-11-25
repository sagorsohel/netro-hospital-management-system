import React, { useEffect, useRef, useState } from 'react';
import { ScanBarcode, X } from 'lucide-react';
import { findSerialByBarcode, type DoctorSerial } from '../../store/api/serialApi';
import { DoctorSerialSlipModal } from './DoctorSerialSlipModal';

/**
 * Listens for a hardware barcode scanner on every page.
 * Scanners "type" the code very fast and finish with Enter, so we only react to
 * fast key bursts — normal human typing is ignored.
 * When a serial token (SRL-...) is scanned, its token slip opens.
 */
const MAX_KEY_GAP_MS = 50;
const MIN_LENGTH = 6;

export const GlobalBarcodeScanner: React.FC = () => {
  const buffer = useRef('');
  const lastKeyAt = useRef(0);
  const [serial, setSerial] = useState<DoctorSerial | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const gap = now - lastKeyAt.current;
      lastKeyAt.current = now;

      if (e.key === 'Enter') {
        const code = buffer.current;
        buffer.current = '';
        if (code.length >= MIN_LENGTH && /^SRL-/i.test(code) && gap <= MAX_KEY_GAP_MS * 4) {
          e.preventDefault(); // don't submit whatever form is focused
          const found = findSerialByBarcode(code);
          if (found) {
            setNotFound(null);
            setSerial(found);
          } else {
            setNotFound(code);
          }
        }
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
      buffer.current = gap > MAX_KEY_GAP_MS ? e.key : buffer.current + e.key;
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  useEffect(() => {
    if (!notFound) return;
    const t = setTimeout(() => setNotFound(null), 4000);
    return () => clearTimeout(t);
  }, [notFound]);

  return (
    <>
      <DoctorSerialSlipModal isOpen={!!serial} serial={serial} onClose={() => setSerial(null)} />
      {notFound && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs shadow-lg">
          <ScanBarcode className="h-4 w-4 text-rose-600" />
          <span>
            No serial found for <strong className="font-mono">{notFound}</strong>
          </span>
          <button type="button" onClick={() => setNotFound(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
};

export default GlobalBarcodeScanner;
