import { api } from "../api/api";

// /services/apiService.js
import axios from 'axios'

// Obtener estadísticas de usuarios
export function getEstadisticas() {
  return axios.get('/api/estadisticas')
}

// Verificar si un nombre de usuario está disponible
export function verificarUsuarioDisponible(usuario) {
  return axios.get(`/api/verificar-usuario/${usuario}`)
}

// Registrar un nuevo usuario
export function registrarUsuario(data) {
  return axios.post('/api/registro', data)
}
