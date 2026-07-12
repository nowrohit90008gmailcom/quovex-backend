'use client';
import { useRef, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { HeaderProvider, usePageHeader } from '@/components/layout/HeaderContext';
import HelpModal from '@/components/layout/HelpModal';

function HeaderBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const { searchQuery, setSearchQuery, searchPlaceholder, addNewLabel, onAddNew } = usePageHeader();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#f9f9ff]/90 backdrop-blur-sm border-b border-[#c4c5d5] shadow-sm flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]">search</span>
            <input
              ref={inputRef}
              className="w-full bg-[#f1f3ff] pl-10 pr-4 py-2 rounded-lg border border-[#c4c5d5] focus:border-[#00288e] focus:ring-1 focus:ring-[#00288e] outline-none transition-all text-[14px] text-[#141b2b]"
              placeholder={searchPlaceholder}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#444653] hover:text-[#1e40af] hover:bg-[#e9edff] transition-all"
            onClick={() => setHelpOpen(true)}
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="h-6 w-px bg-[#c4c5d5] mx-2" />
          {addNewLabel && onAddNew && (
            <button
              className="bg-[#00288e] text-white px-4 py-2 rounded-lg text-[14px] leading-[20px] font-semibold hover:bg-[#1e40af] active:scale-95 transition-all flex items-center gap-2 shadow-sm"
              onClick={onAddNew}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              {addNewLabel}
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-[#1e40af] overflow-hidden border-2 border-white ml-2 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </div>
      </header>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeaderProvider>
      <div className="flex min-h-screen bg-[#f9f9ff]">
        <Sidebar />
        <main className="ml-[280px] flex-1 flex flex-col h-full bg-[#f9f9ff] overflow-y-auto">
          <HeaderBar />
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </HeaderProvider>
  );
}
