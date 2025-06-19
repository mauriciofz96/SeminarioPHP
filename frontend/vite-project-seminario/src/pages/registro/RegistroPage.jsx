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
    <main className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-4 border-yellow-400">
      <h2 className="text-3xl font-extrabold text-center text-red-600 mb-4 drop-shadow-lg">Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="usuario" className="block text-lg font-bold text-gray-700 mb-1">Usuario:</label>
          <input
            id="usuario"
            type="text"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="nombre" className="block text-lg font-bold text-gray-700 mb-1">Nombre público:</label>
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
          <label htmlFor="password" className="block text-lg font-bold text-gray-700 mb-1">Contraseña:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={procesando}
          className="bg-red-600 hover:bg-yellow-300 hover:text-red-700 text-white font-extrabold py-2 px-6 rounded-xl border-4 border-yellow-400 shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 hover:animate-bounce mt-2"
        >
          {procesando ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>
    </main>
  )
}

export default RegistroPage
