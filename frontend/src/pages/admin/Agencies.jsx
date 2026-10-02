import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' });

  useEffect(() => {
    adminService.listAgencies().then(res => setAgencies(res.data)).catch(() => setAgencies([])).finally(() => setLoading(false));
  }, []);

  const doCreate = async () => {
    const res = await adminService.createAgency(form);
    setAgencies([...agencies, res.data]);
    setShowForm(false);
    setForm({ name: '', address: '', city: '', phone: '' });
  };

  const doDelete = async (id) => {
    if (!confirm('Delete this agency?')) return;
    await adminService.deleteAgency(id);
    setAgencies(agencies.filter(a => a.id !== id));
  };

  const statusStyle = { active: 'bg-green-500/10 text-green-400', maintenance: 'bg-orange-500/10 text-orange-400', closed: 'bg-red-500/10 text-red-400' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Agency Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage Hyundai service centers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">+ Add Agency</button>
      </div>

      {showForm && (
        <div className="bg-[#141417] border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">New Agency</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">City</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={doCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">Create Agency</button>
            <button onClick={() => setShowForm(false)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Location</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading...</td></tr>}
            {!loading && agencies.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No agencies yet</td></tr>}
            {agencies.map(a => (
              <tr key={a.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{a.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.city}  {a.address}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.phone || '-'}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[a.status]}`}>{a.status}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => doDelete(a.id)} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
