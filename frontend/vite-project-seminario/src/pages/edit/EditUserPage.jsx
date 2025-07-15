import '../../styles/RegistroLoginEdit/RegistroPage.css'
import { obtenerUsuario, actualizarUsuario } from '../../services/Users/userService'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validarEdicionUsuario } from '../../utils/validaciones'

function EditUserPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    password: '',
    repetirPassword: ''
  })
  
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [errores, setErrores] = useState([])
  const [procesando, setProcesando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const navigate = useNavigate()

  const id = localStorage.getItem('id')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!id || !token) {
      navigate('/login')
      return
    }

    const cargarDatos = async () => {
      try {
        const response = await obtenerUsuario(id, token)
        const nombre = response.data.nombre || ''
        setNombreOriginal(nombre)
        setFormData(prev => ({
          ...prev,
          nombre
        }))
      } catch (err) {
        console.error('Error al cargar datos:', err)
      }
    }

    cargarDatos()
  }, [id, token, navigate])

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setProcesando(true)
    setErrores([])
    setMensajeExito('')

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

    // Evitar envío si no se hizo ningún cambio
    if (
      formData.nombre === nombreOriginal &&
      formData.password.trim() === '' &&
      formData.repetirPassword.trim() === ''
    ) {
      setErrores(['No realizaste ningún cambio.'])
      setProcesando(false)
      return
    }

    try {
      const datos = {
        nombre: formData.nombre,
        password: formData.password
      }

      await actualizarUsuario(id, datos, token)

      setMensajeExito('Datos actualizados correctamente.')
    } catch (error) {
      const mensajeDelBackend = error.response?.data?.error
      console.error('Error del backend:', mensajeDelBackend)

      setErrores([
        mensajeDelBackend || 'Error al actualizar. Intente nuevamente más tarde.'
      ])
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="registro-main">
      <h2 className="registro-titulo">Editar Usuario</h2>

      {mensajeExito && (
        <div className="registro-mensaje exito">{mensajeExito}</div>
      )}

      {errores.length > 0 && (
        <ul className="registro-errores">
          {errores.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <div className="registro-grupo">
          <label htmlFor="nombre" className="registro-label">
            Nombre:
          </label>
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
          <label htmlFor="password" className="registro-label">
            Nueva Contraseña:
          </label>
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
          <label htmlFor="repetirPassword" className="registro-label">
            Repetir Contraseña:
          </label>
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
