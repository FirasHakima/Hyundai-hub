import { useState, useEffect } from "react";
import { appointmentService } from "../../services/api";

const statusStyle = {
  confirmed:  "bg-blue-500/10 text-blue-400",
  pending:    "bg-orange-500/10 text-orange-400",
  done:       "bg-green-500/10 text-green-400",
  rejected:   "bg-red-500/10 text-red-400",
  cancelled:  "bg-gray-500/10 text-gray-400",
};

const statusFR = {
  confirmed:  "Confirme",
  pending:    "En attente",
  done:       "Termine",
  rejected:   "Rejete",
  cancelled:  "Annule",
};

const filters = [
  { key: "all",       label: "Tous" },
  { key: "pending",   label: "En attente" },
  { key: "confirmed", label: "Confirmes" },
  { key: "done",      label: "Termines" },
  { key: "cancelled", label: "Annules" },
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  useEffect(() => {
    appointmentService.list()
      .then(res => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

  const doCancel = async (id) => {
    if (!confirm("Voulez-vous annuler ce rendez-vous ?")) return;
    try {
      await appointmentService.cancel(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l annulation");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Mes Rendez-vous</h1>
        <p className="text-gray-400 text-sm mt-1">Gerez toutes vos reservations de service</p>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.key
                ? "bg-[#002C5F] text-white"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-[#141417] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Service</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Agence</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Date et heure</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Statut</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Chargement...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Aucun rendez-vous trouve</td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{a.service?.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.agency?.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.date} - {a.timeSlot}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusStyle[a.status]}`}>
                    {statusFR[a.status] || a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {["pending","confirmed"].includes(a.status) && (
                    <button onClick={() => doCancel(a.id)}
                      className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all">
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
