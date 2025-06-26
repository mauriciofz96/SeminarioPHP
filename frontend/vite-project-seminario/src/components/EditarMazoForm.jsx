
function EditarMazoForm({nuevoNombre, setNuevoNombre, onGuardar, onCancel, onClick}){
    return (
        <form className="editar-form"
            onClick={onClick}
            onSubmit={e=>{
            e.preventDefault();
            onGuardar();
        }}>
            <input
              type="text"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
            />
            <button className="modal-boton" type="submit">Guardar</button>
            <button className="modal-boton" type="button" onClick={onCancel}>Cancelar</button>
        </form>
    )
}
export default EditarMazoForm;
