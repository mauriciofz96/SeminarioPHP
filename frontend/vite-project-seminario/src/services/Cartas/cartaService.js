import {api} from "../../api/api.js";

export function getCartas({ atributo = '', nombre = '' }) {
  const params = new URLSearchParams();
  if (atributo) params.append('atributo', atributo);
  if (nombre) params.append('nombre', nombre);

  return api.get(`/cartas?${params.toString()}`);
}