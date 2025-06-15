export function procesarEstadisticas(usuariosRaw) {
  return usuariosRaw.map(u => {
    const ganadas = parseInt(u.ganadas, 10)
    const empatadas = parseInt(u.empatadas, 10)
    const perdidas = parseInt(u.perdidas, 10)
    const jugadas = ganadas + empatadas + perdidas
    return {
      nombre: u.usuario,
      partidasGanadas: ganadas,
      partidasEmpatadas: empatadas,
      partidasPerdidas: perdidas,
      partidasJugadas: jugadas,
      promedio: jugadas > 0 ? ganadas / jugadas : 0
    }
  })
}
