import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'rejected', 'done', 'cancelled'];

const statusStyle = {
  confirmed:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  done:       'bg-green-500/10 text-green-400 border-green-500/20',
  rejected:   'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const statusLabel = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  rejected:  'Refusé',
  done:      'Terminé',
  cancelled: 'Annulé',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    setLoading(true);
    adminService.listAppointments()
      .then(res => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  const changeStatus = async (id, status) => {
    setUpdating(id);
    try {
      await adminService.updateAppointment(id, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = appointments.filter(a => {
    const matchSearch =
      a.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.client?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gestion des Rendez-vous</h1>
          <p className="text-gray-400 text-sm mt-1">Contrôlez et mettez à jour tous les rendez-vous</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 bg-[#002C5F] hover:bg-[#003a7a] text-white text-sm px-4 py-2 rounded-xl transition-all">
          ↻ Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          placeholder="🔍 Rechercher client, véhicule..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-72"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>
        <div className="ml-auto text-sm text-gray-500 flex items-center">
          {filtered.length} rendez-vous
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Véhicule</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Service</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Agence</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">Chargement...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">Aucun rendez-vous trouvé</td></tr>
              )}
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{a.client?.name}</div>
                    <div className="text-xs text-gray-500">{a.client?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-mono">{a.vehicle?.plateNumber || '—'}</div>
                    <div className="text-xs text-gray-500">{a.vehicle?.brand} {a.vehicle?.model}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{a.service?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{a.agency?.name || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{a.date}</div>
                    <div className="text-xs text-gray-500">{a.timeSlot}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${statusStyle[a.status]}`}>
                      {statusLabel[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={a.status}
                      disabled={updating === a.id}
                      onChange={e => changeStatus(a.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
