import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthEndpoint = url.startsWith("/auth/");
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authService = {
  register:       (data) => api.post("/auth/register", data),
  verifyOTP:      (data) => api.post("/auth/verify-registration", data),
  login:          (data) => api.post("/auth/login", data),
  verifyLogin:    (data) => api.post("/auth/login/verify", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword:  (data) => api.post("/auth/reset-password", data),
};

export const userService = {
  getProfile:    () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
  getVehicles:   () => api.get("/user/vehicles"),
  addVehicle:    (data) => api.post("/user/vehicles", data),
  deleteVehicle: (id) => api.delete(`/user/vehicles/${id}`),
};

export const appointmentService = {
  list:         () => api.get("/appointments"),
  getServices:  () => api.get("/appointments/services"),
  getAgencies:  () => api.get("/appointments/agencies"),
  create:       (data) => api.post("/appointments", data),
  confirmOTP:   (id, code) => api.post(`/appointments/${id}/confirm-otp`, { code }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel:       (id) => api.delete(`/appointments/${id}`),
};

export const adminService = {
  stats:         () => api.get("/admin/stats"),
  listUsers:     () => api.get("/admin/users"),
  updateUser:    (id, data) => api.patch(`/admin/users/${id}`, data),
  listAgencies:  () => api.get("/admin/agencies"),
  createAgency:  (data) => api.post("/admin/agencies", data),
  updateAgency:  (id, data) => api.patch(`/admin/agencies/${id}`, data),
  deleteAgency:  (id) => api.delete(`/admin/agencies/${id}`),
  listServices:  () => api.get("/admin/services"),
  createService: (data) => api.post("/admin/services", data),
  updateService: (id, data) => api.patch(`/admin/services/${id}`, data),
  deleteUser:    (id) => api.delete(`/admin/users/${id}`),
  listAppointments: () => api.get("/admin/appointments"),
  updateAppointment: (id, data) => api.patch(`/admin/appointments/${id}`, data),
  listVehicles: () => api.get("/admin/vehicles"),
};

export const notificationService = {
  get: () => api.get("/user/notifications"),
  markAllRead: () => api.patch("/user/notifications/read"),
  markRead: (id) => api.patch(`/user/notifications/${id}/read`),
};

export const ocrService = {
  scan: (formData) => api.post("/ocr/scan", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
};

export default api;
