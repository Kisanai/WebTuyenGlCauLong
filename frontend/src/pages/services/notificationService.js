import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/notifications`;

export const getNotifications = async (unreadOnly = false) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/`, {
    params: unreadOnly ? { unread: '1' } : undefined,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/${notificationId}/read`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

