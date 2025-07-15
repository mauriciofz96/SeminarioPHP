import {api} from "../../api/api.js";

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