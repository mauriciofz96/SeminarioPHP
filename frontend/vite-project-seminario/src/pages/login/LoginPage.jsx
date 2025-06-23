import '../../assets/styles/RegistroPage.css'
import { useNavigate } from "react-router-dom";
import { useState }  from "react";
import {useEffect} from "react";
import { postLogin } from "../../services/apiService";


function LoginPage({setIsLoggedIn, setUserName, isLoggedIn}) {

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate=useNavigate();

    useEffect(() => {
        if(isLoggedIn){
            alert('Ya estás logueado');
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    //Funcion para manejar el envio (submit) del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); //Previene el comportamiento por defecto del formulario
        setError('');  //Limpia errores previos

        //Simulacion de peticion a API
        try {
            if(isLoggedIn === true) { //revisar ESTO!!!
                throw new error('Ya estás logueado');
            }
            const response = await postLogin({ usuario, password});

            const data=response.data;
            if(!data.token || !data.nombre) {
                throw new Error('Credenciales incorrectas');
            }
            console.log("Respuesta del backend:", data);

             // aca se deberia retornar token y username
            localStorage.setItem('token', data.token); // Guardar token en localStorage
            localStorage.setItem('nombre', data.nombre); // Guardar username en localStorage
            localStorage.setItem('usuario', usuario); // Guardar usuario en localStorage
            localStorage.setItem('id', data.id); // Guardar id en localStorage
            setIsLoggedIn(true); // Actualizar estado de inicio de sesión
            
            //Esto todavia no lo hice andar
            setIsLoggedIn(true); // Actualizar estado de inicio de sesión
            setUserName(data.nombre); // Actualizar nombre de usuario
            alert('Login exitoso');
            //

        } catch(error){
            setError('Error al iniciar sesión: ' + error.message);
        }
    }


    return (
        <main className="registro-main">
            <h2 className="registro-titulo">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
            <div className="registro-grupo">
                <label htmlFor="usuario" className="registro-label">Usuario:</label>
                <input
                id="usuario"
                type="text"
                name="usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                required
                className="registro-input"
                />
            </div>

            <div className="registro-grupo">
                <label htmlFor="password" className="registro-label">Contraseña:</label>
                <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="registro-input"
                />
            </div>

            <button type="submit" className="registro-boton">
                Iniciar sesión
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </main>
    )

}

export default LoginPage;