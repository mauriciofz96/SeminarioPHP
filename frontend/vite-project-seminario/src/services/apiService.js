import {api} from "../api/api.js";

export function getEstadisticas() {
  return api.get('/estadisticas')
}

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

export function getMazos(id, token) {
  return api.get(`/usuarios/${id}/mazos`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


export function editarMazo(mazo, nombreNuevo,token){
  return api.put(`/mazos/${mazo}`,{nombre: nombreNuevo}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}


export function getCartasEnMazo(mazo,token) {
  return api.get(`/mazos/${mazo}/cartas`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}


export function getCartas({ atributo = '', nombre = '' }) {
  const params = new URLSearchParams();
  if (atributo) params.append('atributo', atributo);
  if (nombre) params.append('nombre', nombre);

  return api.get(`/cartas?${params.toString()}`);
}



export function crearMazo(nombre, cartas, token) {
  return api.post('/mazos', {
    nombre,
    cartas
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function borrarMazo(mazo, token){
  return api.delete(`/mazos/${mazo}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  )
}


export function crearPartida(mazo_id,token){
  return api.post(`/partidas`,{
    mazo_id
  },{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}


export function realizarJugada(token,carta_id,partida_id,usuario_id){
  return api.post(`/jugadas`,{
    carta_id,
    partida_id,
    usuario_id,
  },
   { headers: {
      Authorization: `Bearer ${token}`
    }
  })
}


export function listarCartasEnMano(usuario,partida,token){
  return api.get(`/usuarios/${usuario}/partidas/${partida}/cartas`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

