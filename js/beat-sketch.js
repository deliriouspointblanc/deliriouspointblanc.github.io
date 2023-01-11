let beats = [];
let numBeats = 10;
let track;
let playing = false;
let moveX = 0;
let moveY = 0;

let fft, pieces, radius, c;

let myCol = "#0d062870";
let myAlpha = 128;

function preload() {
  track = loadSound('../assets/amorphousButterfly_short.mp3');
}

function setup() {
  let clientHeight = document.getElementById('beat-sketch').clientHeight;
  let clientWidth = document.getElementById('beat-sketch').clientWidth;
  let cnv = createCanvas(clientWidth, clientHeight);
  cnv.parent("beat-sketch");
  colorMode(HSB, 360, 100, 100);
  angleMode(DEGREES);

  // for (let i = 0; i < 3; i++) {
  //   beats.push(new Beat(random(0, width), random(0, height)));
  // }
  fft = new p5.FFT();
  
  c=0;
  
  track.setVolume(0.1);
}

function draw() {
  background(myCol);
  //background(0, 20); //alpha for blur

  //Text to tell visitor controls for muting music
  // fill(255);
  // textSize(15);
  // let textPosH = width/4 - 200;
  // let textPosW = 50;
  // text ("press 'm' to toggle music", textPosW, textPosH);
  // if (playing) {
  //   fill(113,107,107);
  //   text("on", textPosW * 5, textPosH);
  // } else {
  //   fill(255,73,75);
  //   text("off", textPosW * 5, textPosH);
  // }
  for (var i = 0; i < beats.length; i++){
    beats[i].display();
    beats[i].update();
  }

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
  //lerp mouseX and mouseY for slower 'laggy' but smooth movement
  moveX = lerp(moveX, mouseX, 0.01);
  moveY = lerp(moveY, mouseY, 0.01);
  translate(moveX, moveY);

  for (i = 0; i < numBeats; i++) {
    rotate(360 / numBeats);
    
    noFill();

    /*----------  BASS  ----------*/
    push();
    // strokeWeight(8);
    // stroke(0, 100, 100);
    noStroke();
    push();
    scale(scaleBass);
    fill(200, 50, 100);
    ellipse(mapBass, radius/2, 5 + mapTreble, 5 + mapTreble);
    pop();
    rotate(-frameCount * 0.5);
    let b = map(sin(frameCount), -1, 1, 10, 100);
    stroke(255, 50, b);
    strokeWeight(2);
    line(100, 50, radius, radius);
    line(100, 50, -radius, -radius);
    pop();
    /*----------  MID  ----------*/
    push();
    //		stroke(midColor);
    // stroke(c, 120, 100, 100);
    strokeWeight(1);
    rotate(-frameCount * 0.01);
    fill(c, 80, 100, 100);
    c = c%360; //map(sin(c), -1, 1, 0, 120);
    ellipse(mapMid, radius, mapBass, mapBass);
    c += 0.25;
    pop();
    /*----------  TREBLE  ----------*/
    push();
    //		stroke(trembleColor);
    stroke(180, 100, 100);
    strokeWeight(2); //smallest ring
    scale(scaleTreble * 3);
    // rotate(frameCount * 0.01);
    // point(-100, radius / 2);
    // point(100, radius / 2);
    beginShape();
    vertex(-100, radius / 2);
    vertex(100, radius / 2);
    endShape();
    pop();
  }
}

function mousePressed() {
  // beats.push(new Beat(mouseX, mouseY));
  // if (track.isPlaying()) {
  //   track.stop();
  //   playing = false;
  // } else {
  //   track.play();
  //   playing = true;
  // }
}

function keyPressed() {
  if (keyCode == 77) { //press 'm' to toggle music
    if (track.isPlaying()) {
      track.stop();
      playing = false;
    } else {
      track.play();
      playing = true;
    }
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

function windowResized() {
  resizeCanvas(clientWidth, clientHeight);
}