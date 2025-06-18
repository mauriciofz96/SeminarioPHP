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

// iniciar sesion
export function postLogin(credentials){
  return axios.post('/api/login', credentials)
}

// editar datos de un usuario logeado
export function actualizarUsuario(usuario, datosActualizados, token) {
  return axios.put(`/api/usuarios/${usuario}`, datosActualizados, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
//obetener los mazos de un usuario
export function getMazos(id, token) {
  return axios.get(`/api/usuarios/${id}/mazos`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

//editar nombre de mazo
export function editarMazo(mazo, nombreNuevo,token){
  return axios.put(`/api/mazos/${mazo}`,{nombre: nombreNuevo}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
