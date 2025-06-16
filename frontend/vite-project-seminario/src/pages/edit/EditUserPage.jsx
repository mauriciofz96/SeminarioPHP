import '../../assets/styles/RegistroPage.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validarEdicionUsuario } from '../../utils/validaciones'
import { actualizarUsuario } from '../../services/apiService'

function EditUserPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    password: '',
    repetirPassword: ''
  })

  const [errores, setErrores] = useState([])
  const [procesando, setProcesando] = useState(false)
  const navigate = useNavigate()

  // Obtenemos info del localStorage
  const id = localStorage.getItem('id')         // usamos el ID en lugar del nombre de usuario
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!id || !token) {
      navigate('/login')
    }
  }, [id, token, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcesando(true)
    setErrores([])

    const erroresValidacion = validarEdicionUsuario(
      formData.nombre,
      formData.password,
      formData.repetirPassword
    )

    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion)
      setProcesando(false)
      return
    }

    try {
      const datos = {
        nombre: formData.nombre,
        password: formData.password
      }

      await actualizarUsuario(id, datos, token)

      navigate('/edicion-exitosa', {
        state: { mensaje: 'Datos actualizados correctamente.' }
      })
    } catch (error) {
      setErrores(['Error al actualizar. Intente nuevamente más tarde.'])
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="registro-main">
      <h2 className="registro-titulo">Editar Usuario</h2>

      {errores.length > 0 && (
        <ul style={{ color: 'red', marginBottom: '16px' }}>
          {errores.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <div className="registro-grupo">
          <label htmlFor="nombre" className="registro-label">Nombre:</label>
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
          <label htmlFor="password" className="registro-label">Nueva Contraseña:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="registro-input"
          />
        </div>

        <div className="registro-grupo">
          <label htmlFor="repetirPassword" className="registro-label">Repetir Contraseña:</label>
          <input
            id="repetirPassword"
            type="password"
            name="repetirPassword"
            value={formData.repetirPassword}
            onChange={handleChange}
            className="registro-input"
          />
        </div>

        <button
          type="submit"
          disabled={procesando}
          className="registro-boton"
        >
          {procesando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </main>
  )
}

export default EditUserPage
