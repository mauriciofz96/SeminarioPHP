import React from 'react'
import { Link } from 'react-router-dom'



function NavBarComponent({ isLoggedIn, userName }) {
  const linkClass = "bg-red-600 hover:bg-yellow-300 hover:text-red-700 text-white font-extrabold py-2 px-4 rounded-xl border-4 border-yellow-400 shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 mx-1 animate-bounce"
  return (
    <nav className="flex justify-between items-center py-4 px-8">
      <div className="flex gap-2">
        {!isLoggedIn ? (
          <>
            <Link to="/register" className={linkClass}>Registro de usuario</Link>
            <Link to="/login" className={linkClass}>Login</Link>
          </>
        ) : (
          <>
            <span className="text-lg font-bold text-black-800 mx-2">¡Hola, {userName}!</span>
            <Link to="/mis-mazos" className={linkClass}>Mis mazos</Link>
            <Link to="/crear-mazo" className={linkClass}>Crear mazo</Link>
            <Link to="/editar-usuario" className={linkClass}>Editar usuario</Link>
            <Link to="/logout" className={linkClass}>Logout</Link>
          </>
        )}
      </div>
      <div>
        <Link to="/estadisticas" className={linkClass}>Estadísticas</Link>
      </div>
    </nav>
  );
}

export default NavBarComponent;
