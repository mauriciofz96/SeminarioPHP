import {api} from "../../api/api.js";

export function getEstadisticas() {
  return api.get('/estadisticas')
}