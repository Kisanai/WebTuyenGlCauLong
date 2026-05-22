import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const API_URL = `${API_BASE_URL}/auth`;

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};