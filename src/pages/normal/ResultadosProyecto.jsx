import React, { useEffect, useState, useRef } from 'react';
import { Base } from "../normal/Base";
import { Chart } from 'chart.js/auto';
import '../../styles/ResultadosProyecto.css';

export function ResultadosProyecto() {
  const [resultados, setResultados] = useState([]);
  const [calificacionFinal, setCalificacionFinal] = useState(0);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const proyectoId = searchParams.get('proyectoId');

    const obtenerResultados = async () => {
      try {
        const response = await fetch(`http://localhost:3002/resultados/${proyectoId}`);
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
        const response = await fetch(`http://localhost:3002/calificacion/${proyectoId}`);
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


  return (
    <div>
      <Base />

      <div id="contenedor">
        <h2 id="titulo">Resultados</h2>
        <div className="chart-container">
          <canvas ref={chartRef} id="grafica"></canvas>
        </div>
        </div>
    </div>
  );
}
