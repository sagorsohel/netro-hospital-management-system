import React, { useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { useUploadShareholderPhotoMutation } from '../../store/api/shareholderApi';

interface Props {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  /** 'portrait' = passport photo, 'card' = ID card (landscape), 'avatar' = small square */
  shape?: 'portrait' | 'card' | 'avatar';
  optional?: boolean;
  hint?: string;
}

const SIZE: Record<NonNullable<Props['shape']>, string> = {
  portrait: 'h-40 w-32',
  card: 'h-28 w-full max-w-[220px]',
  avatar: 'h-20 w-16',
};

/** Click-to-upload image box (Cloudinary via /upload/image). Max 5 MB. */
export const ImageUploadField: React.FC<Props> = ({ label, value, onChange, shape = 'portrait', optional, hint }) => {
  const [upload, { isLoading }] = useUploadShareholderPhotoMutation();
  const [error, setError] = useState('');

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be smaller than 5 MB.');
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', 'netro-hospital/shareholders');
    try {
      setError('');
      const res = await upload(fd).unwrap();
      onChange(res.url);
    } catch (err: any) {
      setError(err?.data?.message || 'Upload failed.');
    }
  };

  return (
    <div className="space-y-1">
      <span className="block text-[11px] font-semibold text-slate-600">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </span>
      <div className={`relative group ${SIZE[shape]}`}>
        <label
          className={`flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
            value ? 'border-transparent' : 'border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          ) : value ? (
            <img src={value} alt={label} className="h-full w-full object-cover rounded-xl" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-slate-400">
              {shape === 'card' ? <ImagePlus className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              <span className="text-[10px] font-medium">Upload</span>
            </span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={isLoading} />
        </label>
        {value && !isLoading && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remove"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-xs text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error ? (
        <span className="block text-[10px] text-rose-600">{error}</span>
      ) : (
        hint && <span className="block text-[10px] text-slate-400">{hint}</span>
      )}
    </div>
  );
};

export default ImageUploadField;
