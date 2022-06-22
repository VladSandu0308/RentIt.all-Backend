const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose')
var cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

const url = `mongodb+srv://licenta:licenta@cluster0.dlytw.mongodb.net/licenta?retryWrites=true&w=majority`;

mongoose.connect(url)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

// Handling Errors
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
    message: err.message,
    });

});

app.listen(3005,() => console.log('Server is running on port 3005'));