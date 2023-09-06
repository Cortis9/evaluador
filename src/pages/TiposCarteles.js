import React from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import '../components/Style/tiposCarteles.css'

const TiposCarteles = () => {
    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Tipos de cartel"></TopBar>
            <div className="workSpace">
                <p className="subtituloTipoCarteles">Tipos de carteles</p>
                <p >Ejemplo de cartel de Ciencia básica y/o aplicada: <a className="linkEjemplo" target="_blank"
                    href="https://drive.google.com/file/d/1wAdFT_m7V7rZX1JX04mlavaweAOo7TY3/view?usp=sharing">VER CARTEL
                    DE EJEMPLO</a></p>
                <p >Ejemplo de cartel de Diseño y/o soluciones científicas: <a className="linkEjemplo" target="_blank"
                    href="https://drive.google.com/file/d/1N_fp_FH_OKx8juJbbVONQk177TZqIX0l/view?usp=sharing">VER CARTEL
                    DE EJEMPLO</a></p>
                <p >Ejemplo de cartel de Proyecto arquitectónico: <a className="linkEjemplo" target="_blank"
                    href="https://drive.google.com/file/d/1Jo-U_CMzyBgiGQr_DRYZ8rMx3hQBAlpx/view?usp=sharing">VER CARTEL
                    DE EJEMPLO</a></p>
            </div>
        </>
    )
};

export default TiposCarteles;