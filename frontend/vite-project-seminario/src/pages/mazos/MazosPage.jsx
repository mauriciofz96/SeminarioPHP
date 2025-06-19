import EditarMazoForm from '../../components/EditarMazoForm';
import VerMazoModal from '../../components/VerMazoModal';
import {useEffect, useState} from 'react';
import { getMazos, editarMazo, getCartasEnMazo } from "../../services/apiService";
import { useNavigate } from 'react-router-dom';

function MazosPage(){
    const navigate = useNavigate();
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token');

    if (!id || !token) {
      navigate('/login')
    }

    const [mazos, setMazos] = useState([]);
    const[mazoSeleccionado, setMazoSeleccionado] = useState(null);

    async function fetchMazos(){
        try{
            const response = await getMazos(id,token);
            setMazos(response.data);
        }catch(error){
            console.error(error);
        }
    }
    useEffect(()=>{
        fetchMazos();
    }, [id,token]);

    const [nuevoNombre, setNuevoNombre] = useState('');
    const [editando, setEditando] = useState(null);

    const handleClickEditar = (mazo)=>{
         setNuevoNombre(mazo.nombre);
         setEditando(mazo.id);
    }

    const handleGuardar = async () => {
        try{
            const response= await editarMazo(editando, nuevoNombre, token);
            if(response.status === 200){
              setEditando(null);
              fetchMazos();
            }
        }catch(error){
            console.error('Error al cambiar el nombre del mazo:', error);
        }
    }
    
    const [mazoVisible, setMazoVisible] = useState(null);
    const [cartas, setCartas] = useState(null);
    const [cargandoCartas, setCargandoCartas] = useState(false);
    
    const handleVerMazo = (mazo) => {
     setMazoVisible(mazo);
     setCartas(null);
     setCargandoCartas(true);
     getCartasEnMazo(mazo.id, token)
       .then(response => setCartas(response.data))
       .catch(() => setCartas([]))
       .finally(() => setCargandoCartas(false));
    };

    return(
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400">
            <h1 className="text-3xl font-extrabold text-center text-red-600 mb-6 drop-shadow-lg">Mazos disponibles</h1>
            <ul>
                {mazos && mazos.length>0 ? (
                    mazos.map((mazo) => (
                        <li
                        key={mazo.id} 
                        onClick={()=> {
                            setMazoSeleccionado(mazo.id)
                            setEditando(null);
                        }}
                        className={`mb-4 p-4 rounded-lg shadow-md border-2 border-yellow-300 cursor-pointer transition-all duration-200 ${mazoSeleccionado === mazo.id ? 'bg-yellow-100 scale-105' : 'bg-white hover:bg-yellow-50'}`}> 
                        <span className="font-bold text-lg text-red-700">{mazo.nombre}</span>
                       {mazoSeleccionado ==mazo.id &&
                       <div className="flex gap-2 mt-2">
                          <button className="bg-blue-500 text-white px-3 py-1 rounded-lg font-bold border-2 border-blue-700 hover:bg-blue-700 transition">Ver Mazo</button>
                          <button className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 transition">Eliminar</button>
                          <button className="bg-yellow-400 text-black px-3 py-1 rounded-lg font-bold border-2 border-yellow-700 hover:bg-yellow-500 transition" onClick={e => {e.stopPropagation(); handleClickEditar(mazo)}}>Editar</button>
                          <button className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold border-2 border-green-700 hover:bg-green-700 transition">Jugar</button>
                        </div>}
                        {editando === mazo.id &&(
                            <EditarMazoForm
                            nuevoNombre={nuevoNombre}
                            setNuevoNombre={setNuevoNombre}
                            onGuardar={handleGuardar}
                            onCancel={() => setEditando(null)}
                            onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </li>                 
                    ))
                ): (
                    <p className="text-center text-gray-500">No tienes mazos disponibles</p>
                )}
            </ul>
            {mazoVisible && (
                <VerMazoModal 
                    mazo={mazoVisible}
                    cartas={cartas}
                    cargando={cargandoCartas}
                    onClose={() => {
                      setMazoVisible(null);
                      setCartas(null);
                     }}
                />
            )}
        </div>
    );
}
export default MazosPage;
