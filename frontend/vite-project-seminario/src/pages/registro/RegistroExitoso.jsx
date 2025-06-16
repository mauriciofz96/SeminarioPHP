import { useLocation } from 'react-router-dom'
import '../../assets/styles/RegistroPage.css'

function RegistroExitoso() {
  const location = useLocation()
  const mensaje = location.state?.mensaje || 'Registro completado con éxito.'

  return (
    <div>
      <h2>¡Éxito!</h2>
      <p>{mensaje}</p>
    </div>
  )
}

export default RegistroExitoso
