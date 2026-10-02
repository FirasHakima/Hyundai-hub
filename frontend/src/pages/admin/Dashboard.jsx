import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalAppts: 0, totalUsers: 0, totalAgencies: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.stats(),
      adminService.listAppointments()
    ]).then(([statsRes, apptsRes]) => {
      setStats(statsRes.data);
      setRecent(apptsRes.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Rendez-vous Totaux', value: stats.totalAppts, delta: 'Total plateforme', color: 'bg-blue-500', up: true },
    { label: 'Utilisateurs', value: stats.totalUsers, delta: 'Comptes actifs', color: 'bg-cyan-500', up: true },
    { label: 'Agences Hyundai', value: stats.totalAgencies, delta: 'Couverture nationale', color: 'bg-orange-500', up: false },
    { label: 'Véhicules', value: stats.totalVehicles || 0, delta: 'Enregistrés', color: 'bg-green-500', up: true },
  ];

  const statusStyle = {
    confirmed: 'bg-blue-500/10 text-blue-400',
    pending: 'bg-orange-500/10 text-orange-400',
    done: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
    cancelled: 'bg-gray-500/10 text-gray-400',
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement des données...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Tableau de bord Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Aperçu global de la plateforme Hyundai Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#141417] border border-white/10 rounded-xl p-5">
            <div className={`w-8 h-1 ${c.color} rounded mb-3`} />
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{c.label}</div>
            <div className="text-3xl font-semibold text-white">{c.value}</div>
            <div className={`text-xs mt-1 ${c.up ? 'text-green-400' : 'text-gray-500'}`}>{c.delta}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Activités Récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Service</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Véhicule</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{r.client?.name}</div>
                    <div className="text-xs text-gray-500">{r.client?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{r.service?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{r.vehicle?.plateNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{r.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">Aucun rendez-vous récent</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
