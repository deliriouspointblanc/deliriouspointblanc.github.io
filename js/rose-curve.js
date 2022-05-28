//Rose curve from dan shiffman: https://thecodingtrain.com/CodingChallenges/055-roses.html
//Hold left mouse button to rotate curve

var n = 16;
var d = 4;
var k = n / d;

var rot = 1;
var offset = 80;

//colors:
let myCols = ['#eb4034','#11edc8', "#111fed"];
let randCol;

let cnv;

function setup() {
  let clientHeight = document.getElementById('rose-curve').clientHeight;
  let clientWidth = document.getElementById('rose-curve').clientWidth;
  let cnv = createCanvas(clientWidth, clientHeight);
  cnv.parent("rose-curve");
  // Saves the canvas as an image
  // cnv = createCanvas(innerWidth, innerHeight);
  // createCanvas(innerWidth, innerHeight);
  background(0);
}

function draw() {
  //picking color
  randCol = random(myCols.length);
  randCol = floor(randCol);
  // equation of rose curve: r = cos(k0) 
  
  //translate to middle of screen
  translate(width/2, height/2);
  
  rotate(rot);
  
  for (var a = 0; a < TWO_PI; a += 0.01) {
    var r = 200 * cos(k * a) + offset + random(0.2, 1.8);
    
    var x = r * cos(a);
    var y = r * sin(a);
    
    stroke(myCols[randCol]);
    
    if (mouseIsPressed) {
      //change stroke colour to blue
      rot+= 0.1;
      strokeWeight(random(3, 8));
      stroke(0,0,random(80,255));
    }
    strokeWeight(2);
    point(x,y);
  }
  offset += sin(frameCount * 0.05)*PI;
}

function keyPressed() {
  //clear screen when spacebar pressed
  if (keyCode == 32){
    clear();
    background(0);
    console.log('spacebar pressed')
  }
  //press 's' to save image of sketch
  if (keyCode == 83){
    // cnv = createCanvas(300, 300);
    save(cnv, 'yourRose.jpg');
  }
}

function windowResized() {
  resizeCanvas(clientWidth, clientHeight);
}