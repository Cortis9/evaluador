import React, { useEffect } from 'react';
import { AuthProvider } from "./context/AuthContext";
import { MyRoutes } from "./routers/routes";

function App() {

  return (
    <div>
      <AuthProvider>
        <MyRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
