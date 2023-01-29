//Rose curve from dan shiffman: https://thecodingtrain.com/CodingChallenges/055-roses.html
//Hold left mouse button to rotate curve

var n = 16;
var d = 4;
var k = n / d;

var rot = 1;
var offset = 80;

rRandVals = [75, 100, 125, 200];
let rRand;
//colors:
let myCols = ['#eb4034','#11edc8', "#111fed"];
let randCol;

let cnv;

let canvasDiv = document.getElementById('rose-curve');

function setup() {
  // let clientHeight = document.getElementById('rose-curve').clientHeight;
  // let clientWidth = document.getElementById('rose-curve').clientWidth;
  let width = canvasDiv.offsetWidth;
  let height = canvasDiv.offsetHeight;
  let cnv = createCanvas(width, 700);
  cnv.parent("rose-curve");
  // Saves the canvas as an image
  // cnv = createCanvas(innerWidth, innerHeight);
  // createCanvas(innerWidth, innerHeight);
  background(12,5,38);
}

function draw() {
  //picking color
  randCol = random(myCols.length);
  randCol = floor(randCol);
  // equation of rose curve: r = cos(k0) 
  
  //random radius
  rRand = floor(random(rRandVals.length));
  //translate to middle of screen
  translate(width/2, height/2);
  
  rotate(rot);
  
  for (var a = 0; a < TWO_PI; a += 0.01) {
    var r = rRandVals[rRand] * cos(k * a) + offset + random(0.2, 1.8);
    
    var x = r * cos(a);
    var y = r * sin(a);
    
    stroke(myCols[randCol]);
    
    if (mouseIsPressed) {
      //change stroke colour to blue
      rRandVals[rRand + 1];
      rot+= 0.1;
      strokeWeight(random(3, 15));
      //TO-DO: How to make colour more pleasing
      stroke(myCols[randCol]); //0,0,random(80,255)
    }
    strokeWeight(random(2, 8));
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
  let width = canvasDiv.offsetWidth;
  let height = canvasDiv.offsetHeight;
  resizeCanvas(width, 700);
}