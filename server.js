const express = require('express');
const app = express();

// .env
require("dotenv").config();

const jwt       = require('jsonwebtoken');
const secretKey = process.env.SECRETKEY;
const dbUrl     = process.env.DB_URL;
const dbName    = process.env.DB_NAME;


const bcrypt = require('bcrypt') 

app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));

const { MongoClient } = require('mongodb')

let db
new MongoClient(dbUrl).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db(dbName)
}).catch((err)=>{
  console.log(err)
})

app.listen(process.env.PORT || 6060, () => {
    console.log('서버 실행중')
})

app.get('/', (req, res) => {
  res.send('서버 접속 성공')
}) 

app.post('/register', async(req, res) => {
    console.log('회원가입 시도');
    
    let idCheck = await db.collection('COM_USER_INFO').findOne({user_id: req.body.user_id});
    let fResult = {};
    if (idCheck == null || idCheck == "") {
        const token = jwt.sign(req.body, secretKey, {expiresIn: "1h"});
        let result = await db.collection('COM_USER_INFO').insertOne({user_id : req.body.user_id, user_pw : await bcrypt.hash(req.body.user_pw, 10), token : token});
        console.log(result);
        res.send({result : result, token : token});
    }   else {
        console.log(idCheck);
        res.send(idCheck);
    }
});


app.post('/login', async(req, res, next) => {
    console.log('로그인시도');

    let userInfo = await db.collection('COM_USER_INFO').findOne({user_id: req.body.user_id});
    let message  = '';
    let token    = req.body.token;
    if (userInfo == null || userInfo == "") {
        // 아이디 없음
        message = '아이디가 존재하지 않습니다.';
        res.send({errMsg:message});
    }   else {
        // 아이디 존재
        let pwCheck = await bcrypt.compare(req.body.user_pw, userInfo.user_pw);
        if (pwCheck) {
            if (req.body.token == null) {
                delete req.body.token;
                token = jwt.sign(req.body, secretKey, {expiresIn: "1h"});
                db.collection('COM_USER_INFO').updateOne({user_id : req.body.user_id}, {$set:{token : token}});
                res.send(userInfo);
            } else {
                if (token == userInfo.token) {
                    res.send(userInfo);
                }   else {
                    message = '해킹의심계정입니다.';
                    res.send({errMsg : message})
                }
            }
        }   else {
            message = '비밀번호가 일치하지 않습니다.';
            res.send({errMsg: message});
        }
    }

}); 




