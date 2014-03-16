var fs = require('fs');

var Routes = function (app) {
  fs.readdirSync('./src/controllers').forEach(function (file) {
    if (file.substr(-3) === '.js') {
      var controller = require('./src/controllers/' + file);
      controller(app);
    }
  });
}

module.exports = Routes;
