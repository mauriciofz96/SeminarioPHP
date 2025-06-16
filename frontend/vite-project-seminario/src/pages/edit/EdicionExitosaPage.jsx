import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function EdicionExitosaPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  const mensaje = location.state?.mensaje || 'Datos actualizados exitosamente.'

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>✅ Edición exitosa</h2>
      <p>{mensaje}</p>
      <p>Serás redirigido al inicio en unos segundos...</p>
    </main>
  )
}

export default EdicionExitosaPage
