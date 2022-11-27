const jwt = require('jsonwebtoken')
const db = require('../db/db.js')

module.exports = (req, res, next) =>{
    try{
        const auth = req.cookies.token
        const decode = jwt.decode(auth, '@!4g0Oz7#$Wa%2WEa')
        if(decode) {
            const SQL_COOKIE = 'SELECT * FROM sessions WHERE iat = ?;'

            db.query(SQL_COOKIE, [decode.iat], (err, result) =>{
                if(result[0] == undefined){
                    res.render('client/error-401')
                }
                else{
                    console.log(decode)
                    next()
                }
            })
        }
    }
    catch(err){
        console.log('erro ao se autenticar')
    }
}