//modal para ver cartas del mazo en pantalla

function VerMazoModal({mazo,cartas,cargando,onClose}){
    const cartasArray = Array.isArray(cartas) ? cartas : Object.values(cartas || {});
    return(
        <div className="modal-fondo">
            <div className="modal-contenido">
                <h2>{mazo.nombre}</h2>
                <button className="close-button" onClick={onClose}>X</button>
                {cargando || !cartas ?(<p>Cargando cartas...</p>):(
                <ul>
                        {cartasArray.map((carta) => (
                            <li key={carta.id}>
                                <span>{carta.nombre}</span>
                                <span>{carta.atributo}</span>
                                <span>{carta.ataque_nombre}</span>
                                <span>{carta.ataque}</span>
                            </li>
                        ))}
                </ul>
                )}
            </div>
        </div>
    )
}
export default VerMazoModal;
