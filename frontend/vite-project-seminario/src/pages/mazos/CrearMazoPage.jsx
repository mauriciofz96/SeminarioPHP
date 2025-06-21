import React, { useEffect, useState } from 'react';
import { getCartas, crearMazo, getMazos } from '../../services/apiService';
import CartaComponent from '../../components/CartaComponent';
import '../../assets/styles/CrearMazoPage.css';

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
      console.log("Datos recibidos de getCartas:", response.data);
      setCartas(response.data);
    } catch (error) {
      console.error("Error al obtener cartas:", error);
      setCartas([]);
    }
  };

  useEffect(() => {
    fetchCartas();
  }, [atributoFiltro, nombreFiltro]);

  useEffect(() => {
    console.log("Cartas actualizadas:", cartas);
  }, [cartas]);

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
    <div className="crear-mazo-container">
      <h2>Crear Mazo</h2>

      <label htmlFor="nombre-mazo">Nombre del mazo:</label>
      <input
        id="nombre-mazo"
        type="text"
        value={nombre}
        maxLength={20}
        onChange={(e) => setNombre(e.target.value)}
      />

      <h3>Filtros</h3>
      <div className="filtros">
        <div>
          <label htmlFor="atributo-filtro">Atributo:</label>
          <select
            id="atributo-filtro"
            value={atributoFiltro}
            onChange={(e) => setAtributoFiltro(e.target.value)}
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
          <label htmlFor="nombre-filtro">Nombre:</label>
          <input
            id="nombre-filtro"
            type="text"
            value={nombreFiltro}
            onChange={(e) => setNombreFiltro(e.target.value)}
          />
        </div>

        <button className="limpiar-btn" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      <h3>Seleccionar cartas (máx 5)</h3>
      <div className="cartas-listado">
        {cartas.map((carta) => (
          <CartaComponent
            key={carta.id}
            carta={carta}
            seleccionadas={seleccionadas}
            toggleCarta={toggleSeleccion}
          />
        ))}
      </div>

      <button className="crear-btn" onClick={handleCrearMazo}>
        Crear Mazo
      </button>

      {mensaje && <p className="mensaje-error">{mensaje}</p>}
    </div>
  );
};

export default CrearMazoPage;
