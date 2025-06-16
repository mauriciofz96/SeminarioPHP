import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LogoutPage({ setIsLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
    const confirmLogout = window.confirm('¿Estás seguro que querés cerrar sesión?')
    if (confirmLogout) {
      // Limpiás lo que tengas (localStorage, estados, tokens, etc.)
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      setIsLoggedIn(false) // actualizás el estado si es necesario
      navigate('/')
    } else {
      navigate(-1) // volver a la página anterior
    }
  }, [])

  return null // no muestra nada visual, solo se usa para la lógica
}

export default LogoutPage
