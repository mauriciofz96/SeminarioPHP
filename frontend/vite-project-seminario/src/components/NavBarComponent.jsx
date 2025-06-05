import React from 'react';
import { Link } from 'react-router-dom';

function NavBarComponent({ isLoggedIn, userName }) {
  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#ddd' }}>
      {!isLoggedIn ? (
        <>
          <Link to="/register">Registro de usuario</Link>
          <Link to="/login">Login</Link>
        </>
      ) : (
        <>
          <span>Hola –{userName}–</span>
          <Link to="/mis-mazos">Mis mazos</Link>
          <Link to="/editar-usuario">Editar usuario</Link>
          <Link to="/logout">Logout</Link>
        </>
      )}
      <Link to="/estadisticas">Estadísticas</Link>
    </nav>
  );
}

export default NavBarComponent;