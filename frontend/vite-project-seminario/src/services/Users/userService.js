import {api} from "../../api/api.js";

export function verificarUsuarioDisponible(usuario) {
  return api.get(`/verificar-usuario/${usuario}`)
}

export function obtenerUsuario(id, token) {
  return api.get(`/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export function registrarUsuario(data) {
  return api.post('/registro', data)
}


export function postLogin(credentials){
  return api.post('/login', credentials)
}


export function actualizarUsuario(usuario, datosActualizados, token) {
  return api.put(`/usuarios/${usuario}`, datosActualizados, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}