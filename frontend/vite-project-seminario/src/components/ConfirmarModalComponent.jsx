function ConfirmarModal({mensaje, onConfirmar, onCancelar}){
    return (
        <div className="modal-fondo">
            <div className="modal-contenido">
                <p>{mensaje}</p>
                <button className="modal-boton" onClick={onConfirmar}>Eliminar Mazo</button>
                <button className="modal-boton" onClick={onCancelar}>Cancelar</button>
            </div>
        </div>
    )

}
 
export default ConfirmarModal;