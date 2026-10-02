import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.listVehicles()
      .then(res => setVehicles(res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter(v =>
    v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase()) ||
    v.owner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Parc Véhicules</h1>
          <p className="text-gray-400 text-sm mt-1">Tous les véhicules enregistrés sur la plateforme</p>
        </div>
        <div className="text-sm text-gray-500 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
          {filtered.length} véhicule(s)
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          placeholder="🔍 Plaque, marque, propriétaire..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-80"
        />
      </div>

      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Plaque</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Marque / Modèle</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Année</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Couleur</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Propriétaire</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Enregistré le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Chargement...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Aucun véhicule trouvé</td></tr>
              )}
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-white bg-[#002C5F]/40 border border-[#002C5F]/50 px-3 py-1 rounded-lg">
                      {v.plateNumber || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{v.brand} {v.model}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{v.year || '—'}</td>
                  <td className="px-6 py-4">
                    {v.color ? (
                      <span className="text-sm text-gray-300">{v.color}</span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#002C5F] flex items-center justify-center text-xs font-bold text-white">
                        {v.owner?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm text-white">{v.owner?.name}</div>
                        <div className="text-xs text-gray-500">{v.owner?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(v.createdAt).toLocaleDateString('fr-FR')}
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
