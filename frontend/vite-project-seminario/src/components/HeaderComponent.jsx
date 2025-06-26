import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/styles/HeaderComponent.css'

function HeaderComponent() {
  const navigate = useNavigate()

  return (
    <header className="header" onClick={() => navigate('/')}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Pokebola-pokeball-png-0.png" alt="Logo" />
      <h1>Pokebattle</h1>
    </header>
  )
}

export default HeaderComponent
