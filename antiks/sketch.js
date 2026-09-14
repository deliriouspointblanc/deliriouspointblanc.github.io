let beats = [];
let numBeats = 10;
let track;
let playing = false;

let fft, pieces, radius, c;
let visualizers = [];
let width = 1280;
let height = 720;

let rows = 2;
let cols = 2;
let paddingX = width / (cols + 1);
let paddingY = height / (rows + 1);

function preload() {
  track = loadSound('koffee-baiana-snippet.mp3');
}

function setup() {

  colorMode(HSB, 360, 100, 100);

  createCanvas(width, height);

  fft = new p5.FFT();

  c = 0;

  visualizers = [];

  for (let i = 1; i <= cols; i++) {
  for (let j = 1; j <= rows; j++) {
    let baseHue = i * 30 + j * 30; // each visualizer offset by 20 degrees
    visualizers.push({
      x: i * paddingX,
      y: j * paddingY,
      dir: random([-1, 1]),
      scale: random(0.8, 1.2),
      rot: 0,
      history: [],
      hueOffset: baseHue
    });
  }
}

  track.setVolume(0.1);
}

function draw() {
  background(0, 0, 0, 6);
  blendMode(BLEND);

  fft.analyze(); //so I can use fft.getEnergy later - explain more
  let bass = fft.getEnergy("bass");
  // console.log(bass); //0-110
  let treble = fft.getEnergy("treble");
  let mid = fft.getEnergy("mid");
  // console.log(treble);
  let mapMid = map(mid, 0, 255, -radius, radius);
  // console.log(mapMid);
  let scaleMid = map(mid, 0, 255, 1, 1.5);

  let mapTreble = map(treble, 0, 255, -radius / 2, radius * 2);
  let scaleTreble = map(mapTreble, 0, 255, 0.1, 2);

  let mapBass = map(bass, 0, 255, 0, 100);
  let scaleBass = map(bass, 0, 255, 0, 0.8);

  radius = 100;
  // Main one follows mouse
  // drawVisualizer(mouseX, mouseY, 1, 1.2);

  // Copies
  for (let v of visualizers) {

    v.history.push({
      rot: v.rot,
      mapBass: mapBass,
      mapMid: mapMid,
      mapTreble: mapTreble,
      scaleBass: scaleBass,
      scaleTreble: scaleTreble
    });

    // Limit history length for trails
    if (v.history.length > 15) {
      v.history.splice(0, 1);
    }

    drawVisualizer(v.x, v.y, v.dir, v.scale, v, v.hueOffset);
  }

  c = (c + 0.15) % 360;

  let rotSpeed = map(mid, 0, 255, 0.0005, 0.01);

  for (let v of visualizers) {
    v.rot += rotSpeed * v.dir + random(-0.0002, 0.0002);;
  }

}

function drawVisualizer(x, y, dir, scaleAmt, v, hueOffset) {
  push();
  translate(x, y);
  scale(scaleAmt);

  let radius = 100;

  for (let h = 0; h < v.history.length; h++) {
    let data = v.history[h];
    let alpha = map(h, 0, v.history.length, 10, 50);

    for (let i = 0; i < numBeats; i++) {
      push();
      rotate(i * (360 / numBeats) + data.rot);

      // ---------- BASS ----------
      push();
      scale(data.scaleBass);
      noStroke();
      fill(200, 50, 100, alpha * 0.5);
      ellipse(data.mapBass, radius / 2, 5 + data.mapTreble, 5 + data.mapTreble);
      // extra faint ellipses
      for (let j = 1; j <= 3; j++) {
        fill(200, 50, 100, alpha * 0.1);
        ellipse(data.mapBass, radius / 2, 5 + data.mapTreble + j * 2, 5 + data.mapTreble + j * 2);
      }
      pop();

      // ---------- MID ----------
      push();
      fill((c + hueOffset) % 360, 80, 100, alpha);
      noStroke();
      ellipse(data.mapMid, radius, data.mapBass, data.mapBass);
      pop();

      // ---------- LINES ----------
      push();
      rotate(data.rot * 0.5);
      blendMode(ADD);
      stroke(255, 50, map(sin(frameCount*0.02),-1,1,10,100), alpha);
      strokeWeight(2);
      line(100, 50, radius, radius);
      line(100, 50, -radius, -radius);
      pop();

      // ---------- TREBLE ----------
      push();
      stroke(180, 100, 100, alpha);
      strokeWeight(2 * (1 + data.scaleTreble * 0.5));
      rotate(-data.rot * 0.3);
      scale(data.scaleTreble * 3);
      line(-100, radius / 2, 100, radius / 2);
      pop();

      pop(); // end slice
    }
  }

  pop(); // end visualizer
}

// function drawVisualizer(x, y, dir, scaleAmt, v, hueOffset) {
//   push();
//   translate(x, y);
//   scale(scaleAmt);

//   let radius = 100;

//   for (let h = 0; h < v.history.length; h++) {
//     let data = v.history[h];
//     let alpha = map(h, 0, v.history.length, 10, 50);

//     for (let i = 0; i < numBeats; i++) {
//       push();
//       rotate(i * (360 / numBeats) + data.rot);

//       // ---------- BASS ----------
//       push();
//       scale(data.scaleBass);
//       noStroke();
//       fill(200, 50, 100, alpha * 0.5);
//       ellipse(data.mapBass, radius / 2, 5 + data.mapTreble, 5 + data.mapTreble);
//       // extra faint ellipses
//       for (let j = 1; j <= 3; j++) {
//         fill(200, 50, 100, alpha * 0.1);
//         ellipse(data.mapBass, radius / 2, 5 + data.mapTreble + j * 2, 5 + data.mapTreble + j * 2);
//       }
//       pop();

//       // ---------- MID ----------
//       push();
//       fill((c + hueOffset) % 360, 80, 100, alpha);
//       noStroke();
//       ellipse(data.mapMid, radius, data.mapBass, data.mapBass);
//       pop();

//       // ---------- LINES ----------
//       push();
//       rotate(data.rot * 0.5);
//       blendMode(ADD);
//       stroke(255, 50, map(sin(frameCount*0.02),-1,1,10,100), alpha);
//       strokeWeight(2);
//       line(100, 50, radius, radius);
//       line(100, 50, -radius, -radius);
//       pop();

//       // ---------- TREBLE ----------
//       push();
//       stroke(180, 100, 100, alpha);
//       strokeWeight(2 * (1 + data.scaleTreble * 0.5));
//       rotate(-data.rot * 0.3);
//       scale(data.scaleTreble * 3);
//       line(-100, radius / 2, 100, radius / 2);
//       pop();

//       pop(); // end slice
//     }
//   }

//   pop(); // end visualizer
// }



function mousePressed() {
  // beats.push(new Beat(mouseX, mouseY));
  if (track.isPlaying()) {
    track.stop();
    playing = false;
  } else {
    track.play();
    playing = true;
  }
}

class Beat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.diam = random(25, 50);
    this.speedX = random(-2, 5);
    this.speedY = random(-2, 3);
    this.c = color(random(360), random(50, 100), random(50, 100), 100);
    //Make trails by pushing array of prev pos
    this.history = [];
  }
  update() {
    //is it moving, how etc. Use 
    this.speedX *= 0.98;
    this.speedY *= 0.98;
    this.x += random(-5, 5); //this.speedX;
    this.y += random(-5, 5); //this.speedX;

    let v = createVector(this.x, this.y);
    this.history.push(v);

    if (this.history.length > 100) {
      this.history.splice(0, 1);
    }
    
    if (beats.length > 10) {
    beats.splice(0, 1);
    }
  }
  display() {
    //draw beats
    push();
    fill(this.c);
    noStroke();
    ellipse(this.x, this.y, this.diam);
    //Draw trails
    beginShape();
    for (var i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      // fill(this.c/2);
      // ellipse(pos.x, pos.y, i, i);
      noFill();
      stroke(255);
      vertex(pos.x, pos.y);
    }
    endShape();
    pop();
  }
}