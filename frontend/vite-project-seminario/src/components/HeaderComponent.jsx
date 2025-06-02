import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeaderComponent() {
  const navigate = useNavigate();

  return (
    <header style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '1rem', background: '#eee' }}
      onClick={() => navigate('/')}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" style={{ height: 40, marginRight: 16 }} />
      <h1>Mi Página React</h1>
    </header>
  );
}

export default HeaderComponent;