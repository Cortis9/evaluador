import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import multerS3 from 'multer-s3';
import csv from 'csv-parser';
import fs from 'fs';
import nodemailer from 'nodemailer';
import mysql2 from 'mysql2/promise';
import mysql from 'mysql';
import { S3Client } from '@aws-sdk/client-s3'; 
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/routers/routes.jsx';

const app = express();
app.use(bodyParser.json());
app.use(cors());


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

const s3 = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: 'AKIAU5W6SFMUCVAAGBRX',
    secretAccessKey: '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'
  }
});


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bucketevaluadorp',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE, 
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});



const connection = mysql.createConnection({
  host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'Mayab2023',
  database: 'registros'
});

connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos: ', error);
    return;
  }
  console.log('Conexión exitosa a la base de datos!');
});

connection.query(`
CREATE TABLE IF NOT EXISTS rubricas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255)
)
`);
connection.query(`
CREATE TABLE IF NOT EXISTS titulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rubricaId INT,
  titulo VARCHAR(255)
)
`);
connection.query(`
CREATE TABLE IF NOT EXISTS casos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rubricaId INT,
  tituloId INT,
  nombre VARCHAR(255),
  detalle TEXT
);
`);
connection.query(`
CREATE TABLE IF NOT EXISTS puntos (id INT AUTO_INCREMENT PRIMARY KEY, casoId INT, nombre VARCHAR(255), valor INT)
`);
connection.query(`
CREATE TABLE IF NOT EXISTS proyectos (id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255), nombre VARCHAR(255), correo VARCHAR(255), categoria VARCHAR(255), rubrica VARCHAR(255), link VARCHAR(255), estado VARCHAR(255) DEFAULT "no evaluado")
`);
connection.query(`
  CREATE TABLE IF NOT EXISTS resultadoscasos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyectoId INT,
    nombre VARCHAR(255),
    FOREIGN KEY (proyectoId) REFERENCES proyectos(id)
  )
`);
connection.query(`
  CREATE TABLE IF NOT EXISTS resultadospuntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    casoId INT,
    nombre VARCHAR(255),
    valor NUMERIC(10, 2),
    FOREIGN KEY (casoId) REFERENCES resultadoscasos(id)
  )
`);
connection.query(`
  CREATE TABLE IF NOT EXISTS calificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyectoId INT,
    calificacionFinal NUMERIC(10, 2),
    correojuez VARCHAR(255),
    nombrerubrica VARCHAR(255),
    FOREIGN KEY (proyectoId) REFERENCES proyectos(id),
    puntosextra NUMERIC(10, 2),
    correopuntosextra VARCHAR(255),
    detallepuntosextra VARCHAR(255)
  )
`);



app.post('/upload-csv', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se ha proporcionado un archivo CSV' });
  }

  try {
    const projects = [];

    await fs.promises.readFile(file.path, 'utf8');

    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => {
          projects.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    const insertQuery = 'INSERT INTO proyectos (titulo, nombre, correo, categoria, rubrica, link, estado) VALUES (?, ?, ?, ?, ?, ?, ?)';

    const promises = projects.map((project) => {
      const {titulo,nombre, correo, categoria, rubrica, link } = project;
      return new Promise((resolve, reject) => {
        connection.query(insertQuery, [titulo, nombre, correo, categoria, rubrica, link, 'no evaluado'], (error, result) => {
          if (error) {
            console.error('Error al insertar el proyecto: ', error);
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    });

    await Promise.all(promises);

    return res.status(200).json({ message: 'Proyectos registrados correctamente' });
  } catch (error) {
    console.error('Error al procesar el archivo CSV: ', error);
    return res.status(500).json({ error: 'Error al procesar el archivo CSV' });
  } finally {
    fs.promises.unlink(file.path)
      .catch((error) => {
        console.error('Error al eliminar el archivo temporal: ', error);
      });
  }
  });

  app.post('/send-email', upload.single('archivoAdjunto'), async (req, res) => {
    try {
      const { to, subject, text, resultados } = req.body;
      const archivoAdjunto = req.file;
  
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
          user: 'evaluadoruam@gmail.com',
          pass: '0rqBYzOU3HVC5KXL'
        }, tls: {
          rejectUnauthorized: false 
        }
      });
  
      const mailOptions = {
        from: 'evaluadoruam@gmail.com',
        to,
        subject,
        text,
        html: resultados
      };
  
   
      if (archivoAdjunto) {
        fs.readFile(archivoAdjunto.path, (err, data) => {
          if (err) {
            console.error('Error al leer el archivo adjunto:', err);
            res.status(500).json({ error: 'Error al leer el archivo adjunto' });
          } else {
            mailOptions.attachments = [
              {
                filename: archivoAdjunto.originalname,
                content: data,
                contentType: archivoAdjunto.mimetype,
              }
            ];
            enviarCorreo();
          }
        });
      } else {
  
        enviarCorreo();
      }
  
      function enviarCorreo() {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar el correo electrónico:', error);
            res.status(500).json({ error: 'Error al enviar el correo electrónico' });
          } else {
            console.log('Correo electrónico enviado:', info.messageId);
            res.status(200).json({ message: 'Correo electrónico enviado correctamente' });
          }
        });
      }
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      res.status(500).json({ error: 'Error al enviar el correo electrónico' });
    }
  });
  
  app.post('/proyectos', (req, res) => {
    const { titulo, nombre, correo, categoria, rubrica, link } = req.body;
  
    const createTableQuery = 'CREATE TABLE IF NOT EXISTS proyectos (id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255), nombre VARCHAR(255), correo VARCHAR(255), categoria VARCHAR(255), rubrica VARCHAR(255), link VARCHAR(255), estado VARCHAR(255) DEFAULT "no evaluado")';
    connection.query(createTableQuery, (error) => {
      if (error) {
        console.error('Error al crear la tabla: ', error);
        return res.status(500).json({ error: 'Error al crear la tabla' });
      }
  
      const insertQuery = 'INSERT INTO proyectos (titulo, nombre, correo , categoria, rubrica, link, estado) VALUES (?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [titulo, nombre, correo, categoria, rubrica, link, "no evaluado"], (error) => {
        if (error) {
          console.error('Error al insertar el proyecto: ', error);
          return res.status(500).json({ error: 'Error al insertar el proyecto' });
        }
  
        return res.status(200).json({ message: 'Proyecto registrado correctamente' });
      });
    });
  });
  
  app.get('/proyectos', (req, res) => {
    const fetchProyectosQuery = 'SELECT * FROM proyectos';
  
    connection.query(fetchProyectosQuery, (error, results) => {
      if (error) {
        console.error('Error al obtener los proyectos: ', error);
        return res.status(500).json({ error: 'Error al obtener los proyectos' });
      }
  
      return res.status(200).json(results);
    });
  });
  
  app.delete('/proyectos/:id', (req, res) => {
    const proyectoId = req.params.id;
  
    const deleteQuery = 'DELETE FROM proyectos WHERE id = ?';
    connection.query(deleteQuery, [proyectoId], (error) => {
      if (error) {
        console.error('Error al eliminar el proyecto: ', error);
        return res.status(500).json({ error: 'Error al eliminar el proyecto' });
      }
  
      return res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    });
  });

  app.delete('/proyectos', (req, res) => {
    const proyectoId = req.params.id;
  
    const deleteQuery = 'DELETE FROM proyectos';
    connection.query(deleteQuery, [proyectoId], (error) => {
      if (error) {
        console.error('Error al eliminar el proyecto: ', error);
        return res.status(500).json({ error: 'Error al eliminar el proyecto' });
      }
  
      return res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    });
  });
  
  app.put('/proyectos/:id', (req, res) => {
    const proyectoId = req.params.id;
    const { titulo, nombre, correo, categoria, rubrica, link } = req.body;
  
    const updateQuery = 'UPDATE proyectos SET titulo = ?, nombre = ?, correo = ?, categoria = ?, rubrica = ?, link = ? WHERE id = ?';
    connection.query(updateQuery, [titulo, nombre, correo, categoria, rubrica, link, proyectoId], (error) => {
      if (error) {
        console.error('Error al actualizar el proyecto: ', error);
        return res.status(500).json({ error: 'Error al actualizar el proyecto' });
      }
  
      return res.status(200).json({ message: 'Proyecto actualizado correctamente' });
    });
  });
  
  app.put('/proyectos/:id/estado', (req, res) => {
    const proyectoId = req.params.id;
    const { estado } = req.body;
  
    const updateQuery = 'UPDATE proyectos SET estado = ? WHERE id = ?';
    connection.query(updateQuery, [estado, proyectoId], (error) => {
      if (error) {
        console.error('Error al actualizar el estado del proyecto: ', error);
        return res.status(500).json({ error: 'Error al actualizar el estado del proyecto' });
      }
  
      return res.status(200).json({ message: 'Estado del proyecto actualizado correctamente' });
    });
  });
  
  app.get("/proyectos/:id", (req, res) => {
    const proyectoId = req.params.id;
  
    const fetchProyectoQuery = "SELECT * FROM proyectos WHERE id = ?";
  
    connection.query(fetchProyectoQuery, [proyectoId], (error, results) => {
      if (error) {
        console.error("Error al obtener el proyecto: ", error);
        return res.status(500).json({ error: "Error al obtener el proyecto" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
  
      const proyecto = results[0];
      const rubrica = proyecto.rubrica;
  
      return res.status(200).json({ ...proyecto, rubrica });
    });
  });
  
  app.get('/categorias', (req, res) => {
    const fetchCategoriasQuery = 'SELECT DISTINCT categoria FROM proyectos';
  
    connection.query(fetchCategoriasQuery, (error, results) => {
      if (error) {
        console.error('Error al obtener las categorías: ', error);
        return res.status(500).json({ error: 'Error al obtener las categorías' });
      }
  
      const categorias = results.map((result) => result.categoria);
      return res.status(200).json(categorias);
    });
  });
  
  app.get('/resultados/:proyectoId', async (req, res) => {
    try {

      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
      const proyectoId = req.params.proyectoId;
  
      const casosQuery = 'SELECT * FROM resultadoscasos WHERE proyectoId = ?';
      const puntosQuery = 'SELECT * FROM resultadospuntos WHERE casoId IN (SELECT id FROM resultadoscasos WHERE proyectoId = ?)';
  
      const casosResults = await connection.query(casosQuery, [proyectoId]);
      const puntosResults = await connection.query(puntosQuery, [proyectoId]);
  
      const casos = casosResults[0];
      const puntos = puntosResults[0];
  
      const resultados = casos.map(caso => {
        const casoPuntos = puntos.filter(punto => punto.casoId === caso.id);
        return { caso, puntos: casoPuntos };
      });
  
      res.json(resultados);
  
    } catch (error) {
      console.error('Error al obtener los resultados:', error);
      res.status(500).json({ error: 'Error al obtener los resultados' });
    }
  });
  
  app.post('/resultados', async (req, res) => {
    try {
      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
  
      const { proyectoId, casosPuntosRelacionados } = req.body;
  
      await connection.beginTransaction();
  
      for (const casoPunto of casosPuntosRelacionados) {
        const { casoNombre, puntos } = casoPunto;
  
        const [casoExists] = await connection.query(
          'SELECT proyectoId,nombre FROM resultadoscasos WHERE proyectoId = ? AND nombre = ?',
          [proyectoId,casoNombre]
        );
  
        let casoInsertId;
  
        if (casoExists.length === 0) {
         
          const [insertResult] = await connection.query(
            'INSERT INTO resultadoscasos (proyectoId, nombre) VALUES (?, ?)',
            [proyectoId, casoNombre]
          );
  
          casoInsertId = insertResult.insertId;
        } else {
        
          casoInsertId = casoExists[0].id;
        }
  
const [casoIds] = await connection.query('SELECT id FROM resultadoscasos');
const existingCaseIds = casoIds.map(row => row.id);

for (const punto of puntos) {
  const { id, casoId, nombre, valor } = punto;

  const [puntoExists] = await connection.query(
    'SELECT * FROM resultadospuntos WHERE  casoId = ?',
    [casoId]
  );

  if (puntoExists.length > 0) {
    for (const casoE of existingCaseIds) {
    
    if (casoE === casoId) {
        
      await connection.query(
        'UPDATE resultadospuntos SET nombre = ?, valor = ? WHERE casoId = ?',
        [nombre, valor, casoId]
      );
    }
   }
  } else {
    
    await connection.query(
      'INSERT INTO resultadospuntos (casoId, nombre, valor) VALUES (?, ?, ?)',
      [casoId, nombre, valor]
    );
  }
}

 }
        
  
      await connection.commit();
      connection.end();
  
      res.status(200).json({ message: 'Datos actualizados con éxito' });
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      res.status(500).json({ message: 'Error al actualizar los datos' });
    }
  });
  

  app.delete('/resultados', async (req, res) => {
    try {
    
      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
     
      await connection.query('DELETE FROM resultadospuntos');
      await connection.query('DELETE FROM resultadoscasos');
      await connection.query('DELETE FROM calificacion');
  
      
      res.status(200).json({ message: 'Información de todas las tablas eliminada con éxito' });
    } catch (error) {
      
      console.error('Error al eliminar información:', error);
      res.status(500).json({ message: 'Error al eliminar información' });
    }
  });
  

  app.get('/calificacion', (req, res) => {

   connection.query('SELECT * FROM calificacion', (error, results) => {
      if (error) {
        
        res.status(500).json({ error: 'Error al obtener los registros de calificacion' });
      } else {
        
        res.json(results);
      }
    });
  });

  app.post('/calificacion', async (req, res) => {
    try {
      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
  
      const { proyectoId, calificacion, correojuez, NombreRubrica } = req.body;
  
      
      const [registroExistente] = await connection.query(
        'SELECT 1 FROM calificacion WHERE proyectoId = ? LIMIT 1',
        [proyectoId]
      );
  
      if (registroExistente.length > 0) {
        await connection.query(
          'UPDATE calificacion SET calificacionFinal = ?, correojuez = ?, NombreRubrica = ? WHERE proyectoId = ?',
          [calificacion, correojuez, NombreRubrica, proyectoId]
        );
      } else {
       
        await connection.query(
          'INSERT INTO calificacion (proyectoId, calificacionFinal, correojuez, NombreRubrica) VALUES (?, ?, ?, ?)',
          [proyectoId, calificacion, correojuez, NombreRubrica]
        );
      }
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      res.sendStatus(500);
    }
  });
  
  
  app.get('/calificacion/:proyectoId', async (req, res) => {
    try {
      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
      const { proyectoId } = req.params;
  
      const [result] = await connection.query('SELECT calificacionFinal,correoJuez FROM calificacion WHERE proyectoId = ?', [proyectoId]);
  
      if (result && result.length > 0) {
        const { calificacionFinal,correoJuez } = result[0];
        res.status(200).json({calificacionFinal,correoJuez });
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error('Error al obtener la calificación:', error);
      res.sendStatus(500);
    }
  });
  
  app.put('/calificacion/:proyectoId', async (req, res) => {
    try {
      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
      const { proyectoId } = req.params;
      const { calificacionFinal } = req.body;
  
      await connection.query('UPDATE calificacion SET calificacionFinal = ? WHERE proyectoId = ?', [calificacionFinal, proyectoId]);
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error al actualizar la calificación:', error);
      res.sendStatus(500);
    }
  });

  app.post('/puntosextra/:proyectoId', async (req, res) => {
    try {
      const connection = await mysql2.createConnection({
        host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Mayab2023',
        database: 'registros'
      });
      const {
        puntosextra,
        correopuntosextra,
        detallepuntosextra
      } = req.body;
  
      const proyectoId = req.params.proyectoId;
  
      const [existingEntry] = await connection.query(
        'SELECT calificacionFinal FROM calificacion WHERE proyectoId = ?',
        [proyectoId]
      );

      let calificacionFinal = 0; 
  
      if (existingEntry.length > 0) {
        calificacionFinal = parseFloat(existingEntry[0].calificacionFinal);
      }
      

      calificacionFinal += parseFloat(puntosextra);
      
 

if (existingEntry.length > 0) {
  await connection.query(
    'UPDATE calificacion SET puntosextra = ?, correopuntosextra = ?, detallepuntosextra = ? , calificacionFinal = ? WHERE proyectoId = ?',
    [puntosextra, correopuntosextra, detallepuntosextra, calificacionFinal, proyectoId]
  );
}

  
      res.status(201).json({ message: 'Datos insertados o actualizados con éxito en la tabla de calificación' });
    } catch (error) {
      console.error('Error al insertar o actualizar datos en la tabla de calificación:', error);
      res.status(500).json({ message: 'Error al insertar o actualizar datos en la tabla de calificación' });
    }
  });

app.get('/puntosextra/:proyectoId', async (req, res) => {
  const proyectoId = req.params.proyectoId;

  try {
    
    const connection = await mysql2.createConnection({
      host: 'registro-db.cg5whpiiq7xs.us-east-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'Mayab2023',
      database: 'registros'
    });

    
    const [datosAdicionales] = await connection.query(
      'SELECT puntosextra, correopuntosextra, detallepuntosextra FROM calificacion WHERE proyectoId = ?',
      [proyectoId]
    );

   
    await connection.end();

    if (datosAdicionales.length > 0) {
      
      res.status(200).json(datosAdicionales[0]);
    } else {
      
      res.status(404).json({ message: 'No se encontraron datos adicionales para este proyecto' });
    }
  } catch (error) {
    console.error('Error al obtener datos adicionales:', error);
    res.status(500).json({ message: 'Error al obtener datos adicionales' });
  }
});

app.delete('/resultados/:proyectoId', (req, res) => {
  const proyectoId = req.params.proyectoId;

  connection.query('DELETE FROM resultadospuntos WHERE casoId IN (SELECT id FROM resultadoscasos WHERE proyectoId = ?)', [proyectoId], (error, result1) => {
    if (error) {
      console.error('Error al eliminar resultados en la tabla resultadospuntos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }

    connection.query('DELETE FROM resultadoscasos WHERE proyectoId = ?', [proyectoId], (error, result2) => {
      if (error) {
        console.error('Error al eliminar resultados en la tabla resultadoscasos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }

      connection.query('DELETE FROM calificacion WHERE proyectoId = ?', [proyectoId], (error, result3) => {
        if (error) {
          console.error('Error al eliminar resultados en la tabla calificacion:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }

        res.status(200).json({ message: 'Resultados eliminados con éxito' });
      });
    });
  });
});

  app.post('/rubricas', (req, res) => {
    const { rubricaNombre, titulos } = req.body;
  
      const insertQuery = 'INSERT INTO rubricas (nombre) VALUES (?)';
      connection.query(insertQuery, [rubricaNombre], (error, result) => {
        if (error) {
          console.error('Error al insertar la rubrica: ', error);
          connection.rollback(() => {
            connection.release();
            return res.status(500).json({ error: 'Error al insertar la rubrica' });
          });
        }
  
        const rubricaId = result.insertId;
  
        const titulosValues = titulos.map((tituloObj) => [rubricaId, tituloObj.titulo]);
        const insertTitulosQuery = 'INSERT INTO titulos (rubricaId, titulo) VALUES ?';
        connection.query(insertTitulosQuery, [titulosValues], (error, result) => {
          if (error) {
            console.error('Error al insertar los titulos: ', error);
            connection.rollback(() => {
              return res.status(500).json({ error: 'Error al insertar los titulos' });
            });
          }
  
          const casosValues = [];
          const tituloInsertId = result.insertId;
          titulos.forEach((titulo, tituloIndex) => {
            titulo.casos.forEach((caso) => {
              casosValues.push([rubricaId, tituloInsertId + tituloIndex, caso.nombre, caso.detalle]);
            });
          });
          const insertCasosQuery = 'INSERT INTO casos (rubricaId, tituloId, nombre, detalle) VALUES ?';
          connection.query(insertCasosQuery, [casosValues], (error, result) => {
            if (error) {
              console.error('Error al insertar los casos: ', error);
              connection.rollback(() => {
                return res.status(500).json({ error: 'Error al insertar los casos' });
              });
            }
          
          
            const puntosValues = [];
            let casoIdCounter = result.insertId; 
          
            titulos.forEach((titulo) => {
              titulo.casos.forEach((caso, casoIndex) => {
                caso.puntos.forEach((punto) => {
                  puntosValues.push([casoIdCounter, punto.nombre, punto.valor]);
                });
          
                casoIdCounter++; 
              });
            });
          
            const insertPuntosQuery = 'INSERT INTO puntos (casoId, nombre, valor) VALUES ?';
            connection.query(insertPuntosQuery, [puntosValues], (error, result) => {
              if (error) {
                console.error('Error al insertar los puntos: ', error);
                connection.rollback(() => {
                  return res.status(500).json({ error: 'Error al insertar los puntos' });
                });
              }
          

              return res.status(200).json({ message: 'Rubrica, casos y puntos registrados correctamente' });
            });
            });
          });
        });
  });

  app.get('/rubricas', (req, res) => {
    const fetchRubricasQuery = 'SELECT * FROM rubricas';
  
    connection.query(fetchRubricasQuery, (error, results) => {
      if (error) {
        console.error('Error al obtener las rubricas: ', error);
        return res.status(500).json({ error: 'Error al obtener las rubricas' });
      }
  
      return res.status(200).json(results);
    });
  });
  
  app.put('/rubricas/:id', (req, res) => {
    const rubricaId = req.params.id;
    const { rubrica, titulos } = req.body;

    const casos = titulos.flatMap((titulo) => titulo.casos);
    const puntos = casos.flatMap((caso) => caso.puntos);
  
    const updateRubricaQuery = 'UPDATE rubricas SET nombre = ? WHERE id = ?';
    connection.query(updateRubricaQuery, [rubrica.nombre, rubricaId], (error) => {
      if (error) {
        console.error('Error al actualizar la rubrica: ', error);
        return res.status(500).json({ error: 'Error al actualizar la rúbrica' });
      }
  

      const updateTitulosQuery = 'UPDATE titulos SET titulo = ? WHERE id = ?';
      const insertTitulosQuery = 'INSERT INTO titulos (rubricaId, titulo) VALUES (?, ?)';
      titulos.forEach((titulo) => {
        if (titulo.id) {
          connection.query(updateTitulosQuery, [titulo.titulo, titulo.id], (error) => {
            if (error) {
              console.error('Error al actualizar el título: ', error);
              return res.status(500).json({ error: 'Error al actualizar los títulos' });
            }
          });
        } else {
          connection.query(insertTitulosQuery, [rubricaId, titulo.titulo], (error, result) => {
            if (error) {
              console.error('Error al insertar el título: ', error);
              return res.status(500).json({ error: 'Error al insertar los títulos' });
            } else {
              titulo.id = result.insertId;
            }
          });
        }
      });
  

      const updateCasosQuery = 'UPDATE casos SET nombre = ?, detalle = ? WHERE id = ?';
      const insertCasosQuery = 'INSERT INTO casos (rubricaId, tituloId, nombre, detalle) VALUES (?, ?, ?, ?)';
      casos.forEach((caso) => {
        if (caso.id) {
          connection.query(updateCasosQuery, [caso.nombre, caso.detalle, caso.id], (error) => {
            if (error) {
              console.error('Error al actualizar el caso: ', error);
              return res.status(500).json({ error: 'Error al actualizar los casos' });
            }
          });
        } else {
          connection.query(insertCasosQuery, [rubricaId, caso.tituloId, caso.nombre, caso.detalle], (error, result) => {
            if (error) {
              console.error('Error al insertar el caso: ', error);
              return res.status(500).json({ error: 'Error al insertar los casos' });
            } else {
              caso.id = result.insertId;
            }
          });
        }
      });
  

      const updatePuntosQuery = 'UPDATE puntos SET nombre = ?, valor = ? WHERE id = ?';
      const insertPuntosQuery = 'INSERT INTO puntos (casoId, nombre, valor) VALUES (?, ?, ?)';
      puntos.forEach((punto) => {
        if (punto.id) {
          connection.query(updatePuntosQuery, [punto.nombre, punto.valor, punto.id], (error) => {
            if (error) {
              console.error('Error al actualizar el punto: ', error);
              return res.status(500).json({ error: 'Error al actualizar los puntos' });
            }
          });
        } else {
          connection.query(insertPuntosQuery, [punto.casoId, punto.nombre, punto.valor], (error, result) => {
            if (error) {
              console.error('Error al insertar el punto: ', error);
              return res.status(500).json({ error: 'Error al insertar los puntos' });
            } else {
              punto.id = result.insertId;
            }
          });
        }
      });
  
      connection.commit((err) => {
        if (err) {
          console.error('Error al confirmar la transacción: ', err);
          connection.rollback(() => res.status(500).json({ error: 'Error al actualizar la rúbrica' }));
        } else {
          return res.status(200).json({ message: 'Rubrica actualizada correctamente' });
        }
      });
    });
  });
  
  app.get('/rubricas/:id', (req, res) => {
      const rubricaId = req.params.id;
    

      const rubricaQuery = 'SELECT * FROM rubricas WHERE id = ?';
    
      connection.query(rubricaQuery, [rubricaId], (error, rubricaResults) => {
        if (error) {
          console.error('Error al obtener los detalles de la rúbrica: ', error);
          return res.status(500).json({ error: 'Error al obtener los detalles de la rúbrica' });
        }
    
        if (rubricaResults.length === 0) {
          return res.status(404).json({ error: 'Rúbrica no encontrada' });
        }
    
        const rubrica = rubricaResults[0];
    

        const titulosQuery = 'SELECT * FROM titulos WHERE rubricaId = ?';
    
        connection.query(titulosQuery, [rubricaId], (error, titulos) => {
          if (error) {
            console.error('Error al obtener los títulos: ', error);
            return res.status(500).json({ error: 'Error al obtener los títulos' });
          }
    

          const tituloIds = titulos.map((titulo) => titulo.id);
    

          const casosQuery = 'SELECT * FROM casos WHERE tituloId IN (?)';
    
          connection.query(casosQuery, [tituloIds], (error, casos) => {
            if (error) {
              console.error('Error al obtener los casos: ', error);
              return res.status(500).json({ error: 'Error al obtener los casos' });
            }
    
        
            const casoIds = casos.map((caso) => caso.id);
    

            const puntosQuery = 'SELECT * FROM puntos WHERE casoId IN (?)';
    
            connection.query(puntosQuery, [casoIds], (error, puntos) => {
              if (error) {
                console.error('Error al obtener los puntos: ', error);
                return res.status(500).json({ error: 'Error al obtener los puntos' });
              }
    
              const rubricaData = {
                rubrica,
                titulos,
                casos,
                puntos,
              };
    
              res.json(rubricaData);
            });
          });
        });
      });
  });
  
  app.delete('/rubricas/:id', (req, res) => {
    const rubricaId = req.params.id;
  
    const deletePuntosQuery = 'DELETE FROM puntos WHERE casoId IN (SELECT id FROM casos WHERE rubricaId = ?)';
    connection.query(deletePuntosQuery, [rubricaId], (error) => {
      if (error) {
        console.error('Error al eliminar los puntos: ', error);
        return res.status(500).json({ error: 'Error al eliminar los puntos' });
      }
  
      const deleteCasosQuery = 'DELETE FROM casos WHERE rubricaId = ?';
      connection.query(deleteCasosQuery, [rubricaId], (error) => {
        if (error) {
          console.error('Error al eliminar los casos: ', error);
          return res.status(500).json({ error: 'Error al eliminar los casos' });
        }
  
        const deleteTitulosQuery = 'DELETE FROM titulos WHERE rubricaId = ?';
        connection.query(deleteTitulosQuery, [rubricaId], (error) => {
          if (error) {
            console.error('Error al eliminar los títulos: ', error);
            return res.status(500).json({ error: 'Error al eliminar los títulos' });
          }
  
          const deleteRubricaQuery = 'DELETE FROM rubricas WHERE id = ?';
          connection.query(deleteRubricaQuery, [rubricaId], (error) => {
            if (error) {
              console.error('Error al eliminar la rúbrica: ', error);
              return res.status(500).json({ error: 'Error al eliminar la rúbrica' });
            }
  
            return res.status(200).json({ message: 'Rúbrica y títulos eliminados correctamente' });
          });
        });
      });
    });
  });  

  app.delete('/rubricas', (req, res) => {
    const rubricaId = req.params.id;
    
    const deletePuntosQuery = 'DELETE FROM puntos';
    connection.query(deletePuntosQuery, [rubricaId], (error) => {
      if (error) {
        console.error('Error al eliminar los puntos: ', error);
        return res.status(500).json({ error: 'Error al eliminar los puntos' });
      }
  
      const deleteCasosQuery = 'DELETE FROM casos';
      connection.query(deleteCasosQuery, [rubricaId], (error) => {
        if (error) {
          console.error('Error al eliminar los casos: ', error);
          return res.status(500).json({ error: 'Error al eliminar los casos' });
        }
  
        const deleteTitulosQuery = 'DELETE FROM titulos';
        connection.query(deleteTitulosQuery, [rubricaId], (error) => {
          if (error) {
            console.error('Error al eliminar los títulos: ', error);
            return res.status(500).json({ error: 'Error al eliminar los títulos' });
          }
  
          const deleteRubricaQuery = 'DELETE FROM rubricas';
          connection.query(deleteRubricaQuery, [rubricaId], (error) => {
            if (error) {
              console.error('Error al eliminar la rúbrica: ', error);
              return res.status(500).json({ error: 'Error al eliminar la rúbrica' });
            }
  
            return res.status(200).json({ message: 'Rúbrica y títulos eliminados correctamente' });
          });
        });
      });
    });
  });  

  app.get('/casos', (req, res) => {
    const casosQuery = 'SELECT * FROM casos';
  
    connection.query(casosQuery, (error, casosResult) => {
      if (error) {
        console.error('Error al obtener los casos: ', error);
        return res.status(500).json({ error: 'Error al obtener los casos' });
      }
  
      return res.status(200).json(casosResult);
    });
  });
  
  app.get('/casos/:id', (req, res) => {
    const rubricaId = req.params.id;
  
    connection.query('SELECT * FROM casos WHERE rubricaId = ?', [rubricaId], (error, results) => {
      if (error) {
        console.error('Error al obtener los casos:', error);
        res.status(500).json({ error: 'Error al obtener los casos' });
      } else {
        res.json(results);
      }

    });
  });
  
  app.post('/casos/:id', (req, res) => {
  const tituloId = req.params.id;
  const casos = req.body;

  casos.forEach(async (caso) => {
    const { rubricaId, nombre, detalle } = caso;

    const selectCasoQuery = 'SELECT * FROM casos WHERE tituloId = ? AND nombre = ?';
    connection.query(selectCasoQuery, [tituloId, nombre], (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.status(500).json({ error: 'Error al consultar la base de datos' });
      }

      if (results.length === 0) {
        const insertCasoQuery = 'INSERT INTO casos (tituloId, rubricaId, nombre, detalle) VALUES (?, ?, ?, ?)';
        connection.query(insertCasoQuery, [tituloId, rubricaId, nombre, detalle], (error, results) => {
          if (error) {
            console.error('Error al crear el caso:', error);
            return res.status(500).json({ error: 'Error al crear el caso' });
          } else {
            const nuevoCasoId = results.insertId;
            return res.json({ id: nuevoCasoId });
          }
        });
      } else {
        console.log(`El caso "${nombre}" ya existe para el tituloId: ${tituloId}`);
        return res.status(200).json({ message: 'El caso ya existe.' });
      }
    });
  });
  });

  app.delete('/casos/:tituloId', (req, res) => {
    const tituloId = req.params.tituloId;
  
    connection.query('DELETE FROM puntos WHERE casoId IN (SELECT id FROM casos WHERE tituloId = ?)', [tituloId], (error) => {
      if (error) {
        console.error('Error al eliminar los puntos de los casos:', error);
        res.status(500).json({ error: 'Error al eliminar los puntos de los casos' });
      } else {
        connection.query('DELETE FROM casos WHERE tituloId = ?', [tituloId], (error) => {
          if (error) {
            console.error('Error al eliminar los casos:', error);
            res.status(500).json({ error: 'Error al eliminar los casos' });
          } else {
            res.status(200).json({ message: 'Casos y puntos eliminados con éxito' });
          }
        });
      }
    });
  });  
  
  app.get('/puntos', (req, res) => {
    const puntosQuery = 'SELECT * FROM puntos';
  
    connection.query(puntosQuery, (error, puntosResult) => {
      if (error) {
        console.error('Error al obtener los puntos: ', error);
        return res.status(500).json({ error: 'Error al obtener los puntos' });
      }
  
      return res.status(200).json(puntosResult);
    });
  });
   
  app.get('/puntos/:id', (req, res) => {

    const casoId = req.params.id;

    connection.query('SELECT * FROM puntos WHERE casoId = ?', [casoId], (error, results) => {
      if (error) {
        console.error('Error al obtener los puntos:', error);
        res.status(500).json({ error: 'Error al obtener los puntos' });
      } else {
        res.json(results);
      }

    });
  });

  app.post('/puntos/:id', (req, res) => {
    const casoId = req.params.id;
    const { nombre, valor } = req.body;

    console.log(casoId)
  
    const selectPuntoQuery = 'SELECT * FROM puntos WHERE casoId = ? AND nombre = ?';
    connection.query(selectPuntoQuery, [casoId, nombre], (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.status(500).json({ error: 'Error al consultar la base de datos' });
      }
  
      if (results.length === 0) {
        const insertPuntoQuery = 'INSERT INTO puntos (casoId, nombre, valor) VALUES (?, ?, ?)';
        connection.query(insertPuntoQuery, [casoId, nombre, valor], (error, results) => {
          if (error) {
            console.error('Error al crear el punto:', error);
            return res.status(500).json({ error: 'Error al crear el punto' });
          } else {
            const nuevoPuntoId = results.insertId;
            return res.json({ id: nuevoPuntoId });
          }
        });
      } else {
        console.log(`El punto "${nombre}" ya existe para el casoId: ${casoId}`);
        return res.status(200).json({ message: 'El punto ya existe.' });
      }
    });
  });
  
  app.delete('/puntos/:casoId', (req, res) => {
  const casoId = req.params.casoId;
  
  connection.query('DELETE FROM puntos WHERE casoId = ?', [casoId], (error) => {
    if (error) {
      console.error('Error al eliminar los puntos:', error);
      res.status(500).json({ error: 'Error al eliminar los puntos' });
    } else {
      res.sendStatus(200);
    }
  });
  });
  
  app.get('/titulos/:rubricaId', (req, res) => {
    const rubricaId = req.params.rubricaId;
  
    const titulosQuery = 'SELECT * FROM titulos WHERE rubricaId = ?';
    connection.query(titulosQuery, [rubricaId], (error, titulosResult) => {
      if (error) {
        console.error('Error al obtener los títulos: ', error);
        return res.status(500).json({ error: 'Error al obtener los títulos' });
      }
  
      const titulosData = titulosResult.map((titulo) => ({
        id: titulo.id,
        titulo: titulo.titulo,
      }));
  
      return res.status(200).json(titulosData);
    });
  });

  app.put('/titulos/:tituloId', (req, res) => {
    const tituloId = req.params.tituloId;
    const { titulo } = req.body;
  
    const updateTituloQuery = 'UPDATE titulos SET titulo = ? WHERE id = ?';
    connection.query(updateTituloQuery, [titulo.titulo, tituloId], (error, result) => {
      if (error) {
        console.error('Error al actualizar el título: ', error);
        return res.status(500).json({ error: 'Error al actualizar el título' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Título no encontrado' });
      }
  
      return res.status(200).json({ message: 'Título actualizado con éxito' });
    });
  });
  
  app.delete('/titulos/:tituloId', (req, res) => {
    const tituloId = req.params.tituloId;
  
    const deletePuntosQuery = 'DELETE FROM puntos WHERE casoId IN (SELECT id FROM casos WHERE tituloId = ?)';
    connection.query(deletePuntosQuery, [tituloId], (error, result) => {
      if (error) {
        console.error('Error al eliminar los puntos asociados: ', error);
        return res.status(500).json({ error: 'Error al eliminar los puntos asociados' });
      }
  
      const deleteCasosQuery = 'DELETE FROM casos WHERE tituloId = ?';
      connection.query(deleteCasosQuery, [tituloId], (error, result) => {
        if (error) {
          console.error('Error al eliminar los casos asociados: ', error);
          return res.status(500).json({ error: 'Error al eliminar los casos asociados' });
        }
  
        const deleteTituloQuery = 'DELETE FROM titulos WHERE id = ?';
        connection.query(deleteTituloQuery, [tituloId], (error, result) => {
          if (error) {
            console.error('Error al eliminar el título: ', error);
            return res.status(500).json({ error: 'Error al eliminar el título' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Título no encontrado' });
          }
  
          return res.status(200).json({ message: 'Título eliminado con éxito' });
        });
      });
    });
  });
  
  app.post('/titulos/:rubricaId', (req, res) => {
    const { rubricaId } = req.params;
    const titulos = req.body;
  
    if (!titulos || !Array.isArray(titulos)) {
      return res.status(400).json({ error: 'La propiedad "titulos" es requerida y debe ser un array.' });
    }
  
    titulos.forEach(async (tituloObj) => {
      const { id, titulo } = tituloObj;
  
     
      const selectTituloQuery = 'SELECT * FROM titulos WHERE rubricaId = ? AND titulo = ?';
      connection.query(selectTituloQuery, [rubricaId, titulo], (error, results) => {
        if (error) {
          console.error('Error al consultar la base de datos: ', error);
          return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
  
        if (results.length === 0) {
         
          const insertTituloQuery = 'INSERT INTO titulos (rubricaId, titulo) VALUES (?, ?)';
          connection.query(insertTituloQuery, [rubricaId, titulo], (error, result) => {
            if (error) {
              console.error('Error al agregar el título: ', error);
              return res.status(500).json({ error: 'Error al agregar el título' });
            }
          });
        } else {
          console.log(`El título "${titulo}" ya existe para la rubricaId: ${rubricaId}`);
        }
      });
    });
  
    return res.status(201).json({ message: 'Títulos agregados con éxito.' });
  });
  
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log('Servidor API iniciado en el puerto 3002');
});
