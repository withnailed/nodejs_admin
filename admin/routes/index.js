var express = require('express');
const config = require('../config');
var router = express.Router();

const fs = require('fs');

let routes = fs.readdirSync(__dirname);

for (let route of routes) {
  if (route.includes('.js') && route !== 'index.js') {
    console.log(route, '→', typeof loaded);
    router.use("/" + route.replace(".js", ''), require("./" + route));
  }
}

module.exports = router;
