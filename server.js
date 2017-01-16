var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var parallac = require('parallac.js/lib/parallac')
var uuid = require('uuid')

var debug = () => { }
var error = console.log
var info = console.log

function startServer(config) {
  info("hello")

  app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
  })

  // app.post('/event', function (req, res) {
  //   debug("post handler", data)
  //   var req = JSON.parse(data)
  //   reqFn = JSON.parse(req.fn)
  //   on(config.Locales[0])
  //     .do(reqFn)
  //     .then((result) => {
  //       res.send({
  //         id: req.id,
  //         result: result
  //       })
  //     })
  // })

  const port = config.port || 8080;

  http.listen(port, function () {
    info('listening on *:'+port)
  })

  io.on('connection', function (socket) {

    function reportRequestError(req, err) {
      socket.emit('error', {
        req: req,
        error: err
      })
    }

    socket.on('error', function (data) {
      error("error", data)
    })

    socket.on('connect', function (data) {
      debug("connect", data)
    })

    socket.on('disconnect', function (data) {
      debug("disconnect")
    })

    socket.on('run', function (data) {
      console.log("run", data)
    })
  })
}

startServer({})
