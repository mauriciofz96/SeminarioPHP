import '../../assets/styles/MazoPage.css';
import '../../assets/styles/CartaComponent.css';
import EditarMazoForm from '../../components/EditarMazoForm';
import MazoModalComponent from '../../components/MazoModalComponent';
import ConfirmarModal from '../../components/ConfirmarModalComponent';
import {useEffect, useState} from 'react';
import { getMazos, editarMazo, getCartasEnMazo, borrarMazo, crearPartida } from "../../services/apiService";
import { useNavigate, useLocation } from 'react-router-dom';

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


    const [mazoAEliminar, setMazoAEliminar] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const handleEliminar = (mazo) => {
        // Si se confirma, establecer el mazo a eliminar
        setMazoAEliminar(mazo);
        setMostrarConfirmacion(true);
    }

    const confirmarEliminacion = async ()=>{
        try{
            console.log(`Eliminando mazo: ${mazoAEliminar.id}`);
            const response = await borrarMazo(mazoAEliminar.id, token);
            if(response.status === 200){
                 console.log('Mazo eliminado correctamente');
                 setMazoAEliminar(null);
                 setMostrarConfirmacion(false);
                 fetchMazos();
                }
        }catch(error){
            console.error('Error al eliminar el mazo:', error);
        }
    }

    const cancelarEliminacion = () => {
        setMostrarConfirmacion(false);
        setMazoAEliminar(null);
        
    }
        

    //NUEVO: jugar partida
  const [mazoJugando,setMazoJugando]=useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleJugar = async (mazo) => {
    if (mazoJugando){
          setMensaje('Error: no puede usarse un mazo cuando una partida está en curso')
        }
    setMazoJugando(mazo);
    try{
        const response = await crearPartida(mazo.id,token);
        if (response.status === 200){
            console.log("Partida creada exitosamente");
            const partidaId = response.data.partida_id;

            navigate('/partida',{
                state:{
                    id,
                    partidaId,
                }
            });
         }
    }catch(error){
      console.error('Error al crear la partida');
      setMazoJugando(null);
    }
  }

  const location = useLocation();
  useEffect(() =>{
    if(location.state && location.state.finalizarPartida){
        setMazoJugando(null);
    }
  },[location.state])


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
                          <button onClick={()=>handleEliminar(mazo)}> Eliminar</button>
                          <button onClick={e => {e.stopPropagation(); handleClickEditar(mazo)}}> Editar</button>
                          <button onClick={()=>handleJugar(mazo)}> Jugar</button>
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
                    {mensaje && <p className="mensaje-error"> {mensaje} </p>}
                    </li>                 
                    ))
                ): (
                    <p>No tienes mazos disponibles</p>
                )}
            </ul>
            {mazoVisible && (
                            <MazoModalComponent 
                                mazo={mazoVisible}
                                cartas={cartas}
                                cargando={cargandoCartas}
                                onClose={() => {
                                  setMazoVisible(null);
                                  setCartas(null);
                                 }}
                            />
                        )}
            {mostrarConfirmacion && (
                <ConfirmarModal
                    mensaje={`¿Estás seguro de que quieres eliminar el mazo "${mazoAEliminar.nombre}"?`}
                    onConfirmar={confirmarEliminacion}
                    onCancelar={cancelarEliminacion}
                    />
            )}
            
        </div>
    );
}
export default MazosPage;
