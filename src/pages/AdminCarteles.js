import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import DataTable from 'react-data-table-component';
import DAO from '../components/Logic/DAO'
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Form from '../components/UI/Form'
import FormEdit from '../components/UI/FormEdit';
import '../components/Style/loader.css';
import * as alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

const AdminCarteles = () => {
    const { getAll, createItem, updateItem, deleteItem } = DAO();
    const [carteles, setCarteles] = useState([]);
    const [jueces, setJueces] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showFormEdit, setShowFormEdit] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const estructura = useRef([
        { nombre: "Clave", tipo: "text" },
        { nombre: "Titulo", tipo: "text" },
        { nombre: "Juez", tipo: "number" },
        { nombre: "Tipo", tipo: "text" },
        { nombre: "Link", tipo: "text" }
    ]);
    const [inputs, setInputs] = useState(Array(estructura.current.length).fill(""));
    const [inputsEdit, setInputsEdit] = useState(Array(estructura.current.length).fill(""));

    useEffect(() => {
        let retrieve = async () => {
            let data = await getAll("cartel");
            if (data.length > 0) {
                data = data.map((cartel, idx) => {
                    return {
                        id: idx,
                        clave: cartel.clave,
                        titulo: cartel.titulo,
                        juez: cartel.juez,
                        nombreJuez: cartel.juez,
                        tipo: cartel.tipo,
                        link: cartel.link
                    }
                })
                setCarteles(data);
            }
            data = await getAll("juez");
            !data.error && setJueces(data);
        }
        retrieve();
    }, []);

    useEffect(() => {
        if (jueces.length > 0) {
            setCarteles(carteles.map(cartel => {
                let jCorrespondiente = jueces.find(juez => juez.Id == cartel.juez)
                return { ...cartel, nombreJuez: jCorrespondiente?.nombre + " " + jCorrespondiente?.apellidos }
            }));
        }
    }, [jueces]);

    const columns = [
        {
            name: 'Clave',
            selector: row => row.clave,
            sortable: true,
            width: "100px"
        },
        {
            name: 'Titulo',
            selector: row => row.titulo,
            sortable: true,
            width: "200px"
        },
        {
            name: 'Juez',
            selector: row => row.juez,
            sortable: true,
            width: "100px"
        },
        {
            name: 'Nombre del juez',
            selector: row => row.nombreJuez,
            sortable: true,
            width: "250px"
        },
        {
            name: 'Tipo',
            selector: row => row.tipo,
            sortable: true,
            width: "150px"
        },
        {
            name: 'Link',
            selector: row => row.link,
            sortable: true,
            width: "150px"
        },
        {
            cell: row => (
                <>
                    <FaEdit style={{ color: "green", "fontSize": "1.5em", "marginRight": "10px" }} onClick={() => openEditForm(row.id)} />
                    <FaTrashAlt style={{ color: "red", "fontSize": "1.5em" }} onClick={() => deleteCartel(row.id)} />
                </>
            )
        }
    ];

    const deleteCartel = async (id) => {
        console.log(id)
        alertify.confirm("Anahuac Mayab", "¿Estas seguro de eliminar este cartel?", async () => {
            let res = await deleteItem("cartel", carteles[id].clave);
            if (!res.error) {
                let dataa = carteles.filter((cartel, idx) => idx !== id).map((cartel, idx) => {
                    return {
                        id: idx,
                        clave: cartel.clave,
                        titulo: cartel.titulo,
                        juez: cartel.juez,
                        nombreJuez: cartel.nombreJuez,
                        tipo: cartel.tipo,
                        link: cartel.link
                    }
                })
                setCarteles(dataa);
                alertify.success("Cartel eliminado");
            } else {
                alertify.error("Error al eliminar cartel");
            }
        }, () => { alertify.error('Cancel'); });
    }

    const openEditForm = (id) => {
        console.log(id)
        setInputsEdit(Object.values(carteles[id]).slice(1));
        setShowFormEdit(true);
    }

    const editCartel = async (cartelInfo) => {
        try {
            let newObj = {
                clave: cartelInfo.Clave,
                titulo: cartelInfo.Titulo,
                juez: cartelInfo.Juez,
                tipo: cartelInfo.Tipo,
                link: cartelInfo.Link
            };
            let res = await updateItem("cartel", newObj.clave, newObj);
            if (!res.error) {
                let cartelLookedFor = carteles.find(cartel => cartel.clave === newObj.clave);
                let idx = carteles.indexOf(cartelLookedFor);
                setCarteles(carteles.map((cartel, i) => idx === i ? { id: cartel.id, ...newObj, nombreJuez:cartel.nombreJuez } : cartel));
                setShowFormEdit(false);
                alertify.alert('Anahuac Mayab', '¡Cartel editado!', () => { alertify.success('Ok'); });
            } else alertify.alert('Anahuac Mayab', '¡No se pudo editar el cartel, intentelo de nuevo!', () => { alertify.success('Ok'); });
        } catch (error) {
            console.log(error)
        }
    }

    const createCartel = async (cartelInfo) => {
        try {
            let newObj = {
                clave: cartelInfo.Clave,
                titulo: cartelInfo.Titulo,
                juez: cartelInfo.Juez,
                tipo: cartelInfo.Tipo,
                link: cartelInfo.Link
            };
            let res = await createItem("cartel", newObj, newObj.clave);
            if (!res.error) {
                let juezCorrespondiente = jueces.find(juez => juez.Id == newObj.juez);
                console.log(juezCorrespondiente);
                setCarteles([...carteles, { id: carteles.length, ...newObj, 
                    nombrejuez: (juezCorrespondiente.nombre + " " + juezCorrespondiente.apellidos)}]);
                setShowForm(false);
                alertify.alert('Anahuac Mayab', '¡Cartel agregado!', () => { alertify.success('Ok'); });
            } else alertify.alert('Anahuac Mayab', '¡No se pudo agregar el cartel, intentelo de nuevo!', () => { alertify.success('Ok'); });
        } catch (error) {
            console.log(error)
        }
    }

    const cargarCSV = async (fileHandler) => {
        try {
            let data = fileHandler.split(/\r?\n/);
            let titulos = data.shift().split(",");
            let cartelesToSave = [];
            data.forEach((line) => {
                let linea = line.split(",");
                let newObj = {}
                linea.forEach((element, idx) => {
                    newObj[titulos[idx]] = element
                })
                cartelesToSave.push(newObj);
            })
            let cartelesToAdd = [];
            let counter = 0;
            setShowAnimation(true);
            for await (let cartel of cartelesToSave) {
                let dataToAdd = {
                    //id: carteles.length,
                    clave: cartel.Clave.toString(),
                    titulo: cartel.Titulo,
                    juez: cartel.Juez,
                    //nombreJuez: cartel["Nombre del juez"],
                    tipo: cartel.Tipo,
                    link: cartel.Link
                }
                let res = await createItem("cartel", dataToAdd, dataToAdd.clave);
                if (!res.error) {
                    dataToAdd = {
                        id: carteles.length + counter,
                        clave: cartel.Clave.toString(),
                        titulo: cartel.Titulo,
                        juez: cartel.Juez,
                        nombreJuez: jueces.find(juez => juez.Id == dataToAdd.juez)?.nombre + " " + jueces.find(juez => juez.Id == dataToAdd.juez)?.apellidos,
                        tipo: cartel.Tipo,
                        link: cartel.Link
                    }
                    counter += 1;
                    cartelesToAdd.push(dataToAdd);
                }
            }
            setCarteles([...carteles, ...cartelesToAdd]);
            setShowAnimation(false);
            alertify.alert('Anahuac Mayab', '¡Carteles agregados!', () => { alertify.success('Ok'); });
        } catch (error) {
            console.log(error)
        }

    }


    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            console.log(text);
            cargarCSV(text);
        }
        reader.readAsText(file);
    }

    const eliminarTodo = async () => {
        alertify.confirm("Anahuac Mayab", "¿Estas seguro de eliminar este cartel?", async () => {
            setShowAnimation(true);
            for await (let cartel of carteles) {
                await deleteItem("cartel", cartel.clave);
            }
            setCarteles([]);
            setShowAnimation(false);
            alertify.success("Carteles eliminados");
        }, () => { alertify.error('Cancel'); });
    }

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Administración de carteles"></TopBar>
            <div className="workSpace">
                {!showFormEdit && <button className="btnAdd" onClick={() => !showForm ? setShowForm(true) : setShowForm(false)}>{showForm ? "Cerrar" : "Añadir cartel"}</button>}
                <input type="file" name="File" id="File" accept=".csv" value={selectedFile} onChange={(e) => handleFileSelect(e)}></input>
                <label htmlFor="File">Importar carteles</label>
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
                {showForm && <Form txtBtn="Guardar Cartel" estructura={estructura.current} guardarNuevoFn={createCartel} inputs={inputs} setInputs={setInputs}></Form>}
                {showFormEdit && <button className="btnAdd" onClick={() => setShowFormEdit(false)}>Cerrar</button>}
                {showFormEdit && <FormEdit txtBtn="Editar Cartel" estructura={estructura.current} editarCartelFn={editCartel} inputsEdit={inputsEdit} setInputsEdit={setInputsEdit}></FormEdit>}
                <br />
                <label htmlFor="searchTerm" style={{ width: 'fit-content' }}>Buscar:</label>
                <input type="text" name="searchTerm" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <DataTable
                    pagination="true"
                    columns={columns}
                    data={carteles.filter((item) => {
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

export default AdminCarteles;