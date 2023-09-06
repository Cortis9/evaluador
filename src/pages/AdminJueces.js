import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/UI/Sidebar'
import TopBar from '../components/UI/TopBar'
import DataTable from 'react-data-table-component';
import DAO from '../components/Logic/DAO'
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Form from '../components/UI/Form'
import FormEdit from '../components/UI/FormEdit';
import * as alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

const AdminJueces = () => {
    const { getAll, createItem, updateItem, deleteItem, getOrderByLimit, getWhere } = DAO();
    const [jueces, setJueces] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState("");
    const [showFormEdit, setShowFormEdit] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const estructura = useRef([
        { nombre: "Nombre", tipo: "text" },
        { nombre: "Apellidos", tipo: "text" },
    ]);
    const editId = useRef(-1);
    const [inputs, setInputs] = useState(Array(estructura.current.length).fill(""));
    const [inputsEdit, setInputsEdit] = useState(Array(estructura.current.length).fill(""));

    useEffect(() => {
        let retrieve = async () => {
            let data = await getWhere("juez", "rol", "==", "Juez");
            if (data.length > 0) {
                data = data.map((juez, idx) => {
                    return {
                        id: idx,
                        Id: juez.Id,
                        nombre: juez.nombre,
                        apellidos: juez.apellidos,
                    }
                })
                setJueces(data);
            }
        }
        retrieve();
    }, []);

    const columns = [
        {
            name: 'Id',
            selector: row => row.Id,
            filterable: true,
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            filterable: true,
        },
        {
            name: 'Apellidos',
            selector: row => row.apellidos,
            filterable: true,
        },
        {
            cell: row => (
                <>
                    <FaEdit style={{ color: "green", "fontSize": "1.5em", "marginRight": "10px" }} onClick={() => openEditForm(row.id)} />
                    <FaTrashAlt style={{ color: "red", "fontSize": "1.5em" }} onClick={() => deleteJuez(row.id)} />
                </>
            )
        }
    ];

    const deleteJuez = async (id) => {
        console.log(id)
        alertify.confirm("Anahuac Mayab", "¿Estas seguro de eliminar este juez?", async () => {
            let res = await deleteItem("juez", jueces[id].Id);
            if (!res.error) {
                let dataa = jueces.filter((juez, idx) => idx !== id).map((juez, idx) => {
                    return {
                        id: idx,
                        Id: juez.Id,
                        nombre: juez.nombre,
                        apellidos: juez.apellidos,
                    }
                })
                setJueces(dataa);
                alertify.success("Juez eliminado");
            } else {
                alertify.error("Error al eliminar el juez");
            }
        }, () => { alertify.error('Cancel'); });
    }

    const openEditForm = (id) => {
        editId.current = id;
        setInputsEdit(Object.values(jueces[id]).slice(2));
        setShowFormEdit(true);
    }

    const editJuez = async (juezInfo) => {
        try {
            let juezLooked = jueces[editId.current];
            let newObj = {
                Id: juezLooked.Id,
                nombre: juezInfo.Nombre,
                apellidos: juezInfo.Apellidos,
            };
            let res = await updateItem("juez", newObj.Id, newObj);
            if (!res.error) {
                let idx = jueces.indexOf(juezLooked);
                setJueces(jueces.map((juez, i) => idx === i ? { id: juez.id, ...newObj } : juez));
                setShowFormEdit(false);
                alertify.alert('Anahuac Mayab', 'Juez editado!', () => { alertify.success('Ok'); });
            } else alertify.alert('Anahuac Mayab', '¡No se pudo editar el juez, intentelo de nuevo!', () => { alertify.success('Ok'); });
        } catch (error) {
            console.log(error)
        }
    }

    const createJuez = async (juezInfo) => {
        try {
            let newObj = {
                nombre: juezInfo.Nombre.trim().toUpperCase(),
                apellidos: juezInfo.Apellidos.trim().toUpperCase(),
                isLoggedIn: false,
                rol: "Juez",
                password: "ConcursoMayab",
                user: juezInfo.Apellidos.trim().toUpperCase() + "_" + juezInfo.Nombre.trim().toUpperCase(),
            };
            newObj.Id = await getOrderByLimit("juez", "Id", "desc", 2);
            newObj.Id = newObj.Id[1].Id + 1;
            let res = await createItem("juez", newObj, newObj.Id);
            if (!res.error) {
                setJueces([...jueces, { id: jueces.length, ...newObj }]);
                setShowForm(false);
                alertify.alert('Anahuac Mayab', 'Juez agregado!', () => { alertify.success('Ok'); });
            } else alertify.alert('Anahuac Mayab', '¡No se pudo agregar el juez, intentelo de nuevo!', () => { alertify.success('Ok'); });
        } catch (error) {
            console.log(error)
        }
    }

    const cargarCSV = async (fileHandler) => {
        try {
            let data = fileHandler.split(/\r?\n/);
            let titulos = data.shift().split(",");
            let juecesToSave = [];
            data.forEach((line) => {
                let linea = line.split(",");
                let newObj = {}
                linea.forEach((element, idx) => {
                    newObj[titulos[idx]] = element
                })
                juecesToSave.push(newObj);
            })
            setShowAnimation(true);
            let juecesToAdd = [];
            let counter = 0;
            for await (let juez of juecesToSave) {
                let newId = await getOrderByLimit("juez", "Id", "desc", 2);
                newId = newId[1];
                let dataToAdd = {
                    Id: Number(newId.Id) + 1,
                    nombre: juez.Nombre,
                    apellidos: juez.Apellidos,
                    isLoggedIn: false,
                    rol: "Juez",
                    password: "ConcursoMayab",
                    user: juez.Apellidos.trim().toUpperCase() + "_" + juez.Nombre.trim().toUpperCase(),
                }
                let res = await createItem("juez", dataToAdd, dataToAdd.Id.toString());
                if (!res.error) {
                    dataToAdd = {
                        id: jueces.length + counter,
                        Id: dataToAdd.Id,
                        nombre: juez.Nombre,
                        apellidos: juez.Apellidos
                    }
                    counter += 1;
                    juecesToAdd.push(dataToAdd);
                }
            }
            setJueces([...jueces, ...juecesToAdd]);
            setShowAnimation(false);
            alertify.alert('Anahuac Mayab', 'Preguntas agregadas!', () => { alertify.success('Ok'); });
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
        alertify.confirm("Anahuac Mayab", "¿Estas seguro de eliminar este juez?", async () => {
            setShowAnimation(true);
            for await (let juez of jueces) {
                await deleteItem("juez", juez.Id);
            }
            setJueces([]);
            setShowAnimation(false);
            alertify.success("Carteles eliminados");
        }, () => { alertify.error('Cancel'); });
    }

    return (
        <>
            <Sidebar></Sidebar>
            <TopBar titulo="Administración de jueces"></TopBar>
            <div className="workSpace">
                {!showFormEdit && <button className="btnAdd" onClick={() => !showForm ? setShowForm(true) : setShowForm(false)}>{showForm ? "Cerrar" : "Añadir juez"}</button>}
                <input type="file" name="File" id="File" accept=".csv" value={selectedFile} onChange={(e) => handleFileSelect(e)}></input>
                <label htmlFor="File">Importar jueces</label>
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
                {showForm && <Form txtBtn="Guardar Juez" estructura={estructura.current} guardarNuevoFn={createJuez} inputs={inputs} setInputs={setInputs}></Form>}
                {showFormEdit && <button className="btnAdd" onClick={() => setShowFormEdit(false)}>Cerrar</button>}
                {showFormEdit && <FormEdit txtBtn="Editar Juez" estructura={estructura.current} editarCartelFn={editJuez} inputsEdit={inputsEdit} setInputsEdit={setInputsEdit}></FormEdit>}
                <br />
                <label htmlFor="searchTerm" style={{width: 'fit-content'}}>Buscar:</label>
                <input type="text" name="searchTerm" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                <DataTable
                    pagination="true"
                    columns={columns}
                    data={jueces.filter((item) => {
                        if (searchTerm === "") {
                            return item;
                        } else if (
                            item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                        ) {
                            return item;
                        }
                    })}
                />
            </div>
        </>
    )
};

export default AdminJueces;