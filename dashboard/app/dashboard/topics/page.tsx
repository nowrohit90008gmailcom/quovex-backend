'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePageHeader } from '@/components/layout/HeaderContext';
import { apiFetch, cn } from '@/lib/utils';

interface Topic {
  id: string;
  name: string;
  subject: string;
  exam_tag: string | null;
  display_order: number;
  student_count: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = usePageHeader({ searchPlaceholder: 'Search topics...', addNewLabel: null });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', exam_tag: '', display_order: 0 });
  const perPage = 15;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Topic[]>('/admin/topics');
      setTopics(data);
    } catch (e: any) {
      showToast(e.message || 'Backend offline', false);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name || !form.subject) { showToast('Name and subject required', false); return; }
    try {
      await apiFetch('/admin/topics', { method: 'POST', body: JSON.stringify(form) });
      showToast('Topic created');
      setShowCreate(false);
      setForm({ name: '', subject: '', exam_tag: '', display_order: 0 });
      load();
    } catch (e: any) { showToast(e.message, false); }
  };

  const handleUpdate = async (id: string) => {
    try {
      await apiFetch(`/admin/topics/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      showToast('Topic updated');
      setEditId(null);
      setForm({ name: '', subject: '', exam_tag: '', display_order: 0 });
      load();
    } catch (e: any) { showToast(e.message, false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this topic? Student progress will be affected.')) return;
    try {
      await apiFetch(`/admin/topics/${id}`, { method: 'DELETE' });
      showToast('Topic deleted');
      load();
    } catch (e: any) { showToast(e.message, false); }
  };

  const startEdit = (t: Topic) => {
    setEditId(t.id);
    setForm({ name: t.name, subject: t.subject, exam_tag: t.exam_tag || '', display_order: t.display_order });
  };

  const filtered = topics.filter((t) =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-6 max-w-[1280px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#141b2b] md:text-[30px] md:font-bold">Topics</h1>
          <p className="text-[16px] text-[#444653] mt-1">Manage subject topics across the platform</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowCreate(!showCreate); setEditId(null); setForm({ name: '', subject: '', exam_tag: '', display_order: 0 }); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00288e] text-white rounded-lg hover:bg-[#1e40af]">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="text-[14px] font-semibold">New Topic</span>
          </button>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[#444653] hover:bg-[#e9edff]">
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreate || editId) && (
        <div className="bg-white border border-[#c4c5d5] rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[12px] font-medium text-[#444653] mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm w-48" placeholder="Topic name" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#444653] mb-1">Subject</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm w-48" placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#444653] mb-1">Exam Tag</label>
            <input value={form.exam_tag} onChange={(e) => setForm({ ...form, exam_tag: e.target.value })}
              className="px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm w-40" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#444653] mb-1">Display Order</label>
            <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border border-[#c4c5d5] rounded-lg text-sm w-20" />
          </div>
          <button onClick={editId ? () => handleUpdate(editId) : handleCreate}
            className="px-4 py-2 bg-[#00288e] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af]">
            {editId ? 'Update' : 'Create'}
          </button>
          <button onClick={() => { setShowCreate(false); setEditId(null); }}
            className="px-4 py-2 border border-[#c4c5d5] rounded-lg text-sm text-[#444653] hover:bg-[#f8f9ff]">Cancel</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-[40px] text-[#00288e]">progress_activity</span>
        </div>
      ) : (
        <div className="bg-white border border-[#c4c5d5] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f1f3ff] border-b border-[#c4c5d5]">
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Name</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Subject</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Exam Tag</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Order</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Students</th>
                  <th className="py-3 px-4 text-[13px] font-semibold text-[#444653]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c5d5]/50">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-[#757684]">No topics found</td></tr>
                ) : paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f8f9ff]">
                    <td className="py-3 px-4 text-[14px] font-semibold text-[#141b2b]">{t.name}</td>
                    <td className="py-3 px-4 text-[14px] text-[#444653]">{t.subject}</td>
                    <td className="py-3 px-4">
                      {t.exam_tag ? (
                        <span className="px-2 py-1 rounded text-[12px] font-semibold bg-[#e1e8fd] text-[#00288e]">{t.exam_tag}</span>
                      ) : <span className="text-[#757684]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-[14px] font-mono text-[#444653]">{t.display_order}</td>
                    <td className="py-3 px-4 text-[14px] font-semibold text-[#141b2b]">{t.student_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(t)}
                          className="px-3 py-1.5 text-[12px] font-semibold bg-[#e1e8fd] text-[#00288e] rounded-lg hover:bg-[#c9d4fb]">Edit</button>
                        <button onClick={() => handleDelete(t.id)}
                          className="px-3 py-1.5 text-[12px] font-semibold bg-[#ffdad6] text-[#93000a] rounded-lg hover:bg-[#ffc7c1]">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="border-t border-[#c4c5d5] px-4 py-3 flex items-center justify-between">
              <span className="text-[13px] text-[#757684]">{filtered.length} topics</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded border text-[#444653] disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="text-[13px] text-[#757684] self-center">{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1 rounded border text-[#444653] disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className={cn('fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50',
          toast.ok ? 'bg-[#293040] text-[#edf0ff]' : 'bg-[#ffdad6] text-[#93000a]')}>
          <p className="text-[14px]">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-4 p-1"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}
    </div>
  );
}
