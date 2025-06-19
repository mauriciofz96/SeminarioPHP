import React from 'react'
import { Link } from 'react-router-dom'
import '../assets/styles/NavBarComponent.css' 



function NavBarComponent({ isLoggedIn, userName }) {
  return (
    <nav className="navbar">
      {!isLoggedIn ? (
        <>
          <Link to="/register">Registro de usuario</Link>
          <Link to="/login">Login</Link>
        </>
      ) : (
        <>
          <span>Hola –{userName}–</span>
          <Link to="/mis-mazos">Mis mazos</Link>
          <Link to="/crear-mazo">Crear mazo</Link>
          <Link to="/editar-usuario">Editar usuario</Link>
          <Link to="/logout">Logout</Link>
        </>
      )}
      <Link to="/estadisticas">Estadísticas</Link>
    </nav>
  );
}

export default NavBarComponent;