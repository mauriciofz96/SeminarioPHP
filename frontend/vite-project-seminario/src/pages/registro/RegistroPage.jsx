import '../../assets/styles/RegistroPage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validarRegistro } from '../../utils/validaciones'
import { verificarUsuarioDisponible, registrarUsuario } from '../../services/apiService'

function RegistroPage() {
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    password: ''
  })
  const [procesando, setProcesando] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcesando(true)

    const errores = validarRegistro(formData)
    if (errores !== true) {
      navigate('/registro-fallido', { state: { mensaje: errores } })
      setProcesando(false)
      return
    }

    try {
      const respuesta = await verificarUsuarioDisponible(formData.usuario)
      if (!respuesta.data.disponible) {
        navigate('/registro-fallido', {
          state: { mensaje: 'El usuario ya está en uso.' }
        })
        setProcesando(false)
        return
      }

      await registrarUsuario(formData)
      navigate('/registro-exitoso', {
        state: { mensaje: 'Registro exitoso. Ahora podés iniciar sesión.' }
      })
    } catch (error) {
      navigate('/registro-fallido', {
        state: { mensaje: 'Error al registrar. Intente nuevamente más tarde.' }
      })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="registro-main">
      <h2 className="registro-titulo">Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="registro-grupo">
          <label htmlFor="usuario" className="registro-label">Usuario:</label>
          <input
            id="usuario"
            type="text"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            className="registro-input"
          />
        </div>

        <div className="registro-grupo">
          <label htmlFor="nombre" className="registro-label">Nombre público:</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="registro-input"
          />
        </div>

        <div className="registro-grupo">
          <label htmlFor="password" className="registro-label">Contraseña:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="registro-input"
          />
        </div>

        <button
          type="submit"
          disabled={procesando}
          className="registro-boton"
        >
          {procesando ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>
    </main>
  )
}

export default RegistroPage
