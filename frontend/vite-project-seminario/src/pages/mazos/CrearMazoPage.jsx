import React, { useEffect, useState } from 'react';
import { getCartas, crearMazo, getMazos } from '../../services/apiService';
import CartaComponent from '../../components/CartaComponent';

const CrearMazoPage = () => {
  const [nombre, setNombre] = useState('');
  const [atributoFiltro, setAtributoFiltro] = useState('');
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [cartas, setCartas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const token = localStorage.getItem('token');
  const usuarioId = localStorage.getItem('id');

  const fetchCartas = async () => {
    try {
      const response = await getCartas({
        atributo: atributoFiltro,
        nombre: nombreFiltro,
      });
      setCartas(response.data);
    } catch (error) {
      setCartas([]);
    }
  };

  useEffect(() => {
    fetchCartas();
  }, [atributoFiltro, nombreFiltro]);

  const limpiarFiltros = () => {
    setAtributoFiltro('');
    setNombreFiltro('');
  };

  const toggleSeleccion = (id) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((cartaId) => cartaId !== id));
    } else if (seleccionadas.length < 5) {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  const handleCrearMazo = async () => {
    if (!nombre || nombre.length > 20) {
      setMensaje('El nombre es requerido y debe tener hasta 20 caracteres.');
      return;
    }
    if (seleccionadas.length === 0) {
      setMensaje('Debes seleccionar al menos una carta.');
      return;
    }

    try {
      const response = await getMazos(usuarioId, token);
      if (response.data.length >= 3) {
        setMensaje('Ya tienes el máximo de 3 mazos permitidos.');
        return;
      }

      await crearMazo(nombre, seleccionadas, token);
      setMensaje('¡Mazo creado exitosamente!');
      setNombre('');
      setSeleccionadas([]);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al crear el mazo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400">
      <h2 className="text-3xl font-extrabold text-center text-red-600 mb-6 drop-shadow-lg">Crear Mazo</h2>

      <label htmlFor="nombre-mazo" className="block text-lg font-bold text-gray-700 mb-1">Nombre del mazo:</label>
      <input
        id="nombre-mazo"
        type="text"
        value={nombre}
        maxLength={20}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold mb-4"
      />

      <h3 className="text-xl font-bold text-yellow-700 mb-2">Filtros</h3>
      <div className="flex gap-4 mb-4">
        <div>
          <label htmlFor="atributo-filtro" className="block font-semibold">Atributo:</label>
          <select
            id="atributo-filtro"
            value={atributoFiltro}
            onChange={(e) => setAtributoFiltro(e.target.value)}
            className="px-2 py-1 border-2 border-yellow-400 rounded-lg"
          >
            <option value="">Todos</option>
            <option value="1">Fuego</option>
            <option value="2">Agua</option>
            <option value="3">Tierra</option>
            <option value="4">Normal</option>
            <option value="5">Volador</option>
            <option value="6">Piedra</option>
            <option value="7">Planta</option>
          </select>
        </div>

        <div>
          <label htmlFor="nombre-filtro" className="block font-semibold">Nombre:</label>
          <input
            id="nombre-filtro"
            type="text"
            value={nombreFiltro}
            onChange={(e) => setNombreFiltro(e.target.value)}
            className="px-2 py-1 border-2 border-yellow-400 rounded-lg"
          />
        </div>

        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg border-2 border-yellow-700 transition" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      <h3 className="text-xl font-bold text-yellow-700 mb-2">Seleccionar cartas (máx 5)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {cartas.map((carta) => (
          <CartaComponent
            key={carta.id}
            carta={carta}
            seleccionadas={seleccionadas}
            toggleCarta={toggleSeleccion}
          />
        ))}
      </div>

      <button className="bg-red-600 hover:bg-yellow-300 hover:text-red-700 text-white font-extrabold py-2 px-6 rounded-xl border-4 border-yellow-400 shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 hover:animate-bounce mt-2" onClick={handleCrearMazo}>
        Crear Mazo
      </button>

      {mensaje && <p className="text-red-600 font-bold text-center mt-4">{mensaje}</p>}
    </div>
  );
};

export default CrearMazoPage;
