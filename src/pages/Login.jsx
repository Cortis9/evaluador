import React, { useState } from 'react'
import icono from '../assets/icono.png'
import loginImg from '../assets/loginBG2.png'
import logo from '../assets/logo.png'
import '../components/Style/login.css'
import DAO from '../components/Logic/DAO'
import Cookies from 'universal-cookie';
import * as alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

const Login = () => {
    const [usuarioInput, setUsuarioInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const { getWhere, updateItem } = DAO();
    const cookies = new Cookies();

    const handleLogin = async (e) => {
        if (usuarioInput.length > 0 || passwordInput.length > 0) {
            e.preventDefault();
            let res = await getWhere("juez", "user","==", usuarioInput);
            if (res.error) {
                alertify.error("Usuario no existe");
            } else {
                if (res.password === passwordInput) {
                    alertify.success("Bienvenido");
                    await updateItem("juez", res.Id, { isLoggedIn: true });
                    cookies.set('usuario', usuarioInput, { path: '/' });
                    cookies.set('idJuez', res.Id, { path: '/' });
                    cookies.set('rol', res.rol, { path: '/' });
                    window.location.href = "/NuevaEvaluacion";
                } else {
                    alertify.error("Contraseña incorrecta");
                }
            }
    } else {
        alertify.error("Ingrese un usuario y/o contraseña por favor");
    }

    }
    return (
        <div style={{ backgroundImage: `url(${loginImg})`, height: '100vh', width: '100vw' }}>
            <form className="formularioLogin" onSubmit={(e) => handleLogin(e)}>
                <div className="imgs">
                    <img className="imgLogin" src={logo} alt="logo" />
                    <img className="imgLogin" src={icono} alt="icono" />
                </div>
                <p id='grande' className="titulo centrado ">Iniciar sesión</p>
                <input required={true} id='usuarioInput' className="inputsLogin" type="text" placeholder="Usuario"
                    value={usuarioInput} onChange={(e) => setUsuarioInput(e.target.value.toUpperCase())} />
                <input required={true} id='contraInput' className="inputsLogin" type="password" placeholder="Contraseña"
                    value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                <button className="btnLogin" type="submit">Iniciar sesión</button>
            </form>
        </div>
    )
}

export default Login