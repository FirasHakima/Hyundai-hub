import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { appointmentService, userService } from "../../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes, vehiclesRes] = await Promise.all([
          appointmentService.list(),
          userService.getVehicles()
        ]);
        setAppointments(apptsRes.data);
        setVehicles(vehiclesRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter(a => ["pending", "confirmed"].includes(a.status));
  const history = appointments.filter(a => ["done", "cancelled", "rejected"].includes(a.status));
  const mainVehicle = vehicles[0] || null;

  const stats = [
    { label: "Total Rendez-vous", value: appointments.length, delta: "Historique complet", color: "bg-blue-500", up: true },
    { label: "A venir", value: upcoming.length, delta: upcoming[0] ? `Prochain: ${upcoming[0].date}` : "Aucun", color: "bg-orange-500", up: false },
    { label: "Terminés", value: appointments.filter(a => a.status === "done").length, delta: "Services effectués", color: "bg-green-500", up: true },
    { label: "Véhicule", value: mainVehicle ? mainVehicle.model : "Aucun", delta: mainVehicle ? `${mainVehicle.year || ""} - ${mainVehicle.plateNumber}` : "Veuillez en ajouter un", color: "bg-cyan-500", up: false },
  ];

  const statusStyle = {
    confirmed:   "bg-blue-500/10 text-blue-400",
    pending:     "bg-orange-500/10 text-orange-400",
    done:        "bg-green-500/10 text-green-400",
    rejected:    "bg-red-500/10 text-red-400",
    cancelled:   "bg-gray-500/10 text-gray-400",
  };

  const getMonthStr = (dateStr) => {
    const d = new Date(dateStr);
    const months = ["JAN","FEV","MAR","AVR","MAI","JUN","JUI","AOU","SEP","OCT","NOV","DEC"];
    return months[d.getMonth()];
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Bienvenue, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Voici un aperçu de vos services Hyundai</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s,i) => (
          <div key={i} className="bg-[#141417] border border-white/10 rounded-xl p-5">
            <div className={`w-8 h-1 ${s.color} rounded mb-3`} />
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-3xl font-semibold text-white">{s.value}</div>
            <div className="text-xs mt-1 text-gray-500">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming */}
        <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Prochains Rendez-vous</h2>
            <button onClick={() => navigate("/book")} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-all">+ Réserver</button>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm italic">Aucun rendez-vous à venir</div>
            ) : (
              upcoming.slice(0, 3).map((a, i) => (
                <div key={i} className="flex gap-3 items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="bg-[#002C5F] text-white rounded-lg p-2 text-center min-w-[50px]">
                    <div className="text-base font-bold leading-none">{a.date.split("-")[2]}</div>
                    <div className="text-[10px] opacity-80 mt-1">{getMonthStr(a.date)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{a.service?.name}</div>
                    <div className="text-xs text-gray-400">{a.agency?.name} - {a.timeSlot}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${statusStyle[a.status]}`}>{a.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History */}
        <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Historique des services</h2>
            <span className="text-xs text-gray-500">{history.length} entrées</span>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm italic">Aucun historique disponible</div>
          ) : (
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/10" />
              {history.map((h, i) => (
                <div key={i} className="relative mb-4">
                  <div className={`absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#141417] ${h.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="text-xs text-gray-500 mb-0.5">{h.date}</div>
                  <div className="text-sm text-gray-300">{h.service?.name} - {h.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Actions rapides</h2>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate("/book")} className="bg-[#002C5F] hover:bg-[#003875] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
            Prendre un RDV
          </button>
          <button onClick={() => navigate("/appointments")} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm transition-all">
            Mes rendez-vous
          </button>
          <button onClick={() => navigate("/profile")} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm transition-all">
            Mon profil
          </button>
        </div>
      </div>
    </div>
  );
}
