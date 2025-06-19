import { useLocation } from 'react-router-dom'

function RegistroExitoso() {
  const location = useLocation()
  const mensaje = location.state?.mensaje || 'Registro completado con éxito.'

  return (
    <div className="max-w-md mx-auto mt-10 bg-green-100 rounded-xl shadow-lg p-8 border-4 border-green-400 text-center">
      <h2 className="text-3xl font-extrabold text-green-700 mb-4 drop-shadow-lg">¡Éxito!</h2>
      <p className="text-lg font-semibold">{mensaje}</p>
    </div>
  )
}

export default RegistroExitoso
