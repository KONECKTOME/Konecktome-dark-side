const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const mailList = require('./mailing-list/index')
const cors = require('cors')
const server = express()
const port = process.env.PORT || 3002

server.use(express.json())
server.use(cors())
server.use('/mail', mailList)

mongoose
    .connect('mongodb://localhost:27017/Konecktome', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(
        server.listen(port, () => {
            console.log('Server is running on port', port)
        }),
    )
    .catch((err) => console.log(err))