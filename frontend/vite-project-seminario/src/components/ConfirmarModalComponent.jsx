function ConfirmarModal({mensaje, onConfirmar, onCancelar}){
    return (
        <div className="modal-fondo">
            <div className="modal-contenido">
                <p>{mensaje}</p>
                <button onClick={onConfirmar}>Eliminar Mazo</button>
                <button onClick={onCancelar}>Cancelar</button>
            </div>
        </div>
    )

}

export default ConfirmarModal;