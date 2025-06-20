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

  const id = localStorage.getItem('id')
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
    <main className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-4 border-yellow-400">
      <h2 className="text-3xl font-extrabold text-center text-red-600 mb-4 drop-shadow-lg">Editar Usuario</h2>

      {errores.length > 0 && (
        <ul className="text-red-600 font-semibold mb-4 list-disc list-inside">
          {errores.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="nombre" className="block text-lg font-bold text-gray-700 mb-1">Nombre:</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-lg font-bold text-gray-700 mb-1">Nueva Contraseña:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="repetirPassword" className="block text-lg font-bold text-gray-700 mb-1">Repetir Contraseña:</label>
          <input
            id="repetirPassword"
            type="password"
            name="repetirPassword"
            value={formData.repetirPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={procesando}
          className="bg-red-600 hover:bg-yellow-300 hover:text-red-700 text-white font-extrabold py-2 px-6 rounded-xl border-4 border-yellow-400 shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 mt-2"
        >
          {procesando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </main>
  )
}

export default EditUserPage
