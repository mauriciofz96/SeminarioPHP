import '../../assets/styles/MazoPage.css';
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
    //obtengo los mazos
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
              //refrescar la lista de mazos
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
     setMazoVisible(mazo);   // Abre el modal inmediatamente
     setCartas(null);        // Limpia cartas
     setCargandoCartas(true);
     getCartasEnMazo(mazo.id, token)
       .then(response => setCartas(response.data))
       .catch(() => setCartas([]))
       .finally(() => setCargandoCartas(false));
    };

  

    return(
        <div>
            <h1>Mazos disponibles</h1>
            <ul>
                {mazos && mazos.length>0 ? (
                    mazos.map((mazo) => (
                        <li
                        key={mazo.id} 
                        onClick={()=> {
                            setMazoSeleccionado(mazo.id)
                            setEditando(null);
                        }}
                        className={`mazo${mazoSeleccionado === mazo.id ? ' seleccionado' : ''}`}> 
                        <span >{mazo.nombre}</span>
                       {mazoSeleccionado ==mazo.id &&
                       <div className="mazo-opciones">
                          <button onClick={() =>handleVerMazo(mazo)}>Ver Mazo</button>
                          <button> Eliminar</button>
                          <button onClick={e => {e.stopPropagation(); handleClickEditar(mazo)}}> Editar</button>
                          <button> Jugar</button>
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
                    <p>No tienes mazos disponibles</p>
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
