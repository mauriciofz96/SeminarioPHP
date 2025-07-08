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

// obtener datos de un usuario logeado
export function obtenerUsuario(id, token) {
  return axios.get(`/api/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
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

//Obtener cartas de un mazo
export function getCartasEnMazo(mazo,token) {
  return axios.get(`/api/mazos/${mazo}/cartas`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

// Obtener cartas con filtro por atributo y/o nombre
export function getCartas({ atributo = '', nombre = '' }) {
  const params = new URLSearchParams();
  if (atributo) params.append('atributo', atributo);
  if (nombre) params.append('nombre', nombre);

  return axios.get(`/api/cartas?${params.toString()}`);
}


// Crear un nuevo mazo
export function crearMazo(nombre, cartas, token) {
  return axios.post('/api/mazos', {
    nombre,
    cartas
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function borrarMazo(mazo, token){
  return axios.delete(`/api/mazos/${mazo}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  )
}

//NUEVO

//crear partida
export function crearPartida(mazo_id,token){
  return axios.post(`/api/partidas`,{
    mazo_id
  },{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

//jugada
export function realizarJugada(token,carta_id,partida_id,usuario_id){
  return axios.post(`/api/jugadas`,{
    carta_id,
    partida_id,
    usuario_id,
  },
   { headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

//listar cartas en mano de la partida actual
export function listarCartasEnMano(usuario,partida,token){
  return axios.get(`/api/usuarios/${usuario}/partidas/${partida}/cartas`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

