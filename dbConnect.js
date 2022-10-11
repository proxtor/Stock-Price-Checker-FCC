const mongoose = require('mongoose');
const database = mongoose.connect(process.env.DB,
                {useUnifiedTopology : true, useNewUrlParser: true });
                                                   
  module.exports = database;     