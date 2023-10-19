import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

import {Login} from "../pages/normal/Login";
import {Home} from "../pages/normal/Home";
import {Evaluacion} from "../pages/normal/Evaluacion"
import {EvaluacionProyecto} from "../pages/normal/EvaluacionProyecto"
import {Enviado} from "../pages/normal/Enviado";
import {Resultados} from "../pages/normal/Resultados"
import {ResultadosProyecto} from "../pages/normal/ResultadosProyecto";

import {HomeAdmin} from "../pages/admin/HomeAdmin"
import {LoginAdmin} from "../pages/admin/LoginAdmin"
import {Registro} from "../pages/admin/Registro"
import {Rubricas} from "../pages/admin/Rubricas"
import {DashboardP} from "../pages/admin/DashboardP";
import {DashboardR} from "../pages/admin/DashboardR";
import {EdicionProyecto} from "../pages/admin/EdicionProyecto"
import {EdicionRubrica} from "../pages/admin/EdicionRubrica"
import { ResultadosAdmin } from "../pages/admin/ResultadosAdmin";
import { ResultadosProyectoAdmin } from "../pages/admin/ResultadosProyectoAdmin";

import {useAuth} from "../context/AuthContext";

export function MyRoutes() {

  const auth = useAuth();
 

  const ProtectedRouteHome = ({ children }) => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      return <Navigate to="/" />;
    } else {
     
      return <Home/>;
    }
  };
  
  const ProtectedRouteResultados = ({ children }) => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      return <Navigate to="/" />;
    } else {

      return <Resultados/>;
    }
  };
  
  const ProtectedRouteResultadosProyecto = ({ children }) => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      return <Navigate to="/" />;
    } else {
     
      return <ResultadosProyecto/>;
    }
  };
  
  const ProtectedRouteEvaluacion = ({ children }) => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      return <Navigate to="/" />;
    } else {
      
      return <Evaluacion/>;
    }
  };
    
  const ProtectedRouteEnviado = ({ children }) => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      return <Navigate to="/" />;
    } else {
      
      return <Enviado/>;
    }
  };
  
  const ProtectedRouteEvaluacionProyecto = ({ children }) => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      return <Navigate to="/" />;
    } else {
      const user = JSON.parse(storedUser);
     
      return <EvaluacionProyecto/>;
    }
  };
  

 
  const PrivateRoute = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <HomeAdmin />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateRouteRegistro = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <Registro />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateRouteRubricas = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <Rubricas />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateRouteDashboardproyectos = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <DashboardP />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateRouteDashboardrubricas = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <DashboardR />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateRouteEdicion2 = ({ children }) => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin"  />;
    }else{
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <EdicionProyecto/>;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
      
  };
  

  const PrivateRouteEdicion3 = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin"  />;

    }else{

      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <EdicionRubrica/>;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
     
    }
  }

  const PrivateRouteResuladosAdmin = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <ResultadosAdmin />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateRouteResuladosProyectoAdmin = ({ children }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return <Navigate to="/LoginAdmin" />;
    } else {
      const user = JSON.parse(storedUser);

      if (user.isAdmin) {
        return <ResultadosProyectoAdmin />;
      } else {
        return <Navigate to="/LoginAdmin" />;
      }
    }
  };

  const PrivateLogin = ({ children }) => {

    return auth.logout(),<Login />
   

  }

  const PrivateLoginAdmin = ({ children }) => {
    
    return auth.logout(),<LoginAdmin/>
  }
  

  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrivateLogin/>} />
        <Route path="/Home" element={<ProtectedRouteHome />}></Route>
        <Route path="/Evaluacion" element={<ProtectedRouteEvaluacion />}></Route>
        <Route path="/EvaluacionProyecto/:nombreRubrica" element= {<ProtectedRouteEvaluacionProyecto/>}></Route>
        <Route path="/Enviado" element={<ProtectedRouteEnviado />}></Route>
        <Route path="/Resultados" element={<ProtectedRouteResultados />}></Route>
        <Route path="/ResultadosProyecto" element= {<ProtectedRouteResultadosProyecto/>}></Route>
        

        <Route path="/LoginAdmin" element={<PrivateLoginAdmin/>} />
        <Route path="/HomeAdmin" element={<PrivateRoute />} /><Route />
        <Route path="/Registro" element={<PrivateRouteRegistro />} /><Route />
        <Route path="/Rubricas" element={<PrivateRouteRubricas />} /><Route />
        <Route path="/DashboardP" element={<PrivateRouteDashboardproyectos />} /><Route />
        <Route path="/DashboardR" element={<PrivateRouteDashboardrubricas />} /><Route />
        <Route path="/edicion/proyecto/:proyectoId" element={<PrivateRouteEdicion2 />} /><Route />
        <Route path="/edicion/rubrica/:rubricaId" element={<PrivateRouteEdicion3 />} /><Route />
        <Route path="/ResultadosAdmin" element={<PrivateRouteResuladosAdmin />} /><Route />
        <Route path="/ResultadosProyectoAdmin" element={<PrivateRouteResuladosProyectoAdmin />} /><Route />
        <Route />
      </Routes>
    </BrowserRouter>
  );
}