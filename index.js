var express = require('express')
var opn = require('opn')
var app = express()
require('./tools/conn_mongoose')

var Timer = require('./model/time')

app.use(express.static('public'))

// app.all(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// })

app.get('/getTIme', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  Timer.find(function (err, data) {
    if(!err){
      res.send(data)
    }
  })
})

app.get("/addTime", function (req, res) {
  console.log(req.query.time);
  var time = req.query.time
  console.log(time);
  var serial = req.query.serial
  var disorganize = req.query.disorganize
  var generatedTime = req.query.generatedTime

  Timer.create({
    time: time,
    serial: serial,
    disorganize: disorganize,
    generatedTime: generatedTime
  }, function (err) {
    if(!err){
      res.send('success')
    }
  })
})

app.get('/deleteOne', function (req, res) {
  var id = req.query.id
  Timer.remove({_id: id}, function (err) {
    if(!err){
      res.send('ok')
    }
  })
})

app.get('/removeAll', function (req, res) {

  Timer.remove({}, function (err) {
    console.log(err);
    res.send('成功')
  })

})

app.get('/register', function (req, res) {


  res.send(req.query.username)

})

var port = '3000'
app.listen(port, function () {
  var url = 'http://127.0.0.1:' + port
  opn(url)
  console.log('开启成功');
})