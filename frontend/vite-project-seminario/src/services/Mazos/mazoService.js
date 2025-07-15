import {api} from "../../api/api.js";

export function borrarMazo(mazo, token){
  return api.delete(`/mazos/${mazo}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  )
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

export function getCartasEnMazo(mazo,token) {
  return api.get(`/mazos/${mazo}/cartas`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export function editarMazo(mazo, nombreNuevo,token){
  return api.put(`/mazos/${mazo}`,{nombre: nombreNuevo}, {
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