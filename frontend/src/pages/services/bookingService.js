import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/bookings`;

export const requestBooking = async ({ postId, requestedSlots }) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/request`,
    { postId, requestedSlots },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const approveBooking = async (bookingId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/${bookingId}/approve`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const rejectBooking = async (bookingId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/${bookingId}/reject`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getMyBookings = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/my-bookings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/${bookingId}/cancel`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

