var mongoose = require('mongoose')

var Schema = mongoose.Schema

var timeSchema = new Schema({
  time: String,
  state: String,
  serial: Number,
  disorganize: String,
  date: String
})

module.exports = mongoose.model('timer', timeSchema)