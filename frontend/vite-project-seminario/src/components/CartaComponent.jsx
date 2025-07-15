import React from 'react'
import '../styles/Carta/CartaComponent.css';


const CartaComponent = ({ carta, seleccionadas, toggleCarta }) => {
  // Asumiendo que la imagen se llama igual que el nombre en minúsculas y sin espacios
  const nombreImagen = carta.nombre.toLowerCase().replace(/\s+/g, '') + '.png'

  return (
    <div
      className={`carta ${seleccionadas.includes(carta.id) ? 'seleccionada' : ''}`}
      onClick={() => toggleCarta(carta.id)}
    >
      <img
        src={`/images/${nombreImagen}`}
        alt={carta.nombre}
        className="carta-imagen"
      />
      <div className="carta-info">
        <h4>{carta.nombre}</h4>
        <p>Ataque: {carta.ataque}</p>
        <p>Tipo: {carta.atributo}</p>
        <p>Habilidad: {carta.ataque_nombre}</p>
      </div>
      <input
        type="checkbox"
        checked={seleccionadas.includes(carta.id)}
        onChange={() => toggleCarta(carta.id)}
        onClick={(e) => e.stopPropagation()}
      />
    </div>

  )
}

export default CartaComponent
 