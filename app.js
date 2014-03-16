var express = require('express.io'),
  path = require('path'),
  mongoose = require('mongoose');

var app = module.exports = express();

app.http().io();

var connect = function () {
  var mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/chat';
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(mongoUrl, options);
}
connect();

mongoose.connection.on('error', function (err) {
  console.log(err);
});

mongoose.connection.on('disconnected', function () {
  connect();
});

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

require('./routes')(app);
require('./socket_routes')(app);

app.listen(process.env.PORT || 3030);
