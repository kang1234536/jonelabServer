const express = require('express')
const app = express()

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



app.listen(6060, () => {
    console.log('http://localhost:6060 에서 서버 실행중')
})

app.get('/', (req, res) => {
  res.send('반갑다')
}) 

app.post('/', async(req, res) => {
    console.log(req.body);
    console.log('클라이언트 접속완료')
    // let result = await db.collection('COM_USER_INFO').find().toArray()
    let result = await db.collection('COM_USER_INFO').findOne({user_id : req.body.user_id, user_pw :req.body.user_pw})
    res.send(result)
}) 