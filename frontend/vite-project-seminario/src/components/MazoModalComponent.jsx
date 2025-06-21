//modal para ver cartas del mazo en pantalla

function VerMazoModal({mazo,cartas,cargando,onClose}){
    const cartasArray = Array.isArray(cartas) ? cartas : Object.values(cartas || {});
    return(
        <div className="modal-fondo">
            <div className="modal-contenido">
                <h2>{mazo.nombre}</h2>
                <button className="close-button" onClick={onClose}>X</button>
                {cargando || !cartas ?(<p>Cargando cartas...</p>):(
                <ul className="cartas-lista">
                        {cartasArray.map((carta) => (
                         <div className="carta" key={carta.id}>
                             <img src={`/images/${carta.nombre.toLowerCase().replace(/\s+/g, '') + '.png'}`}
                             alt={carta.nombre}
                             className="carta-imagen" />
                             <div className="carta-info">
                                 <h4>{carta.nombre}</h4>
                                 <p>Ataque: {carta.ataque}</p>
                                 <p>Tipo: {carta.atributo}</p>
                                 <p>Habilidad: {carta.ataque_nombre}</p>
                             </div>
                         </div>
                        ))}
                </ul>
                )}
            </div>
        </div>
    )
}
export default VerMazoModal;
