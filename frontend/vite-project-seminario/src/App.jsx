import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HeaderComponent from './components/HeaderComponent'
import FooterComponent from './components/FooterComponent'
import NavBarComponent from './components/NavBarComponent'
import Estadisticas from './pages/stat/StatPage'
import RegistroPage from './pages/registro/RegistroPage'
import Login from './pages/login/LoginPage'
import LogoutPage from './pages/logout/LogoutPage'
import EditUserPage from './pages/edit/EditUserPage'
import MazosPage from './pages/mazos/MazosPage'
import CrearMazoPage from './pages/mazos/CrearMazoPage';
import PartidaPage from './pages/partida/PartidaPage'

import './App.css'

function Home() {
  return (
    <div>
      <h2>Bienvenido a la página principal</h2>
      <Estadisticas />
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userName, setUserName] = useState(localStorage.getItem('nombre') || 'Jugador')

  return (
    <Router>
      <HeaderComponent />
      <NavBarComponent isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/register" element={<RegistroPage />} />

          {/* Evitar acceso a /login si ya está logueado */}
          <Route
            path="/login"
            element={
              isLoggedIn
                ? <Navigate to="/" replace />
                : <Login setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} isLoggedIn={isLoggedIn} />
            }
          />

          <Route path="/logout" element={<LogoutPage setIsLoggedIn={setIsLoggedIn} />} />

          {/* Ruta protegida: solo visible si está logueado */}
          <Route
            path="/editar-usuario"
            element={
              isLoggedIn
                ? <EditUserPage />
                : <Navigate to="/login" replace />
            }
          />

          <Route 
          path="/mis-mazos" element={
            isLoggedIn
              ? <MazosPage />
              : <Navigate to="/login" replace />
          }/>

          <Route 
            path="/crear-mazo" 
            element={
              isLoggedIn
                ? <CrearMazoPage />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/partida"
            element={
              isLoggedIn
              ? <PartidaPage />
              : <Navigate to="/login" replace/>
            }
          />
        </Routes>
      </main>
      <FooterComponent />
    </Router>
  )
}

export default App
