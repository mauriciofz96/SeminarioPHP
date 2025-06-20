import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { postLogin } from "../../services/apiService";

function LoginPage({ setIsLoggedIn, setUserName, isLoggedIn }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      alert('Ya estás logueado');
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoggedIn === true) {
        throw new Error('Ya estás logueado');
      }
      const response = await postLogin({ usuario, password });
      const data = response.data;
      if (!data.token || !data.nombre) {
        throw new Error('Credenciales incorrectas');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('usuario', usuario);
      localStorage.setItem('id', data.id);
      setIsLoggedIn(true);
      setUserName(data.nombre);
      alert('Login exitoso');
    } catch (error) {
      setError('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 border-4 border-yellow-400"
    >
      <h2 className="text-3xl font-extrabold text-center text-red-600 mb-4 drop-shadow-lg">Iniciar Sesión</h2>
      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">Usuario:</label>
        <input
          type="text"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          required
          className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
        />
      </div>
      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold"
        />
      </div>
      <button
        type="submit"
        className="bg-red-600 hover:bg-yellow-300 hover:text-red-700 text-white font-extrabold py-2 px-6 rounded-xl border-4 border-yellow-400 shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 hover:animate-bounce mt-2"
      >
        Iniciar sesión
      </button>
      {error && <p className="text-red-600 font-bold text-center">{error}</p>}
    </form>
  );
}

export default LoginPage;
