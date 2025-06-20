import { useLocation } from 'react-router-dom'

function RegistroFallido() {
  const location = useLocation()
  const mensaje = location.state?.mensaje || 'Hubo un error con el registro.'

  return (
    <div className="max-w-md mx-auto mt-10 bg-red-100 rounded-xl shadow-lg p-8 border-4 border-red-400 text-center">
      <h2 className="text-3xl font-extrabold text-red-700 mb-4 drop-shadow-lg">Error en el registro</h2>
      <p className="text-lg font-semibold">{mensaje}</p>
    </div>
  )
}

export default RegistroFallido
