// Development: gọi API cùng origin (Vite proxy -> backend :5000), không cần mở cổng 5000 ra LAN
const getApiUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return '';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();
