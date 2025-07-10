import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LogoutPage({ setIsLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      localStorage.removeItem('id');
      localStorage.removeItem('usuario');
      setIsLoggedIn(false) 
      navigate('/')
  }, [])

  return null;
}

export default LogoutPage
