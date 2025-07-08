import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LogoutPage({ setIsLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
    const confirmLogout = window.confirm('¿Estás seguro que querés cerrar sesión?')
    if (confirmLogout) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      setIsLoggedIn(false) 
      navigate('/')
    } else {
      navigate(-1) // 
    }
  }, [])

  return null // 
}

export default LogoutPage
