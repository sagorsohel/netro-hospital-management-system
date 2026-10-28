import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Delete Confirmation',
  itemName,
  message,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-accent flex items-center justify-center ring-8 ring-red-50/50">
            <Trash2 className="h-6 w-6 stroke-[2]" />
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black tracking-tight text-dark">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {message ? (
              message
            ) : (
              <>
                Are you sure you want to delete{' '}
                {itemName ? (
                  <span className="font-bold text-dark">"{itemName}"</span>
                ) : (
                  'this item'
                )}
                ? This action cannot be reversed and all related clinical data will be permanently removed.
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm shadow-accent/30 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
