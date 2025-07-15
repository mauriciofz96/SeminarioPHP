import { useEffect, useState } from 'react'
import { getEstadisticas } from '../../services/Stats/statService'
import { procesarEstadisticas } from '../../utils/procesarEstadisticas'
import '../../styles/Stats/StatPage.css'

function StatPage() {
  const [usuarios, setUsuarios] = useState([])
  const [pagina, setPagina] = useState(1)
  const [ordenDescendente, setOrdenDescendente] = useState(true)

  const porPagina = 5

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getEstadisticas()
        const body = response.data

        const dataProcesada = procesarEstadisticas(body)
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
    <div className="stats-container">
      <h2 className="stats-titulo">Estadísticas de Usuarios</h2>
      <button
        className="stats-boton-orden"
        onClick={() => setOrdenDescendente(!ordenDescendente)}
      >
        Ordenar por {ordenDescendente ? 'peor' : 'mejor'} performance
      </button>
      <table className="stats-tabla">
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
              <tr
                key={i}
                className={esMejor ? 'stats-fila-mejor' : ''}
              >
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
      <div className="stats-controles">
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
          Anterior
        </button>
        <span>Página {pagina}</span>
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
