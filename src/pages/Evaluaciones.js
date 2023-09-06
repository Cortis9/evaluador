import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import DataTable from 'react-data-table-component';
import DAO from '../components/Logic/DAO'
import * as alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

const Evaluaciones = () => {
    const { getWhere, getAll, deleteItem } = DAO();
    const [showAnimation, setShowAnimation] = useState(false);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        let retrieve = async () => {
            let data = await getWhere("cartel", "evaluado", "==", true);
            let newArray = data.length === 1 ? data : [];
            if (data.length > 1) {
                data.forEach((cartel, i) => {
                    newArray.push({
                        id: i,
                        clave: cartel.clave,
                        titulo: cartel.titulo,
                        autor: cartel.autor,
                        juez: cartel.juez,
                        puntos: cartel.totalPuntajeForma + cartel.totalPuntajeContenido + cartel.totalPuntajePertinencia,
                        ptsForma: cartel.totalPuntajeForma,
                        ptsContenido: cartel.totalPuntajeContenido,
                        ptsPertinencia: cartel.totalPuntajePertinencia,
                        calidadSupervision: "Suficiente",
                        link: cartel.link,
                    })
                })
                // for await (let evaluacion of data) {
                //     let cartel = await getWhere("cartel", "clave", "==", evaluacion.clave);
                //     if (!cartel.error) {
                //         let juez = await getWhere("juez", "id", "==", cartel.juez);
                //         i = i + 1;
                //         newArray.push({
                //             id: i,
                //             clave: evaluacion.clave,
                //             titulo: cartel.titulo,
                //             autor: cartel.autor,
                //             juez: juez.nombre + " " + juez.apellidos,
                //             puntos: "60",
                //             ptsForma: evaluacion.totalPuntosF,
                //             ptsContenido: evaluacion.totalPuntosC,
                //             ptsPertinencia: evaluacion.totalPuntosP,
                //             calidadSupervision: "Suficiente",
                //             link: cartel.link,
                //         })
                //     }
                // }
                // console.log()
            }
            setEvaluaciones(!data.error && newArray);
        }
        retrieve();
    }, []);

    const columns = [
        {
            name: 'Clave',
            selector: row => row.clave,
            width: "100px"
        },
        {
            name: 'Titulo',
            selector: row => row.titulo,
            width: "250px"
        },
        {
            name: 'Autor',
            selector: row => row.autor,
            width: "200px"
        },
        {
            name: 'Juez',
            selector: row => row.juez,
            width: "70px"
        },
        {
            name: 'Puntos',
            selector: row => row.puntos,
            width: "70px"
        },
        {
            name: 'Pts. de forma',
            selector: row => row.ptsForma,
            width: "120px"
        },
        {
            name: 'Pts. de contenido',
            selector: row => row.ptsContenido,
            width: "120px"
        },
        {
            name: 'Pts. de pertinencia',
            selector: row => row.ptsPertinencia,
            width: "120px"
        },
        {
            name: 'Calidad de supervisión',
            selector: row => row.calidadSupervision,
            width: "120px"
        },
        {
            name: 'Link',
            selector: row => row.link,
        },
    ];

    const exportarInfo = async () => {
        setShowAnimation(true);
        const titulos = ["Nombre del Evaluador", "Clave QR", "Nombre del Cartel", "Seleccionar Rubrica"];

        let csvContent = "";

        csvContent += titulos.join("|") + "|";
        let preguntas = await getAll("pregunta");
        let preguntasUnicas = Array.from(new Set(preguntas.map(val => val.titulo)));
        preguntasUnicas = preguntasUnicas.filter(val => val !== "GRAMATICA" && val !== "CARTEL EN INGLÉS")
        csvContent += preguntasUnicas.join("|") + "|" + "Puntos en ingles" + "|" + "Puntos de Contenido" + "|" + "Puntos de Forma" + "|" + "Puntos de Pertinencia" + "|" + "TOTAL";
        csvContent += "\r\n";

        let cartelesEvaluados = await getWhere("cartel", "evaluado", "==", true);
        let jueces = await getAll("juez");
        for await (let cartelEvaluado of cartelesEvaluados) {
            let juez = jueces.find(juez => juez.Id == cartelEvaluado.juez);
            csvContent += juez.nombre + " " + juez.apellidos + "|";
            csvContent += cartelEvaluado.clave + "|";
            csvContent += cartelEvaluado.titulo + "|";
            csvContent += cartelEvaluado.tipo + "|";

            csvContent += preguntasUnicas.map(val => {
                console.log(val);
                console.log(cartelEvaluado.puntajesContenido);
                if (cartelEvaluado.puntajesContenido.map(v => Object.keys(v)[0]).includes(val))
                    return Object.values(cartelEvaluado.puntajesContenido.find(v => Object.keys(v)[0] == val))[0];
                else if (cartelEvaluado.puntajesForma.map(v => Object.keys(v)[0]).includes(val))
                    return Object.values(cartelEvaluado.puntajesForma.find(v => Object.keys(v)[0] == val))[0];
                else if (cartelEvaluado.puntajesPertinencia.map(v => Object.keys(v)[0]).includes(val))
                    return Object.values(cartelEvaluado.puntajesPertinencia.find(v => Object.keys(v)[0] == val))[0];
                else return "";
            }).join("|");
            let ingles = cartelEvaluado.puntajesIngles.every(v => Object.values(v)[0] == 1) ? "5" : "0";
            csvContent += "|" + ingles;
            csvContent += "|" + (cartelEvaluado.totalPuntajeContenido).toString();
            csvContent += "|" + (cartelEvaluado.totalPuntajeForma).toString();
            csvContent += "|" + (cartelEvaluado.totalPuntajePertinencia).toString();
            csvContent += "|" + (cartelEvaluado.totalPuntajeContenido + cartelEvaluado.totalPuntajeForma + cartelEvaluado.totalPuntajePertinencia).toString();
            csvContent += "\r\n";
        }
        setShowAnimation(false);
        var universalBOM = "\uFEFF";
        var link = document.createElement("a");
        link.setAttribute('href', 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + csvContent));
        link.setAttribute("download", "evaluaciones.csv");
        document.body.appendChild(link);
        link.click();
    }

    const eliminarTodo = async () => {
        alertify.confirm("Anahuac Mayab", "¿Estas seguro de eliminar este cartel?", async () => {
            setShowAnimation(true);
            for await (let cartel of evaluaciones) {
                await deleteItem("cartel", cartel.clave);
            }
            setEvaluaciones([]);
            setShowAnimation(false);
            alertify.success("Carteles eliminados");
        }, () => { alertify.error('Cancel'); });
    }

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Evaluaciones"></TopBar>
            <div className="workSpace">
                <button className='btnExportar' onClick={() => exportarInfo()}>Exportar evaluaciones</button>
                <button className='btnEliminarTodo' onClick={() => eliminarTodo()}>Eliminar todo</button>
                {showAnimation &&
                    <div id="loaderAnim" >
                        <div className="sk-chase">
                            <div className="sk-chase-dot"></div>
                            <div className="sk-chase-dot"></div>
                            <div className="sk-chase-dot"></div>
                            <div className="sk-chase-dot"></div>
                            <div className="sk-chase-dot"></div>
                            <div className="sk-chase-dot"></div>
                        </div>
                    </div>}
                <br />
                <label htmlFor="searchTerm" style={{ width: 'fit-content' }}>Buscar:</label>
                <input type="text" name="searchTerm" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <DataTable
                    pagination="true"
                    columns={columns}
                    data={evaluaciones.filter((item) => {
                        if (searchTerm === "") {
                            return item;
                        } else if (
                            item.clave.toLowerCase().includes(searchTerm.toLowerCase())
                        ) {
                            return item;
                        }
                    })}
                />
            </div>
        </>
    )
};

export default Evaluaciones;
