import { useEffect, useState } from 'react'
import { getEstadisticas } from '../../services/apiService'
import { procesarEstadisticas } from '../../utils/procesarEstadisticas'

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
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400">
      <h2 className="text-3xl font-extrabold text-center text-red-600 mb-6 drop-shadow-lg">Estadísticas de Usuarios</h2>
      <div className="flex justify-center mb-4">
        <button
          className="bg-red-600 hover:bg-yellow-300 hover:text-red-700 text-white font-extrabold py-2 px-6 rounded-xl border-4 border-yellow-400 shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 hover:animate-bounce"
          onClick={() => setOrdenDescendente(!ordenDescendente)}
        >
          Ordenar por {ordenDescendente ? 'peor' : 'mejor'} performance
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-yellow-50 rounded-lg shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-red-700 font-bold">Jugador</th>
              <th className="px-4 py-2 text-red-700 font-bold">Partidas</th>
              <th className="px-4 py-2 text-red-700 font-bold">Ganadas</th>
              <th className="px-4 py-2 text-red-700 font-bold">Perdidas</th>
              <th className="px-4 py-2 text-red-700 font-bold">Empatadas</th>
              <th className="px-4 py-2 text-red-700 font-bold">Promedio Ganadas</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPaginados.map((u, i) => {
              const esMejor = u.nombre === mejorJugador?.nombre
              return (
                <tr
                  key={i}
                  className={esMejor ? 'bg-yellow-200 animate-pulse font-bold' : 'hover:bg-yellow-100'}
                >
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td className="px-4 py-2">{u.partidasJugadas}</td>
                  <td className="px-4 py-2">{u.partidasGanadas}</td>
                  <td className="px-4 py-2">{u.partidasPerdidas}</td>
                  <td className="px-4 py-2">{u.partidasEmpatadas}</td>
                  <td className="px-4 py-2">{u.promedio.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold border-2 border-yellow-400 disabled:opacity-50"
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
        >
          Anterior
        </button>
        <span className="font-bold text-lg">Página {pagina}</span>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold border-2 border-yellow-400 disabled:opacity-50"
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
