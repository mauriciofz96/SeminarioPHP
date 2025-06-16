import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HeaderComponent from './components/HeaderComponent'
import FooterComponent from './components/FooterComponent'
import NavBarComponent from './components/NavBarComponent'
import Estadisticas from './pages/stat/StatPage'
import RegistroPage from './pages/registro/RegistroPage'
import RegistroExitoso from './pages/registro/RegistroExitoso'
import RegistroFallido from './pages/registro/RegistroFallido'
import Login from './pages/login/LoginPage';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('Jugador')

  return (
    <Router>
      <HeaderComponent />
      <NavBarComponent isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/register" element={<RegistroPage />} />
          <Route path="/registro-exitoso" element={<RegistroExitoso />} />
          <Route path="/registro-fallido" element={<RegistroFallido />} />
          <Route path="/login" element={
            <Login 
              setIsLoggedIn={setIsLoggedIn} 
              setUserName={setUserName}
              isLoggedIn={isLoggedIn}
            />} />
          {/* Agregá más rutas si es necesario */}
        </Routes>
      </main>
      <FooterComponent />
    </Router>
  )
}

export default App
