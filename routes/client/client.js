const express = require('express')
const router = express.Router()
const db = require('../../db/db.js')
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)
const jwt = require('jsonwebtoken')
const login = require('../../middlewares/login.js')
require('dotenv').config()
const sendMail = require('../../public/js/mail.js')
const  HTML_TEMPLATE = require("../../public/js/mail-template.js");

router.get('/', (req, res) =>{
    res.render('client/login')
})

router.post('/', (req, res) =>{
    const user = req.body.user
    const password = req.body.password
    const SQL_LOGIN = 'SELECT * FROM users WHERE user = ?'
    db.query(SQL_LOGIN, [user], (err, result) =>{
        const erro = []
        try{
            bcrypt.compare(password, result[0].password, (err, response) =>{
                if(response && result[0].active === 1){
                    console.log('login realizado com sucesso!')
                    const token = jwt.sign({
                        id: result[0].id,
                        user: result[0].user
                    }, '@!4g0Oz7#$Wa%2WEa')
                    res.cookie('token', token)
                    const decode = jwt.decode(token, '@!4g0Oz7#$Wa%2WEa')
                    const SQL_SESSION = 'INSERT INTO sessions (user, cookie, iat) VALUES (?, ?, ?);'

                    db.query(SQL_SESSION, [user, token, decode.iat], (err, session) =>{
                        console.log(user, token, decode.iat)
                        res.redirect('/client/home')
                    })
                }
                else{
                    erro.push({message: 'Incorrect username, password or account not activated'})
                    res.render('client/login', {error: erro})
                }
            })
        }
        catch(err){
            erro.push({message: 'Incorrect username, password or account not activated'})
            res.render('client/login', {error: erro})
        }
    })
})

router.get('/register', (req, res) =>{
    res.render('client/register')
})

router.post('/register', (req, res) =>{
    const name = req.body.name
    const email = req.body.email
    const user = req.body.user

    const caracters = [
        ['abcdefghijklmnopqrstuvwxyz'],
        ['ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
        ['0123456789'],
        ['@#/_$&%!']
    ]
    var tempPass = ''

    for(let i = 0; i < 12; i++){
        let char = caracters[Math.floor(Math.random(1, 10) * 4)].toString()
        tempPass = tempPass.concat(char[Math.floor(Math.random(0, 10) * char.length)])
    }
    
        const SQL_REGISTER = 'INSERT INTO users (name, email, user, tempPass) VALUES (?, ?, ?, ?);'
        db.query(SQL_REGISTER, [name, email, user, tempPass], (err, result) =>{
            if (err) throw err
            const message = `
            <h2>Hi there,</h2>
            <p>Thanks for the registered to the my Cloud Stream!</p>
            <h3><strong>Access credentials:</strong></h3>
            <p><strong>Username: </strong>${user}</p>
            <p><strong>Temporary Password: </strong>${tempPass}</p>
            <p>Please, <a href="http://10.147.20.45:8082/client/account-activation">click here</a> for active your account!</p>`
        
            const options = {
            from: "CLOUDSERVER <root.cloudserver@gmail.com>",
            to: email,
            subject: "Confirm the user registered at cloud stream",
            text: message,
            html: HTML_TEMPLATE(message),
            }
        
            sendMail(options, (info) => {
                console.log("Email sent successfully");
                console.log("MESSAGE ID: ", info.messageId);
                res.status(200).redirect('/client/register-successfully')
            });   
        })
})

router.get('/register-successfully', (req, res) =>{
    res.render('client/register-successfully')
})

router.get('/account-activation', (req, res) =>{
    res.render('client/account-activation')
})

router.post('/account-activation', (req, res) =>{
    const password = req.body.password
    const password2 = req.body.password2
    const tempPass = req.body.tempPass
    const hash = bcrypt.hashSync(password, salt)

    if(password === password2){
        const SQL_ACTIVATION = 'SELECT * FROM users WHERE  tempPass = ?;'
        
        db.query(SQL_ACTIVATION, [tempPass], (err, search) =>{
            if (err) throw err;
            if(search[0] == undefined){
                const erro = []
                erro.push({message: 'Incorrect temporary password'})
                res.render('client/account-activation', {error: erro})
            }
            else{
                const SQL_PASS = 'UPDATE users SET password = ?, active = 1, tempPass = null WHERE tempPass = ?;'

                db.query(SQL_PASS, [hash, tempPass], (err, pass) =>{
                    res.render('client/activated')
                })
            }
        })
    }
})

router.get('/home', login, (req, res) =>{
    res.render('client/home')
})

router.get('/logout', (req, res) =>{
    token = req.cookies.token
    const SQL_LOGOUT = 'DELETE FROM sessions WHERE cookie = ?;'
    db.query(SQL_LOGOUT, [token], (err, result) =>{
        res.clearCookie()
        res.redirect('/client/')
    })
})
module.exports = router