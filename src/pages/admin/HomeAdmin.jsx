import React from "react";
import {Base} from '../admin/BaseAdmin'

function PieDePagina() {
  const anioActual = new Date().getFullYear();

  return (
    <footer id="pie">
      <p>© Evaluador - {anioActual}</p>
    </footer>
  );
}

export function HomeAdmin() {

  return (


<html id="html">
<div>

 <Base />

<PieDePagina />

</div>
</html>

  );

}



