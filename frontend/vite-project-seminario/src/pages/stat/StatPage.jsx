import { useEffect, useState } from 'react'
import { getEstadisticas } from '../../services/apiService'

function StatPage() {
  const [usuarios, setUsuarios] = useState([])
  const [pagina, setPagina] = useState(1)
  const [ordenDescendente, setOrdenDescendente] = useState(true)

  const porPagina = 5

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getEstadisticas()
        console.log('Respuesta completa de la API:', response)  // Log 1

        const body = response.data
        console.log('body (ya es array de usuarios):', body)  // Log 2

        const usuariosRaw = body // <--- corregido acá
        console.log('Datos de usuarios recibidos:', usuariosRaw)  // Log 3

        const dataProcesada = usuariosRaw.map(u => {
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

        console.log('Datos procesados para el estado:', dataProcesada)  // Log 4

        setUsuarios(dataProcesada)
      } catch (error) {
        console.error('Error al obtener estadísticas:', error)
        setUsuarios([])
      }
    }

    fetchStats()
  }, [])

  const usuariosOrdenados = [...usuarios].sort((a, b) =>
    ordenDescendente ? b.promedio - a.promedio : a.promedio - b.promedio
  )

  const mejorJugador = usuariosOrdenados[0]
  const usuariosPaginados = usuariosOrdenados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  )

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Estadísticas de Usuarios</h2>
      <button onClick={() => setOrdenDescendente(!ordenDescendente)}>
        Ordenar por {ordenDescendente ? 'peor' : 'mejor'} performance
      </button>
      <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Partidas</th>
            <th>Ganadas</th>
            <th>Perdidas</th>
            <th>Empatadas</th>
            <th>Promedio Ganadas</th>
          </tr>
        </thead>
        <tbody>
          {usuariosPaginados.map((u, i) => {
            const esMejor = u.nombre === mejorJugador?.nombre
            return (
              <tr key={i} style={{ backgroundColor: esMejor ? '#d4edda' : 'white', fontWeight: esMejor ? 'bold' : 'normal' }}>
                <td>{u.nombre}</td>
                <td>{u.partidasJugadas}</td>
                <td>{u.partidasGanadas}</td>
                <td>{u.partidasPerdidas}</td>
                <td>{u.partidasEmpatadas}</td>
                <td>{u.promedio.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
          Anterior
        </button>
        <span style={{ margin: '0 1rem' }}>Página {pagina}</span>
        <button
          onClick={() => setPagina(p => p + 1)}
          disabled={pagina * porPagina >= usuarios.length}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default StatPage
