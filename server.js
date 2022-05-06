const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const rendertron = require('rendertron-middleware');
const https = require('https');
const http = require('http');

const app = express();

app.use(compression());

const bots = require('./bots.json');
const staticFileExtensions = [
  'ai', 'avi', 'css', 'dat', 'dmg', 'doc', 'doc', 'exe', 'flv',
  'gif', 'ico', 'iso', 'jpeg', 'jpg', 'js', 'less', 'm4a', 'm4v',
  'mov', 'mp3', 'mp4', 'mpeg', 'mpg', 'pdf', 'png', 'ppt', 'psd',
  'rar', 'rss', 'svg', 'swf', 'tif', 'torrent', 'ttf', 'txt', 'wav',
  'wmv', 'woff', 'woff2', 'xls', 'xml', 'zip',
];
const moreStaticFileExtensions = [];
for (const staticFileExtension of staticFileExtensions) {
  moreStaticFileExtensions.push(staticFileExtension);
  moreStaticFileExtensions.push(staticFileExtension + '/');
}

app.use((req, res, next) => {
  const agent = req.headers['user-agent'];
  if (agent && agent.toLowerCase().indexOf('bot') >= 0) {
    let isFound = false;
    for (const bot of bots) {
      if (agent.toLowerCase().indexOf(bot.toLowerCase()) >= 0) {
        isFound = true;
        break;
      }
    }
    if (!isFound) {
      console.log(agent);
    }
  }
  return next();
});

if (process.env.NODE_ENV == 'production') {
  // force strict HTTPS in production. Heroku provides the x-forwarded-proto header
  app.use(function(req, res, next) {
    res.setHeader('Strict-Transport-Security', 'max-age=8640000; includeSubDomains');
    if(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === 'http') {
      return res.redirect(301, 'https://' + req.hostname + req.url);
    } else {
      return next();
    }
  });
}

app.use(rendertron.makeMiddleware({
  proxyUrl: 'https://collabz-rendertron.herokuapp.com/render',
  // proxyUrl: 'http://localhost:3000/render', // only for testing on local rendertron
  userAgentPattern: new RegExp(bots.join('|'), 'i'),
  excludeUrlPattern: new RegExp(`\\.(${moreStaticFileExtensions.join('|')})$`, 'i')
}));

app.use(express.static(path.join(__dirname, 'www')));
app.use('*', express.static(path.join(__dirname, 'www')));


/*
* Get port from environment and store in Express.
*/
var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
* Create HTTP server.
*/
var server = http.createServer(app);

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
saveSitemap();


/**
* Normalize a port into a number, string, or false.
*/
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
      // named pipe
      return val;
    }
    if (port >= 0) {
      // port number
      return port;
    }
    return false;
}

/**
* Event listener for HTTP server "error" event.
*/
function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
}

/**
* Event listener for HTTP server "listening" event.
*/
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

function saveSitemap() {
  const file = fs.createWriteStream(path.join(__dirname, 'www/sitemap.xml'));
  const request = https.get('https://collabz-api.herokuapp.com/sitemap.xml', (response) => {
    console.log('Saving sitemap');
    response.pipe(file);
  });
}