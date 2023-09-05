import React, { useEffect, useState, useRef } from 'react';
import { Base } from "../normal/Base";
import { Chart } from 'chart.js/auto';
import '../../styles/ResultadosProyecto.css';

export function ResultadosProyecto() {
  const [resultados, setResultados] = useState([]);
  const [calificacionFinal, setCalificacionFinal] = useState(0);
  const [puntosExtras, setPuntosExtras] = useState(0);
  const [correo, setCorreo] = useState("");
  const [detalles, setDetalles] = useState("");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const proyectoId = searchParams.get('proyectoId');

    const obtenerResultados = async () => {
      try {
        const response = await fetch(`https://api-omega-amber.vercel.app/resultados/${proyectoId}`);
        if (response.ok) {
          const data = await response.json();
          setResultados(data);
        } else {
          console.error('Error al obtener los resultados');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    };

    obtenerResultados();

    const obtenerCalificacionFinal = async () => {
      try {
        const response = await fetch(`https://api-omega-amber.vercel.app/calificacion/${proyectoId}`);
        if (response.ok) {
          const data = await response.json();
          setCalificacionFinal(data.calificacionFinal);
        } else {
          console.error('Error al obtener la calificación final');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    };

    obtenerCalificacionFinal();
  }, []);

  useEffect(() => {
    if (resultados.length > 0) {
      
      let labels = [];

      for (const result of resultados) {
        
        if (result.puntos && Array.isArray(result.puntos)) {
          labels = result.puntos.map(punto => punto.nombre);
        }
      }
  
      const datasets = resultados.map(result => ({
        label: '', 
        data: result.puntos.map(punto => punto.valor),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }));

      const calificacionFinalData = new Array(labels.length).fill(0);
      calificacionFinalData.push(calificacionFinal);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const chartConfig = {
        type: 'bar',
        data: {
          labels: ['puntos', 'Calificación Final'],
          datasets: [
            ...datasets,
            {
              label: 'Calificación Final',
              data: calificacionFinalData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          tooltips: {
            callbacks: {
              title: function (tooltipItem) {
                const index = tooltipItem[0].datasetIndex;
                return datasets[index].label; 
              },
              label: function (tooltipItem) {
                return tooltipItem.formattedValue; 
              },
            },
          },
        },
      };

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, chartConfig);
    }
  }, [resultados, calificacionFinal]);

  const enviarCambios = async () => {
  
    const camposLlenos = puntosExtras !== 0 && correo !== "" && detalles !== "";
  
    if (camposLlenos) {
      try {
        const data = {
          puntosextra: puntosExtras,
          correopuntosextra: correo,
          detallepuntosextra: detalles,
        };
  
        const searchParams = new URLSearchParams(window.location.search);
        const proyectoId = searchParams.get('proyectoId');
        
        const response = await fetch(`https://api-omega-amber.vercel.app/puntosextra/${proyectoId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        if (response.ok) {
          console.log("Cambios enviados con éxito");
        } else {
          console.error("Error al enviar cambios");
        }
      } catch (error) {
        console.error("Error al enviar cambios:", error);
      }
    } else {
      alert("Por favor, rellena todos los campos y asegúrate de que los puntos extras sean diferentes de 0.");
    }
  };
  
  
  
  return (
    <div>
      <Base />
  
      <div id="contenedor">
        <h2 id="titulo">Resultados</h2>
        <div className="chart-container">
          <canvas ref={chartRef} id="grafica"></canvas>
        </div>
        <div id="inputs">
          <label htmlFor="puntosExtras">Puntos Extras:</label>
          <input
            type="number"
            id="puntosExtras"
            value={puntosExtras}
            onChange={(e) => setPuntosExtras(Number(e.target.value))}
          />
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <label htmlFor="detalles">Detalles:</label>
          <textarea
            id="detalles"
            value={detalles}
            onChange={(e) => setDetalles(e.target.value)}
          ></textarea>

          <div><button id='btenviar' onClick={enviarCambios}>Enviar Cambios</button></div>
          

        </div>
      </div>
    </div>
  );
}
