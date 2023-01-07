const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const { default: mongoose } = require('mongoose');
const multer= require('multer');

const app = express();

app.use(bodyParser.json());
app.use( multer().any())

mongoose.connect("mongodb+srv://Lucky:ejIoY6iVVc1sRKbS@cluster0.byhslvl.mongodb.net/Project_Book_Management", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is Connected."))
    .catch(error => console.log(error))

app.use('/', route)

app.use(function (req, res) {
    var err = new Error("Not Found.")
    err.status = 400
    return res.status(400).send({ status: false, msg: "Path not Found." })
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express App Running on Port: ' + (process.env.PORT || 3000))
});