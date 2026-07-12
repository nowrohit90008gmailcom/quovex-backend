'use client';
import { useEffect } from 'react';

export default function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-[#c4c5d5] p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[#141b2b]">Help & Shortcuts</h2>
          <button onClick={onClose} className="text-[#757684] hover:text-[#141b2b]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-3 text-[14px] text-[#444653]">
          <div><kbd className="bg-[#f1f3ff] px-2 py-0.5 rounded text-xs font-mono">Esc</kbd> Close this modal</div>
          <div><kbd className="bg-[#f1f3ff] px-2 py-0.5 rounded text-xs font-mono">Ctrl+K</kbd> Focus search</div>
          <hr className="border-[#c4c5d5]" />
          <p className="text-[#757684] text-[13px]">For support, contact your system administrator or email support@studytimer.app</p>
        </div>
      </div>
    </div>
  );
}
