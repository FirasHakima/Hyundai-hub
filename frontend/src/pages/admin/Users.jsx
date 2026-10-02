import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.listUsers().then(res => setUsers(res.data)).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const roleStyle = { USER: 'bg-purple-500/10 text-purple-400', ADMIN: 'bg-orange-500/10 text-orange-400', AGENT: 'bg-cyan-500/10 text-cyan-400' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform users and roles</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          placeholder="🔍 Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-72"
        />
      </div>

      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Verified</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading...</td></tr>}
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {u.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <span className="text-sm font-medium text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${roleStyle[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${u.isVerified ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{u.isVerified ? 'Verified' : 'Pending'}</span></td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => adminService.updateUser(u.id, { role: u.role === 'USER' ? 'AGENT' : 'USER' }).then(() => setUsers(users.map(x => x.id === u.id ? {...x, role: x.role === 'USER' ? 'AGENT' : 'USER'} : x)))}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-all">
                    Changer Rôle
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Supprimer ${u.name} ?`)) adminService.deleteUser(u.id).then(() => setUsers(users.filter(x => x.id !== u.id))); }}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-all">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
