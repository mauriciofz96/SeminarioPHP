import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/styles/HeaderComponent.css'

function HeaderComponent() {
  const navigate = useNavigate()

  return (
    <header className="header" onClick={() => navigate('/')}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" />
      <h1>Mi Página React</h1>
    </header>
  )
}

export default HeaderComponent
