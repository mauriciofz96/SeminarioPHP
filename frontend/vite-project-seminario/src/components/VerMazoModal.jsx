//modal para ver cartas del mazo en pantalla

function VerMazoModal({mazo,cartas,cargando,onClose}){
    const cartasArray = Array.isArray(cartas) ? cartas : Object.values(cartas || {});
    return(
        <div className="fixed inset-0 shadow-black flex items-center justify-center z-[]">
            <div className="relative bg-gradient-to-r from-blue-800 to-blue-900 p-6 rounded-[10px] min-w-[300px] max-w-[900px] shadow-lg ">
                <h2 className="mt-1 text-white font-bold font-sans text-2xl text-center">{mazo.nombre}</h2>
                <button className="absolute top-3 right-3 bg-red-600 text-white rounded-full w-8 h-8 text-lg flex items-center justify-center hover:bg-red-700 transition" onClick={onClose}>X</button>
                {cargando || !cartas ?(<p>Cargando cartas...</p>):(
                <ul className="flex flex-row gap-2 list-none p-0">
                        {cartasArray.map((carta) => (
                         <li className="flex flex-col gap-2.5 list-none p-0" key={carta.id}>
                            <div className="bg-[#ea0c0c] rounded-xl p-3 flex flex-col items-center shadow-md">
                             <img src={`/images/${carta.nombre.toLowerCase().replace(/\s+/g, '') + '.png'}`}
                             alt={carta.nombre}
                             className="w-36 h-auto object-contain mb-2.5 rounded-lg border-4 border-yellow-400" />
                             <div className="mt-1 text-white font-bold font-sans text-center">
                                 <h4 className="my-1 text-xl">{carta.nombre}</h4>
                                 <p className="my-0.5 text-base">Ataque: {carta.ataque}</p>
                                 <p className="my-0.5 text-base">Tipo: {carta.atributo}</p>
                                 <p className="my-0.5 text-base">Habilidad: {carta.ataque_nombre}</p>
                             </div>
                             </div>
                         </li>
                        ))}
                </ul>
                )}
            </div>
        </div>
    )
}
export default VerMazoModal;

