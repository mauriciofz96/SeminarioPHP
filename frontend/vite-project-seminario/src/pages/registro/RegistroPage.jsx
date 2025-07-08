import '../../assets/styles/RegistroPage.css'
import { useState } from 'react'
import { validarRegistro } from '../../utils/validaciones'
import { verificarUsuarioDisponible, registrarUsuario } from '../../services/apiService'

function RegistroPage() {
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    password: ''
  })

  const [procesando, setProcesando] = useState(false)

  // Nuevo estado para el mensaje (éxito o error)
  const [mensaje, setMensaje] = useState(null) // null, string de error o string de éxito
  const [tipoMensaje, setTipoMensaje] = useState(null) // 'exito' o 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcesando(true)

    const errores = validarRegistro(formData)
    if (errores !== true) {
      setMensaje(errores)
      setTipoMensaje('error')
      setProcesando(false)
      return
    }

    try {
      const respuesta = await verificarUsuarioDisponible(formData.usuario)
      if (!respuesta.data.disponible) {
        setMensaje('El usuario ya está en uso.')
        setTipoMensaje('error')
        setProcesando(false)
        return
      }

      await registrarUsuario(formData)
      setMensaje('Registro exitoso. Ahora podés iniciar sesión.')
      setTipoMensaje('exito')
    } catch (error) {
      setMensaje('Error al registrar. Intente nuevamente más tarde.')
      setTipoMensaje('error')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="registro-main">
      <h2 className="registro-titulo">Registro de Usuario</h2>

      {/* Mostrar mensaje si existe */}
      {mensaje && (
        <div className={`registro-mensaje ${tipoMensaje === 'exito' ? 'exito' : 'error'}`}>
          <p>{mensaje}</p>
        </div>
      )}

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
