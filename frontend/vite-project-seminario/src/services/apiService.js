import { api } from "../api/api";

// /services/apiService.js
import axios from 'axios'

export function getEstadisticas() {
  return axios.get('/api/estadisticas')
}