import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import express from 'express';
const app = express();


app.get("/", (req, res) => {
  ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
});


app.listen(5000, () => {
  console.log("Running on port 5000.");
});
