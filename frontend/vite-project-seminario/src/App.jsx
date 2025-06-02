import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HeaderComponent from './components/HeaderComponent'
import FooterComponent from './components/FooterComponent'
import NavBarComponent from './components/NavBarComponent'
import './App.css'

function Home() {
  return <h2>Bienvenido a la página principal</h2>
}
function Registro() {
  return <h2>Página de Registro</h2>
}
function Login() {
  return <h2>Página de Login</h2>
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
          <Route path="/register" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          {/* Agrega más rutas según tu proyecto */}
        </Routes>
      </main>
      <FooterComponent />
    </Router>
  )
}

export default App