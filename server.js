const express = require('express');
const app = express();

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(passport.initialize());
app.use(session({
  secret: 'jonelabSecret',
  resave : false,
  saveUninitialized : false
}))
app.use(passport.session()); 

app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));

const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://admin:F8seLMgtHPpp4OXB@cluster0.44jq1lp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('jonelab')
}).catch((err)=>{
  console.log(err)
})

// app.listen(6060, () => {
//     console.log('서버 실행중')
// })

app.listen(process.env.PORT || 6060, () => {
    console.log('서버 실행중')
})

app.get('/', (req, res) => {
  res.send('반갑다')
}) 

app.post('/join', async(req, res) => {
    console.log(req.body);
    console.log('클라이언트 접속완료')
    // let result = await db.collection('COM_USER_INFO').find().toArray()
    let result = await db.collection('COM_USER_INFO').findOne({user_id : req.body.user_id, user_pw :req.body.user_pw})
    res.send(result)
}) 

app.post('/login', async(req, res) => {
    console.log(req.body);
    console.log('클라이언트 접속완료')
    // let result = await db.collection('COM_USER_INFO').find().toArray()
    let result = await db.collection('COM_USER_INFO').findOne({user_id : req.body.user_id, user_pw :req.body.user_pw})
    res.send(result)
});

passport.use(new LocalStrategy(async (user_id, user_pw, cb) => {
    let result = await db.collection('COM_USER_INFO').findOne({ user_id : user_id})
    if (!result) {
      return cb(null, false, { message: '아이디 DB에 없음' })
    }
    if (result.password == user_pw) {
      return cb(null, result)
    } else {
      return cb(null, false, { message: '비번불일치' });
    }
  }))


app.post('/login2', async(req, res, next) => {
    console.log('??')
    passport.authenticate('local', (error, user, info) => {
        if (error) return res.status(500).json(error)
        if (!user) return res.status(401).json(info.message)
        req.logIn(user, (err) => {
          if (err) return next(err)
          res.redirect('/')
        })
    })(req, res, next)

}); 

