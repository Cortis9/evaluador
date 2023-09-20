import React, { useState, useEffect } from 'react';
import '../../styles/admin/Registro.css';
import { Base } from '../admin/BaseAdmin';

export function Registro() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [rubrica, setRubrica] = useState('');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [rubricOptions, setRubricOptions] = useState([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');

  const handleTitleChange = (event) => {
    const value = event.target.value.replace(/(^['"]|['"]$)/g, '');
    setTitulo(value);
  };

  const handleCategoryChange = (event) => {
    setCategoria(event.target.value);
  };

  const handleRubricChange = (event) => {
    setRubrica(event.target.value);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
    } else {
      const fileLinkValue = event.target.value;
      setLink(fileLinkValue);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = {
      titulo,
      nombre,
      correo,
      categoria,
      rubrica: rubrica.split('-')[0].trim(), 
      link
    };

    try {
      const response = await fetch('https://api-git-main-cortis9.vercel.app/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        window.alert('Datos enviados con éxito');
        setTitulo('');
        setCategoria('');
        setRubrica('');
        setFile(null);
        setLink('');
        setNombre('');
        setCorreo('');
      } else {
        console.error('Error al registrar el proyecto');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };



  const handleCSVUpload = async (event) => {
    event.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api-git-main-cortis9.vercel.app/upload-csv', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        setUploadStatus('Carga exitosa');
  
        
      } else {
        setUploadStatus('Error al cargar el archivo CSV');
        console.error('Error al cargar el archivo CSV');
      }
    } catch (error) {
      setUploadStatus('Error al realizar la carga');
      console.error('Error al realizar la solicitud:', error);
    }
  };
  
  
  
  useEffect(() => {
    const fetchRubricOptions = async () => {
      try {
        const response = await fetch('https://api-git-main-cortis9.vercel.app/rubricas');
        if (response.ok) {
          const data = await response.json();
          setRubricOptions(data);
        } else {
          console.error('Error al obtener las rubricas');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    };

    fetchRubricOptions();
  }, []);

  return (
    <html>
         <Base />

     

         <div id="archivo">
      <label id="custom-file-upload" htmlFor="inputarchivo">
        
      </label>
      <input
        id="inputarchivo"
        type="file"
        name="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      {file && !uploadStatus && <span id="nombrearchivo">{file.name}</span>}
      <button onClick={handleCSVUpload} id="botonarchivo">
        Enviar
      </button>
      {uploadStatus && <div id="uploadStatus">{uploadStatus}</div>}
    </div>

          

          <form onSubmit={handleSubmit} id='form'>
            <div id='participantes'>
              <label htmlFor="title">Título:</label>
              <input type="text" id="title" name="title" 
              placeholder="Título" onChange={handleTitleChange} value={titulo} />
            </div>

            <div id='participantes'>
              <div>
                <label>Nombre:</label>
                <div>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre completo o de grupo"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label>Correo electrónico:</label>
                <div>
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo electrónico"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div id="categoria">
              <label>Categoría:</label>
              <div>
                <input type="text" name="category" placeholder="Ingresa la categoría" value={categoria} onChange={handleCategoryChange} />
              </div>
            </div>

            <div id="rubrica">
              <label htmlFor="rubric">Rúbrica:</label>
              <select id="rubric" name="rubric" value={rubrica} onChange={handleRubricChange}>
                <option value="">Selecciona una rúbrica</option>
                {rubricOptions.map((rubricOption) => (
                  <option key={rubricOption.id} value={rubricOption.id}>
                    {rubricOption.id} - {rubricOption.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div id="link">
              <label htmlFor="archivo">Enlace del archivo:</label>
              <input type="text" name="fileLink" placeholder="Ingresa el enlace" value={link} onChange={handleFileChange} />
            </div>

            <button type="submit" id='submit'>Registrar proyecto</button>

          </form>


    </html>
  );
}
