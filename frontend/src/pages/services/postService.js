import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/posts`;

export const getAllPosts = async () => {
  const response = await axios.get(`${API_URL}/`);
  return response.data;
};

export const createPost = async (postData) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(`${API_URL}/`, postData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

export const updatePost = async (postId, postData) => {
  const token = localStorage.getItem('token');

  const response = await axios.put(`${API_URL}/${postId}`, postData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

export const getMyPosts = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/my-posts`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};