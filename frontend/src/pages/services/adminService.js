import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/admin`;

export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAllPosts = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
