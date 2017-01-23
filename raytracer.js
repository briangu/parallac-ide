// This is based on: http://berjon.com/jaytracer-js-raytracer/

// var writeln = console.log;
// var writeFn = console.log;
let putImageData = (id, x, y) => putImageData(id, x, y);
let drawPixel = (pos, r, g, b, a) => drawPixel(pos, r, g, b, a);
let flushImage = () => flushImage()

var JayTracer = {
  vectorAdd: function (v1, v2) {
    var res = [];
    for (var i = 0; i < v1.length; i++) { res[i] = v1[i] + v2[i]; }
    return res;
  },
  vectorSub: function (v1, v2) {
    var res = [];
    for (var i = 0; i < v1.length; i++) { res[i] = v1[i] - v2[i]; }
    return res;
  },
  vectorNeg: function (v1) {
    var res = [];
    for (var i = 0; i < v1.length; i++) { res[i] = -v1[i]; }
    return res;
  },
  vectorScale: function (v1, x) {
    var res = [];
    for (var i = 0; i < v1.length; i++) { res[i] = v1[i] * x; }
    return res;
  },
  vectorDot: function (v1, v2) {
    var res = 0;
    for (var i = 0; i < v1.length; i++) { res += v1[i] * v2[i]; }
    return res;
  },
  vectorCross3: function (v1, v2) {
    return [v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
    ];
  },
  vectorBlend: function (v1, v2) {
    var res = [];
    for (var i = 0; i < v1.length; i++) { res[i] = v1[i] * v2[i]; }
    return res;
  },
  vectorLength: function (v1) {
    var sum = 0.0;
    for (var i = 0; i < v1.length; i++) { sum += (1 * v1[i]) * (1 * v1[i]); }
    return Math.sqrt(sum);
  },
  vectorNormalise: function (v1) {
    var len = this.vectorLength(v1);
    var res = [];
    for (var i = 0; i < v1.length; i++) { res[i] = v1[i] / len }
    return res;
  },
  vectorSum: function () {
    var vecs = [];
    for (var i = 0; i < arguments.length; i++) vecs.push(arguments[i]);
    return this.vectorSumArray(vecs);
  },
  vectorSumArray: function (vecs) {
    var res = [0, 0, 0];
    for (var i = 0; i < vecs.length; i++) {
      var v = vecs[i];
      res[0] += v[0];
      res[1] += v[1];
      res[2] += v[2];
    }
    return res;
  },

  writeImage: function (scene, width, height) {
    this.prepareScene(scene);

    var id = { 'width': width, 'height': height, 'data': new Array(width * height * 4) };
    var pix = id.data;

    const aspectRatio = width / height;

    var calls = [];
    var pos = 0;

    writeln("Hello")

    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var yRec = (-y / height) + 0.5;
        var xRec = ((x / width) - 0.5) * aspectRatio;
        calls.push(this.plotPixel(scene, pos, pix, xRec, yRec))
          // .then((results) => {
          //   var pos = results.pos;
          //   var chans = results.chans;
          //   // var pix = new Array(4);
          //   // pix[0] = Math.floor(chans[0] * 255);
          //   // pix[1] = Math.floor(chans[1] * 255);
          //   // pix[2] = Math.floor(chans[2] * 255);
          //   // pix[3] = 255;

          //   writeFn(drawPixel, pos, Math.floor(chans[0] * 255), Math.floor(chans[1] * 255), Math.floor(chans[2] * 255), 255)
          // }))
        pos++
      }
    }

    return Promise.all(calls)
      .then(() => writeFn(putImageData, id, 0, 0))
  },

  plotPixel: function (scene, pos, pix, x, y) {
    var cam = scene.camera;
    var raySrc = cam.position;
    var rayDir = this.vectorNormalise(
      this.vectorAdd(
        cam.forward,
        this.vectorAdd(this.vectorScale(cam.right, x), this.vectorScale(cam.up, y))
      )
    );
    var chans = this.traceRay(scene, raySrc, rayDir, null, 1);
    for (var i = 0; i < chans.length; i++) {
      if (chans[i] < 0) chans[i] = 0;
      else if (chans[i] > 1) chans[i] = 1;
    }

    const offset = pos * 4;
    pix[offset + 0] = Math.floor(chans[0] * 255)
    pix[offset + 1] = Math.floor(chans[1] * 255)
    pix[offset + 2] = Math.floor(chans[2] * 255)
    pix[offset + 3] = 255;

    return Promise.resolve()
  },
  shapeIntersect: function (start, dir, shape) {
    switch (shape.type) {
      case "plane":
        return this.intersectPlane(start, dir, shape);
      case "sphere":
        return this.intersectSphere(start, dir, shape);
      default:
        return [];
    };
  },
  intersectPlane: function (start, dir, plane) {
    var denom = this.vectorDot(dir, plane.normal);
    if (denom == 0) return;
    var res = plane.offset - this.vectorDot(start, plane.normal) / denom;
    if (res <= 0) return;
    return res;
  },
  intersectSphere: function (start, dir, sphere) {
    var y = this.vectorSub(start, sphere.centre);
    var beta = this.vectorDot(dir, y),
      gamma = this.vectorDot(y, y) - sphere.radius * sphere.radius;
    var descriminant = beta * beta - gamma;
    if (descriminant <= 0) return;
    var sqrt = Math.sqrt(descriminant);
    if (-beta - sqrt > 0) return -beta - sqrt;
    else if (-beta + sqrt > 0) return -beta + sqrt;
    else return;
  },
  shapeNormal: function (pos, shape) {
    switch (shape.type) {
      case "plane":
        return shape.normal;
      case "sphere":
        return this.sphereNormal(pos, shape);
      default:
        return [];
    };
  },
  sphereNormal: function (pos, sphere) {
    return this.vectorScale(this.vectorSub(pos, sphere.centre), 1 / sphere.radius);
  },
  shade: function (pos, dir, shape, scene, contrib) {
    var mat = this.material(shape.surface, pos);
    var norm = this.shapeNormal(pos, shape);
    var reflect = mat[3];
    contrib = contrib * reflect;
    norm = (this.vectorDot(dir, norm) > 0) ? -norm : norm;
    var reflectDir = this.vectorSub(dir, this.vectorScale(norm, 2 * this.vectorDot(norm, dir)));
    var light = this.light(scene, shape, pos, norm, reflectDir, mat);
    if (contrib > 0.01) {
      return this.vectorSum(
        light,
        this.vectorScale(
          this.traceRay(scene, pos, reflectDir, shape, contrib),
          reflect
        )
      );
    } else {
      return light;
    }
  },
  light: function (scene, shape, pos, norm, reflectDir, mat) {
    var colour = [mat[0], mat[1], mat[2]],
      reflect = mat[3],
      smooth = mat[4];
    var res = [];
    for (var i = 0; i < scene.lights.length; i++) {
      var lCol = scene.lights[i].colour,
        lPos = scene.lights[i].position;
      var lDir = this.vectorNormalise(this.vectorSub(lPos, pos));
      var lDist = this.vectorLength(this.vectorSub(lPos, pos));
      var tRay = this.testRay(scene, pos, lDir, shape);
      var skip = false;
      for (var j = 0; j < tRay.length; j++)
        if (tRay[j] < lDist) skip = true; // XXX use label
      if (skip) continue;
      var illum = this.vectorDot(lDir, norm);
      if (illum > 0) res.push(this.vectorScale(this.vectorBlend(lCol, colour), illum));
      var spec = this.vectorDot(lDir, reflectDir);
      if (spec > 0) res.push(this.vectorScale(lCol, Math.pow(spec, smooth) * reflect));
    }
    return this.vectorSumArray(res);
  },
  material: function (name, pos) {
    if (name == "shiny") return [1, 1, 1, 0.6, 50]
    else if (name == "checkerboard") {
      return ((Math.floor(pos[0]) + Math.floor(pos[2])) % 2) == 0 ? [0, 0, 0, 0.7, 150] : [1, 1, 1, 0.1, 50];
    }
    return;
  },
  testRay: function (scene, src, dir, curShape) {
    var res = [];
    for (var i = 0; i < scene.shapes.length; i++) {
      var shape = scene.shapes[i];
      if (shape.id == curShape.id) continue;
      var inter = this.shapeIntersect(src, dir, shape);
      if (inter != null) res.push(inter);
    }
    return res;
  },
  traceRay: function (scene, src, dir, ignore, contrib) {
    var tmp = [];
    for (var i = 0; i < scene.shapes.length; i++) {
      var shape = scene.shapes[i];
      if (ignore && ignore.id == shape.id) continue;
      var dist = this.shapeIntersect(src, dir, shape);
      if (dist == null) continue; // XXX optimisation
      var pos = this.vectorAdd(src, this.vectorScale(dir, dist));
      tmp.push({ dist: dist, pos: pos, shape: shape });
    }
    if (tmp.length == 0) return scene.background;
    else {
      tmp = tmp.sort(function (a, b) { return a.dist - b.dist; });
      return this.shade(tmp[0].pos, dir, tmp[0].shape, scene, contrib);
    }
  },
  calculateBasis: function (scene) {
    var cam = scene.camera;
    cam.forward = this.vectorNormalise(this.vectorSub(cam.lookAt, cam.position));
    cam.right = this.vectorNormalise(this.vectorCross3(cam.forward, [0, -1, 0]));
    cam.up = this.vectorCross3(cam.forward, cam.right);
  },
  prepareScene: function (scene) {
    this.calculateBasis(scene);
  }
};

var scene = {
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
var width = 640;
var height = 480;

var time = (new Date()).getTime();
writeln("started at " + time + " with w=" + width + ", h=" + height);
return JayTracer.writeImage(scene, width, height)
  .then(() => writeFn(flushImage))
  .then(() => {
    var newTime = (new Date()).getTime() - time;
    writeln("time taken: " + time + "ms");
  })
