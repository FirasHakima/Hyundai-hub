import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/api';

const statusStyle = {
  confirmed: 'bg-blue-500/10 text-blue-400',
  pending: 'bg-orange-500/10 text-orange-400',
  done: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-gray-500/10 text-gray-400',
};

export default function AgentAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.list().then(res => setAppointments(res.data)).catch(() => setAppointments([])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await appointmentService.updateStatus(id, status);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Appointment Queue</h1>
        <p className="text-gray-400 text-sm mt-1">Review and manage incoming appointments</p>
      </div>

      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Service</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Date & Time</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading...</td></tr>}
            {!loading && appointments.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No appointments</td></tr>}
            {appointments.map(a => (
              <tr key={a.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{a.client?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.service?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.date} · {a.timeSlot}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[a.status]}`}>{a.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {a.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(a.id, 'confirmed')} className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg transition-all">Accept</button>
                        <button onClick={() => updateStatus(a.id, 'rejected')} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all">Reject</button>
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <button onClick={() => updateStatus(a.id, 'done')} className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all">Mark Done</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
