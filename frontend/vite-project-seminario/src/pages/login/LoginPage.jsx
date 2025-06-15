import React, { useState }  from "react";
import { postLogin } from "../../services/apiService";


function LoginPage(){
    //Defino los estados para usuario, constraseña y error
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    //Funcion para manejar el envio (submit) del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); //Previene el comportamiento por defecto del formulario
        setError('');  //Limpia errores previos

        //Simulacion de peticion a API
        try {
            const response = await postLogin({usuario, password});

            if(!response.ok){
                throw new Error('Credenciales incorrectas');
            }

            const data = await response.json(); // aca se deberia retornar token y username
            localStorage.setItem('token', data.token); // Guardar token en localStorage
            localStorage.setItem('username', data.username); // Guardar username en localStorage
            alert('Login exitoso');

        } catch(error){
            setError('Error al iniciar sesión: ' + error.message);
        }
    }


    return(<form onSubmit={handleSubmit}> 
        <h1> Iniciar Sesion</h1>
        <div>
          <label>Usuario:</label>
          <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} required/>
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" value={password}  onChange={e => setPassword(e.target.value)} required/>
        </div>
        <button type="submit">Iniciar sesión</button>
        {error && <p style={{ color: "red"}}>{error}</p>}
    </form>);
}

export default LoginPage;
