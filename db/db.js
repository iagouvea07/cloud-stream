const mysql = require('mysql2')
const db = mysql.createConnection({
    host: '172.18.0.3',
    user: 'root',
    password: '6055302',
    database: 'stream'
})

module.exports = db
