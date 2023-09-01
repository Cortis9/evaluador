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


const app = express();
app.use(bodyParser.json());
app.use(cors());

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



  
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log('Servidor API iniciado en el puerto 3002');
});
