import React from 'react'

const CartaComponent = ({ carta, seleccionadas, toggleCarta }) => {
  const nombreImagen = carta.nombre.toLowerCase().replace(/\s+/g, '') + '.png'

  return (
    <div className={`rounded-xl border-4 border-yellow-400 shadow-lg p-4 flex flex-col items-center bg-white transition-all duration-200 ${seleccionadas.includes(carta.id) ? 'bg-yellow-100 scale-105' : 'hover:bg-yellow-50'}`}>
      <img
        src={`/images/${nombreImagen}`}
        alt={carta.nombre}
        className="w-24 h-40 object-contain mb-2"
      />
      <div className="text-center">
        <h4 className="font-extrabold text-red-700">{carta.nombre}</h4>
        <p className="font-semibold">Ataque: <span className="text-red-600">{carta.ataque}</span></p>
        <p className="font-semibold">Tipo: <span className="text-yellow-700">{carta.atributo}</span></p>
        <p className="font-semibold">Habilidad: <span className="text-blue-700">{carta.ataque_nombre}</span></p>
      </div>
      <input
        type="checkbox"
        checked={seleccionadas.includes(carta.id)}
        onChange={() => toggleCarta(carta.id)}
        className="mt-2 w-5 h-5 accent-red-600"
      />
    </div>
  )
}

export default CartaComponent
