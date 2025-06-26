//estilos a importar
import '../../assets/styles/Partida.css'
import '../../assets/styles/CartaComponent.css'

import {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { realizarJugada, listarCartasEnMano} from '../../services/apiService'
import FinPartida from '../../components/FinPartidaModal'

function PartidaPage(){
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('id');
    const {partidaId} =location.state || {};
    const [cartasMano, setCartasMano] = useState(null);
    const [cartasServidor, setCartasServidor] = useState(null);

    //nuev funcion obtener cartas para usuario y servidor
    async function actualizarCartasEnJuego() {
    try {
        // Cartas del usuario
        const responseUsuario = await listarCartasEnMano(usuarioId,partidaId,token);
        if (responseUsuario.status === 200) {
            setCartasMano(responseUsuario.data);
        }
        // Cartas del servidor (id = 1)
        const responseServidor = await listarCartasEnMano(1, partidaId,token);
        if (responseServidor.status === 200) {
            setCartasServidor(responseServidor.data);
        }
    } catch (error) {
        console.error(error);
    }
}
    
    useEffect(()=>{
        actualizarCartasEnJuego();
    },[usuarioId,token])


    useEffect(() => {
     if (!usuarioId || !token) {
          navigate('/login');
         }
    }, []);

    const [tablero,setTablero] = useState(Array(2).fill(null));

    const [ganador, setGanador] = useState(null); //ganador de partida

    const[esperandoJugada,setEsperandoJugada] = useState(false);

    const [resultadoJugada, setResultadoJugada] = useState(null);


    

  
const handleDrop = async (e) => {
  if (resultadoJugada) return;

  const cartaId = e.dataTransfer.getData("cartaId");
  const cartaSeleccionada = cartasMano.find(c => c.id === parseInt(cartaId));
  
  if (cartaSeleccionada && !tablero[1] && !esperandoJugada) {
    setEsperandoJugada(true);
    setTablero([null, cartaSeleccionada]);
    setCartasMano(cartasMano.filter(c => c.id !== cartaSeleccionada.id));
    
    try {
      const response = await realizarJugada(token, cartaId, partidaId, usuarioId);
      if (response.status === 200) {
        const cartaServidorJugada = response.data['carta jugada por el servidor'];

        setTablero([cartaServidorJugada, cartaSeleccionada]);
        setCartasServidor(prevCartasServidor =>
          prevCartasServidor
            ? prevCartasServidor.filter(c => Number(c.id) !== Number(cartaServidorJugada.id))
            : []
        );

        console.log("Cartas servidor después de jugar:", cartasServidor);

        setResultadoJugada(response.data['Resultado:']);
        if (response.data['El ganador de la partida es:']) {
          setGanador(response.data['El ganador de la partida es:']);
        }
      }
    } catch (error) {
      console.error('Hubo un error al realizar la jugada');
      setResultadoJugada('Error');
    }

    setEsperandoJugada(false);
  }
}


    function mensajeResultado(resultado){
        if(!resultado) return'**';
        if(resultado.includes('gano')) return '¡Has ganado la jugada!'
        if(resultado.includes('perdio')) return 'El servidor gana la jugada'
        if(resultado.includes('empato')) return '¡Empate!'
    }



    
    
    const finalizarPartida = () => {
        //devolver a en_mazo el estado de todas las cartas del mazo utilizado
        navigate('/', {state: {finalizarPartida: true}});
    }

    const nuevaPartida = async () => {
        try{
           const response = await crearPartida(mazo.id, token);
           if (response.status === 200) {
             const nuevasCartas = response.data.cartas;
             const nuevoPartidaId = response.data.partida_id;
            // Actualiza el estado con la nueva partida
             navigate('/partida', {
                 state: {
                     partidaId: nuevoPartidaId
                 }
             });
            }
        }catch(error){
          console.error('Error al crear la partida. Volviendo al menu de mazos');
          navigate('/mis-mazos', {state: {finalizarPartida: true}});
        }
    }




    
    return(
        <div>
            <h3 className="partida"> Partida en curso... </h3>

            <div className="mazo-jugando">
                {cartasServidor && cartasServidor.map((cartaServidor)=>(
                  <div
                    key={cartaServidor.id}
                    className="carta">
                        <img src={`/images/${cartaServidor.atributo.toLowerCase().replace(/\s+/g, '') + '.png'}`}
                         className="carta-imagen" />
                  </div>
                ))}
            
            </div>

            <section className="tablero">
               {/*casillero del servidor*/}
                 <div className="casillero-carta">
                    {tablero[0]?(
                        <div className="carta">
                             <img src={`/images/${tablero[0].nombre.toLowerCase().replace(/\s+/g, '') + '.png'}`}
                             alt={tablero[0].nombre}
                             className="carta-imagen" />
                             <div className="carta-info">
                                 <h4>{tablero[0].nombre}</h4>
                                 <p>Ataque: {tablero[0].ataque}</p>
                                 <p>Tipo: {tablero[0].atributo}</p>
                             </div>
                         </div>
                    ):(
                        <div className="carta-vacia"> Esperando para jugar</div> 
                    )}
                 </div> 

                { /*casillero del usuario*/}
                 <div 
                  className="casillero-carta"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                 >
                   {tablero[1] ? (
                         <div className="carta">
                             <img src={`/images/${tablero[1].nombre.toLowerCase().replace(/\s+/g, '') + '.png'}`}
                             alt={tablero[1].nombre}
                             className="carta-imagen" />
                             <div className="carta-info">
                                 <h4>{tablero[1].nombre}</h4>
                                 <p>Ataque: {tablero[1].ataque}</p>
                                 <p>Tipo: {tablero[1].atributo}</p>
                             </div>
                         </div>
                      ) : (
                         <div className="carta vacia">Arrastra tu carta aquí</div>
                     )}
                 </div>
            </section>
            <div className="mazo-jugando">
                {cartasMano && cartasMano.map((carta)=>(
                     <div
                       key={carta.id}
                       className="carta"
                       draggable
                       onDragStart={e=>e.dataTransfer.setData("cartaId",carta.id)}
                     >
                         <img src={`/images/${carta.nombre.toLowerCase().replace(/\s+/g, '') + '.png'}`}
                         alt={carta.nombre}
                         className="carta-imagen" />
                         <div className="carta-info">
                             <h4>{carta.nombre}</h4>
                             <p>Ataque: {carta.ataque}</p>
                             <p>Tipo: {carta.atributo}</p>
                         </div>
                     </div>
                ))}
            </div>

            {resultadoJugada &&(
                <div className="resultado">
                    <h3>{mensajeResultado(resultadoJugada)}</h3>
                    <button onClick={() => {
                        setTablero(Array(2).fill(null));
                        setResultadoJugada(null);
                    }}>
                        Siguiente jugada
                    </button>
                </div>
            )}

            {ganador !== null && ganador !== "" && (
                <FinPartida
                  ganador={ganador}
                  mensaje='Jugar otra vez?'
                  onNuevaPartida={nuevaPartida}
                  onFinalizarPartida={finalizarPartida}
                />
            )}
        </div>


    )
}
export default PartidaPage;
