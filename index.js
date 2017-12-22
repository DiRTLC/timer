var express = require('express')
var app = express()
require('./tools/conn_mongoose')

var Timer = require('./model/time')

app.use(express.static('public'))

app.all('/test', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

app.get('/getTIme', function (req, res) {
  Timer.find(function (err, data) {
    if(!err){
      res.send(data)
    }

  })
})

app.get("/addTime", function (req, res) {
  console.log(req.query.time);
  var time = req.query.time
  var serial = req.query.serial
  var disorganize = req.query.disorganize

  Timer.create({
    time: time,
    serial: serial,
    disorganize: disorganize
  }, function (err) {
    if(!err){
      res.send('success')
    }
  })
})



app.listen('3000', function () {
  console.log('开启成功');
})