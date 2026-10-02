import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/api";
import hyundaiLogo from "../assets/hyundailogo.png";
import moment from "moment";
import "moment/locale/fr";

moment.locale("fr");

const navConfigs = {
  USER: [
    { path: "/",            label: "Tableau de bord",  icon: "dashboard" },
    { path: "/book",        label: "Prendre RDV",      icon: "calendar" },
    { path: "/appointments",label: "Mes Rendez-vous",  icon: "list" },
    { path: "/profile",     label: "Profil",           icon: "user" },
  ],
  ADMIN: [
    { path: "/",            label: "Tableau de bord",  icon: "dashboard" },
    { path: "/agencies",    label: "Agences",          icon: "building" },
    { path: "/services",    label: "Services",         icon: "settings" },
    { path: "/users",       label: "Utilisateurs",     icon: "users" },
    { path: "/appointments",label: "Rendez-vous",      icon: "list" },
    { path: "/vehicles",    label: "Véhicules",        icon: "car" },
  ],
  AGENT: [
    { path: "/",            label: "Rendez-vous",      icon: "list" },
    { path: "/schedule",    label: "Mon Planning",     icon: "calendar" },
  ],
};

export const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    calendar:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    list:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    user:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    building:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V11h6v10"/></svg>,
    settings:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    users:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    bell:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
    menu:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
    logout:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    sun:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    moon:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    scan:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 4h4V2H3a2 2 0 00-2 2v4h2V4zM17 2v2h4v4h2V4a2 2 0 00-2-2h-4zM3 16H1v4a2 2 0 002 2h4v-2H3v-4zM21 16v4h-4v2h4a2 2 0 002-2v-4h-2z"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>,
    car:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2v-4a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v4a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>,
  };
  return icons[name] || null;
};

export default function Layout({ children }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs]         = useState([]);

  useEffect(() => {
    if (user) {
      notificationService.get().then(res => setNotifs(res.data)).catch(() => {});
    }
  }, [user]);

  const navItems    = navConfigs[user?.role] || navConfigs.USER;
  const initials    = user?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  const photo       = user?.photo;
  const unreadCount = notifs.filter(n => !n.isRead).length;
  const isLight     = theme === "light";

  return (
    <div className={`flex h-screen overflow-hidden ${isLight ? "bg-gray-50 text-gray-900" : "bg-[#0a0a0b] text-white"}`}>
      {/* Sidebar */}
      <div className={`${collapsed ? "w-16" : "w-64"} min-w-0 flex flex-col transition-all duration-300 ease-in-out border-r ${isLight ? "bg-white border-gray-200" : "bg-[#0d0d10] border-white/[0.06]"}`}>
        <div className={`flex items-center border-b ${isLight ? "border-gray-200" : "border-white/[0.06]"} ${collapsed ? "p-4 justify-center" : "px-5 py-4"}`}>
          {collapsed ? (
            <div className="w-8 h-8 bg-[#002C5F] rounded-lg flex items-center justify-center p-1">
              <img src={hyundaiLogo} alt="H" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img src={hyundaiLogo} alt="Hyundai" className="h-7 object-contain" />
              <span className={`text-xs ${isLight ? "text-gray-400" : "text-gray-500"}`}>Service Hub</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-4 pt-3 pb-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded-md inline-block ${
              user?.role === "ADMIN" ? "bg-orange-500/10 text-orange-500" :
              user?.role === "AGENT" ? "bg-cyan-500/10 text-cyan-500" :
              "bg-blue-500/10 text-blue-500"
            }`}>{user?.role}</span>
          </div>
        )}

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {!collapsed && <div className={`text-xs font-semibold uppercase tracking-widest px-3 py-2 ${isLight ? "text-gray-400" : "text-gray-600"}`}>Navigation</div>}
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive ? "bg-[#002C5F] text-white" :
                  isLight  ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900" :
                             "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
                } ${collapsed ? "justify-center" : ""}`}>
                <span className={`flex-shrink-0 ${isActive ? "text-white" : isLight ? "text-gray-400" : "text-gray-500"}`}>
                  <Icon name={item.icon} size={17} />
                </span>
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`p-3 border-t ${isLight ? "border-gray-200" : "border-white/[0.06]"}`}>
          {collapsed ? (
            <button onClick={logout} className={`w-full flex justify-center p-2 transition-colors ${isLight ? "text-gray-400 hover:text-red-500" : "text-gray-500 hover:text-red-400"}`}>
              <Icon name="logout" size={18} />
            </button>
          ) : (
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/[0.03] border-white/[0.05]"}`}>
              <div className="w-8 h-8 rounded-full bg-[#002C5F] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${isLight ? "text-gray-900" : "text-white"}`}>{user?.name}</div>
                <div className={`text-xs truncate ${isLight ? "text-gray-400" : "text-gray-500"}`}>{user?.email}</div>
              </div>
              <button onClick={logout} className={`transition-colors flex-shrink-0 ${isLight ? "text-gray-400 hover:text-red-500" : "text-gray-600 hover:text-red-400"}`}>
                <Icon name="logout" size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`h-14 border-b flex items-center px-6 gap-3 ${isLight ? "bg-white border-gray-200" : "bg-[#0a0a0b] border-white/[0.06]"}`}>
          <button onClick={() => setCollapsed(!collapsed)} className={`p-1.5 rounded-lg transition-all ${isLight ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
            <Icon name="menu" size={18} />
          </button>
          <div className="flex-1" />

          <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${isLight ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
            <Icon name={isLight ? "moon" : "sun"} size={18} />
          </button>

          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className={`relative p-2 rounded-lg transition-all ${isLight ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
              <Icon name="bell" size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden ${isLight ? "bg-white border-gray-200" : "bg-[#141417] border-white/10"}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? "border-gray-100" : "border-white/10"}`}>
                  <span className={`text-sm font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>Notifications</span>
                  <button onClick={() => {
                    notificationService.markAllRead();
                    setNotifs(notifs.map(n => ({...n, isRead: true})));
                  }} className="text-xs text-blue-500 hover:text-blue-400">Tout marquer lu</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className={`p-6 text-center text-sm ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                      Aucune notification.
                    </div>
                  ) : (
                    notifs.map(n => (
                      <div key={n.id} onClick={() => {
                        if (!n.isRead) {
                          notificationService.markRead(n.id);
                          setNotifs(notifs.map(x => x.id === n.id ? {...x, isRead: true} : x));
                        }
                        if (n.link) {
                          navigate(n.link);
                          setShowNotifs(false);
                        }
                      }}
                        className={`px-4 py-3 flex gap-3 items-start cursor-pointer border-b ${isLight ? "border-gray-50 hover:bg-gray-50" : "border-white/5 hover:bg-white/5"} ${!n.isRead ? isLight ? "bg-blue-50" : "bg-blue-500/5" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-blue-500" : isLight ? "bg-gray-300" : "bg-gray-600"}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium ${isLight ? "text-gray-900" : "text-white"}`}>{n.title}</div>
                          <div className={`text-xs mt-0.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}>{n.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{moment(n.createdAt).fromNow()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className={`px-4 py-2 border-t ${isLight ? "border-gray-100" : "border-white/10"}`}>
                  <button onClick={() => setShowNotifs(false)} className="text-xs text-center w-full text-gray-500 hover:text-gray-400">Fermer</button>
                </div>
              </div>
            )}
          </div>

          <div onClick={() => navigate("/profile")} className="w-8 h-8 rounded-full bg-[#002C5F] flex items-center justify-center text-xs font-bold text-white cursor-pointer overflow-hidden">
            {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${isLight ? "bg-gray-50" : "bg-[#0a0a0b]"}`}>
          <div className="p-8">{children}</div>
        </div>
      </div>

      {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
    </div>
  );
}
