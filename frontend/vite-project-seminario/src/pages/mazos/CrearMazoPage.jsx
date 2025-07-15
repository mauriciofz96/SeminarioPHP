import '../../styles/Mazo/CrearMazoPage.css'
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
    // Validaciones del FRONT
    if (!nombre || nombre.length > 20 || seleccionadas.length === 0) {
      try {
        // Simulamos que el backend maneje este error (usamos el mismo endpoint)
        await crearMazo(nombre, seleccionadas, token);
      } catch (error) {
        const mensajeDelBackend =
          error.response?.data?.error ||
          'Ocurrió un error al crear el mazo.';
        setMensaje(mensajeDelBackend);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return; // Salimos
    }

    try {
      // Validación de cantidad de mazos
      const response = await getMazos(usuarioId, token);
      if (response.data.length >= 3) {
        setMensaje('Ya tienes el máximo de 3 mazos permitidos.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Intentamos crear el mazo
      await crearMazo(nombre, seleccionadas, token);
      setMensaje('¡Mazo creado exitosamente!');
      setNombre('');
      setSeleccionadas([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const mensajeDelBackend =
        error.response?.data?.error ||
        'Ocurrió un error al crear el mazo.';
      setMensaje(mensajeDelBackend);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  return (
    <div className="crear-mazo-container">
      <h2>Crear Mazo</h2>
      {mensaje && <p className="mensaje-error">{mensaje}</p>}
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

      <button className="crear-btn-flotante" onClick={handleCrearMazo}>
        Crear Mazo
      </button>

    </div>
  );
};

export default CrearMazoPage;
