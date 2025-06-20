function EditarMazoForm({nuevoNombre, setNuevoNombre, onGuardar, onCancel, onClick}){
    return (
        <form className="flex flex-col gap-2 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400 shadow"
            onClick={onClick}
            onSubmit={e=>{
            e.preventDefault();
            onGuardar();
        }}>
            <input
              type="text"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              className="px-2 py-1 border-2 border-yellow-400 rounded-lg"
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold border-2 border-green-700 hover:bg-green-700 transition">Guardar</button>
              <button type="button" onClick={onCancel} className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 transition">Cancelar</button>
            </div>
        </form>
    )
}
export default EditarMazoForm;
