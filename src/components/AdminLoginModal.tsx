import React, { useState } from 'react';
import { getAdminCredentials } from '../services/storageService';
import { Lock, KeyRound, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = getAdminCredentials();
    if (username.trim() === creds.user && password === creds.pass) {
      setError(null);
      setUsername('');
      setPassword('');
      onSuccess();
    } else {
      setError('Username atau password admin salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-1 rounded-2xl bg-gradient-to-b from-slate-600 via-slate-800 to-[#07101F] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="relative w-full h-full bg-[#0B1325] rounded-[14px] p-6 text-white text-center">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[#FFB703]">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-heading text-lg font-bold tracking-wider mb-1 uppercase">
            LOGIN ADMIN
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Akses kontrol manajemen soal, peserta, dan pengaturan sesi
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#8A5A00] text-slate-950 font-heading font-extrabold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              MASUK PANEL ADMIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
