import React from "react";
import { Base } from "../normal/Base";


function PieDePagina() {
  const anioActual = new Date().getFullYear();

  return (
    <footer id="pie">
      <p>© Evaluador - {anioActual}</p>
    </footer>
  );
}

export function Home() {

return (

<html id="html">
 <div>
  

<Base/>


</div>

<div>
<PieDePagina />

</div>
</html>

  )

}



