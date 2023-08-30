let beatSketch = function(p) {
  let beats = [];
  let numBeats = 10;
  let track;
  let playing = true;
  let moveX = 0;
  let moveY = 0;

  let fft, pieces, radius, c;

  let myCol = "#0d062870";
  let myAlpha = 128;
  let started = false;

  let clientHeight = document.getElementById('beat-sketch').clientHeight;
    let clientWidth = document.getElementById('beat-sketch').clientWidth;

  p.preload = function() {
    track = p.loadSound('../assets/amorphousButterfly_short.mp3');
  }

  p.setup = function() {

    const cnv = p.createCanvas(clientWidth, clientHeight);
    cnv.parent("beat-sketch");
    p.colorMode(p.HSB, 360, 100, 100);
    p.angleMode(p.DEGREES);
  
    // for (let i = 0; i < 3; i++) {
    //   beats.push(new Beat(random(0, width), random(0, height)));
    // }
    fft = new p5.FFT();
    
    c=0;
    
    //.setVolume not working. Problem with scope
    track.setVolume(0.1);
  }

  p.draw = function() {
    p.background(myCol);
    // p.background(0);
    //background(0, 20); //alpha for blur
    for (var i = 0; i < beats.length; i++){
      beats[i].display();
      beats[i].update();
    }
  
    fft.analyze(); //so I can use fft.getEnergy later - explain more
    // console.log(fft.analyze());
    // console.log("fft bass:" + fft.getEnergy("bass"));
    let bass = fft.getEnergy("bass"); //10;//fft.getEnergy
    ("bass");
    // console.log(bass); //0-110
    let treble = fft.getEnergy("treble");; //fft.getEnergy("treble");
    let mid = fft.getEnergy("mid");; //fft.getEnergy("mid");
    // console.log(treble);
    let mapMid = p.map(mid, 0, 255, -radius, radius);
    // console.log(mapMid);
    let scaleMid = p.map(mid, 0, 255, 1, 1.5);
  
    let mapTreble = p.map(treble, 0, 255, -radius / 2, radius * 2);
    // console.log(mapTreble);
    let scaleTreble = p.map(mapTreble, 0, 255, 0.1, 2);
  
    let mapBass = p.map(bass, 0, 255, 0, 100);
    let scaleBass = p.map(bass, 0, 255, 0, 0.8);
  
    radius = 100;
    //lerp mouseX and mouseY for slower 'laggy' but smooth movement
    moveX = p.lerp(moveX, p.mouseX, 0.01);
    moveY = p.lerp(moveY, p.mouseY, 0.01);
    // console.log(p.mouseX);
    p.translate(moveX, moveY);
  
    for (i = 0; i < numBeats; i++) {
      p.rotate(360 / numBeats);
      
      p.noFill();
  
      /*----------  BASS  purple middle ----------*/
      p.push();
      // strokeWeight(8);
      // stroke(0, 100, 100);
      p.noStroke();
      p.push();
      p.scale(scaleBass); //scaleBass
      p.fill(200, 50, 100);
      // p.ellipse(1, radius/2, 5, 5);
      p.ellipse(mapBass, radius/2, 5 + mapTreble, 5 + mapTreble);
      p.pop();
      p.rotate(-p.frameCount * 0.5);
      let b = p.map(p.sin(p.frameCount), -1, 1, 10, 100);
      p.stroke(255, 50, b);
      p.strokeWeight(2);
      p.line(100, 50, radius, radius);
      p.line(100, 50, -radius, -radius);
      p.pop();
      /*----------  MID  ----------*/
      p.push();
      //		stroke(midColor);
      // stroke(c, 120, 100, 100);
      p.strokeWeight(1);
      p.rotate(-p.frameCount * 0.01);
      p.fill(c, 80, 100, 100);
      c = c%360; //map(sin(c), -1, 1, 0, 120);
      // p.ellipse(3, radius, 1, 1); //idfk
      p.ellipse(mapMid, radius, mapBass, mapBass);
      c += 0.25;
      p.pop();
      /*----------  TREBLE outside light blue  ----------*/
      p.push();
      //		stroke(trembleColor);
      p.stroke(180, 100, 100);
      p.strokeWeight(2); //smallest ring
      // p.scale(1 * 1);
      p.scale(scaleTreble * 3);
      p.rotate(p.frameCount * 0.05);
      // point(-100, radius / 2);
      // point(100, radius / 2);
      p.beginShape();
      p.vertex(-100, radius / 2);
      p.vertex(100, radius / 2);
      p.endShape();
      p.pop();
    }
  }

  p.keyPressed = function() {
    if (p.keyCode == 77) { //press 'm' to toggle music
      if (track.isPlaying()) {
        track.stop();
        playing = false;
      } else {
        track.play();
        playing = true;
      }
    }
  }

  
  p.windowResized = function() {
    p.resizeCanvas(clientWidth, clientHeight);
  }

  //End of beatSketch
}

let tilingSketch = function(p) {
  var cols = 8; //amount of tiles in columns
  var rows = 8; //amount of tiles in rows

  let tiles1 = [];
  let tiles2 = [];
  let img, img2;
  let w = 50; //size of tile
  let waitTime = 3; //increase for slower speed
  let frameCounter = 0; //frame counter

  let xPos; 

  let t = 0;
  let started = false;

  p.preload = function() {
    //https://yasminmorgan.com/assets/profile_combined.png
    img = p.loadImage("../assets/profile_combined_500.png"); //profile_combined_500.png
    img2 = p.loadImage("../assets/profile_combined_500.png");
    // console.log(img.width, img.height); 
  }
  
  p.setup = function() {
    // if (started) {
    //   p5.remove();
    // }
    // started = true;

    const tilingCanvas = p.createCanvas(500, 500);
    tilingCanvas.parent("tilingCanvas");

    // let button = document.getElementById("btnTiling");
    // button.addEventListener("click", console.log("button clicked"));
    
    //Create x amount of tiles from random parts of image
    for (let i = 0; i < cols * rows; i++) {
    let x = p.floor(p.random(0, img.width - (w/2)));
    let y = p.floor(p.random(0, img.height - (w/2)));
    
    tiles1[i] = img.get(x, y, w, w);
    tiles2[i] = img2.get(y, x, w, w);
		
    //Uncomment below to get a different style of tiles overlap each other
    // tiles2[i] = img.get(x, y, p.floor(img.width / 5), p.floor(img.width / 5));
    }
	
	  xPos = p.random(0,img.width);

    p.resetAnimation(); // Initial animation setup
    p.btn = p.createButton("\u{1F504}"); //Refresh unicode symbol
    // p.btn.position(19,19);
    p.btn.id("tilingBtn");
    // p.btn.position(0,0);
    p.btn.parent("tilingCanvas");
    
    p.btn.mousePressed(p.resetAnimation); // Add a button
  }
  
  p.draw = function() {
    // p.imageMode(p.CENTER);
    // p.image(img, 0, 0, 500, 500);
    // p.background(188);
	
	// p.image(img,xPos, 0);
    frameCounter += 1;
    p.clear();
    p.image(img,0, 0, 500, 500);

    p.frameRate(36);
    
    // p.push();
    p.tilingAnim();
    // p.pop();

    t += 0.05;

    // console.log(p.frameCount);
  }
  
  p.tilingAnim = function() {
    p.translate((p.width-rows*w)/2,(p.height-cols*w)/2); //if there is space in canvas, translate to middle
    let index = 0;
    let nNum = 5000;
      for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        var x = j * w; //swap j and i to animate vertically or horizontally
        var y = i * w;

        //this if statement is what allows the tiles to delay appearing
        if (frameCounter >= waitTime * index) {
          p.angleMode(p.DEGREES);

          p.image(tiles1[index], x + (i * p.noise(t+(nNum*i))), y);
          
          p.push();
          x = i * w; //animate vertically
          y = j * w;
          p.image(tiles2[index], x, y + (i * p.noise(t+(nNum*i))));;
          // rotate(90);
          p.pop();
        }
        index++;
        nNum += 1000;
      }
    }
  }

  p.resetAnimation = function () {
    // img.filter(INVERT);
  
    tiles1 = []; //reset tiles array
    tiles2 = [];
  
    //Create tiles again
    for (let i = 0; i < cols * rows; i++) {
      let x = p.floor(p.random(0, img.width - (w/2)));
      let y = p.floor(p.random(0, img.height - (w/2)));
      
      tiles1[i] = img.get(x, y, w, w);
      tiles2[i] = img2.get(y, x, w, w);
      
      //Uncomment below to get a different style of tiles overlap each other
      // tiles1[i] = img.get(y, x, floor(img.width / 5), floor(img.width / 5));
    }
  
    frameCounter = 0;
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

 
let myp5TilingSketch = new p5(tilingSketch);
let myp5BeatSketch = new p5(beatSketch);
