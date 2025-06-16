import { useLocation } from 'react-router-dom'
import '../../assets/styles/RegistroPage.css'

function RegistroFallido() {
  const location = useLocation()
  const mensaje = location.state?.mensaje || 'Hubo un error con el registro.'

  return (
    <div>
      <h2>Error en el registro</h2>
      <p>{mensaje}</p>
    </div>
  )
}

export default RegistroFallido
