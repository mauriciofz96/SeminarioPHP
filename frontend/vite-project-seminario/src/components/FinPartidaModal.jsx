function FinPartida({ganador, mensaje, onNuevaPartida, onFinalizarPartida}){
    let textoFinal='';
    if(ganador === 'gano'){
        textoFinal='¡Has ganado!\n'+ mensaje;
    } else if(ganador === 'perdio'){
        textoFinal='Has perdido.\n' + mensaje;
    } else{ textoFinal='Empate.\n' + mensaje;}
    

    return (
        <div className="modal-fondo">
            <div className="modal-contenido">
                <h3 className="resultado">{textoFinal}</h3>
                <button className="button" onClick={onNuevaPartida}>Jugar otra vez</button>
                <button className="button" onClick={onFinalizarPartida}>Finalizar partida</button>
            </div>
        </div>
    )
}
export default FinPartida;
