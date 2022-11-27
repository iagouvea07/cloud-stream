require('dotenv').config()
const express = require('express')
const handlebars = require('express-handlebars')
const bodyparser = require('body-parser')
const app = express()
const path = require('path')
const client = require('./routes/client/client.js')
const db = require('./db/db.js')
const cookieParser = require('cookie-parser')

db.connect((err, res) =>{
    if(err) throw err;
    console.log('Database connected successfully!')
})

app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())
app.use(express.static(path.join(__dirname, '/public')))
app.use(cookieParser())
app.use('/client', client)


app.get('/', (req, res) =>{
    res.redirect('/client/')
})

app.listen(process.env.PORT, () =>{
    console.log(`Server initialized at address: http://10.147.20.45:${process.env.PORT}`)
})

