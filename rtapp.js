// This is based on: http://berjon.com/jaytracer-js-raytracer/

var JayTracer = require('./parallac.js/lib/raytracer')

let scene = {
  background: [0, 0, 0],
  shapes: [{
      id: "infinity",
      type: "plane",
      offset: 0,
      surface: "checkerboard",
      normal: [0, 1, 0],
    },
    {
      id: "big-sphere",
      type: "sphere",
      radius: 1,
      surface: "shiny",
      centre: [0, 1, 0],
    },
    {
      id: "lil-sphere",
      type: "sphere",
      radius: 0.5,
      surface: "shiny",
      centre: [-1, 0.5, 1.5],
    },
  ],
  camera: {
    position: [3, 2, 4],
    lookAt: [-1, 0.5, 0],
  },
  lights: [{
      position: [-2, 2.5, 0],
      colour: [0.49, 0.07, 0.07]
    },
    {
      position: [1.5, 2.5, 1.5],
      colour: [0.07, 0.07, 0.49]
    },
    {
      position: [1.5, 2.5, -1.5],
      colour: [0.07, 0.49, 0.07]
    },
    {
      position: [0, 3.5, 0],
      colour: [0.21, 0.21, 0.35]
    },
  ]
};

// TODO: can we get the size from the browser w/ a kind of "readFn"?
let width = 480;
let height = 360;

let time = (new Date()).getTime();
writeln("started at " + time + " with w=" + width + ", h=" + height);
return JayTracer.writeImage(scene, width, height)
  .then(() => {
    let newTime = (new Date()).getTime() - time;
    writeln("time taken: " + time + "ms");
  })
