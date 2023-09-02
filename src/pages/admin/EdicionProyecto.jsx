import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Base} from '../admin/BaseAdmin'
import '../../styles/Edicionproyecto.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export const EdicionProyecto = () => {
  const { proyectoId } = useParams();
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState({
    titulo: '',
    nombre: '',
    correo: '',
    categoria: '',
    rubrica: '',
    link: ''
  });

  useEffect(() => {
    fetchProyecto();
  }, [proyectoId]);

  const fetchProyecto = async () => {
    try {
      const response = await fetch(`evaluador.vercel.app/proyectos/${proyectoId}`);
      const data = await response.json();
      setEditedData(data);
    } catch (error) {
      console.error('Error al obtener el proyecto: ', error);
    }
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`evaluador.vercel.app/proyectos/${proyectoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        window.alert('Proyecto actualizado con éxito');
      } else {
        console.error('Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error al guardar los cambios: ', error);
    }
  };

  const handleGoBack = () => {
    navigate('/edicion');
  };

  return (
    <div>
      <Base />

 
        <form onSubmit={handleSubmit} id='form3'>
        <button onClick={handleGoBack} id='bregresa'>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

          <div>
            <label htmlFor='titulo'>Título:</label>
            <input type='text' id='tituloedicion' name='titulo' value={editedData.titulo} onChange={handleInputChange} />
          </div>

          <div>
            <label htmlFor='nombre'>Nombre:</label>
            <input type='text' id='nombreedicion' name='nombre' value={editedData.nombre} onChange={handleInputChange} />
          </div>

          <div>
            <label htmlFor='correo'>Correo electrónico:</label>
            <input type='email' id='correo' name='correo' value={editedData.correo} onChange={handleInputChange} />
          </div>

          <div>
            <label htmlFor='categoria'>Categoría:</label>
            <input type='text' id='categoriaedicion' name='categoria' value={editedData.categoria} onChange={handleInputChange} />
          </div>

          <div>
            <label htmlFor='rubrica'>Rúbrica:</label>
            <input type='text' id='rubricaeidicon' name='rubrica' value={editedData.rubrica} onChange={handleInputChange} />
          </div>

          <div>
            <label htmlFor='link'>Enlace del archivo:</label>
            <input type='text' id='linkedicion' name='link' value={editedData.link} onChange={handleInputChange} />
          </div>

          <div><button id='botonguardar' type='submit'>Guardar cambios</button></div>

        </form>
      </div>

  );
};