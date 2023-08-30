//Rose curve from dan shiffman: https://thecodingtrain.com/CodingChallenges/055-roses.html
//Hold left mouse button to rotate curve

window.onload = function() {
  let roseCurveSketch = function(p) {
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

  // let cnv;

  // let canvasDiv = document.getElementById('rose-curve');

  let clientHeight = document.getElementById('roseCurveCanvas').clientHeight;
    let clientWidth = document.getElementById('roseCurveCanvas').clientWidth;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    console.log("initial width: " + width + " height: " + height);

    let myCol = "#0d062870";

  p.setup = function() {
    const roseCurveCanvas = p.createCanvas(width,height);
    console.log(clientHeight);
    console.log(clientWidth);
    roseCurveCanvas.parent("roseCurveCanvas");
    p.background(myCol);
  }

  p.draw = function() {
    //picking color
    randCol = p.random(myCols.length);
    randCol = p.floor(randCol);
    // equation of rose curve: r = cos(k0) 
    
    //random radius
    rRand = p.floor(p.random(rRandVals.length));

    //translate to middle of screen
    p.translate(width / 2, height / 2);
    // p.translate(250, 250);
    
    p.rotate(rot);
    
    for (var a = 0; a < p.TWO_PI; a += 0.01) {
      var r = rRandVals[rRand] * p.cos(k * a) + offset + p.random(0.2, 1.8);
      
      var x = r * p.cos(a);
      var y = r * p.sin(a);
      
      p.stroke(myCols[randCol]);
      
      if (p.mouseIsPressed) {
        //change stroke colour to blue
        rRandVals[rRand + 1];
        rot+= 0.1;
        p.strokeWeight(p.random(3, 15));
        //TO-DO: How to make colour more pleasing
        p.stroke(myCols[randCol]); //0,0,random(80,255)
      }
      p.strokeWeight(p.random(2, 8));
      p.point(x,y);
    }
    offset += p.sin(p.frameCount * 0.05)*p.PI;
  }

  p.keyPressed = function() {
    //clear screen when spacebar pressed
    if (p.keyCode == 32){
      p.clear();
      p.background(0);
      console.log('spacebar pressed')
    }
    //press 's' to save image of sketch
    if (p.keyCode == 83){
      // cnv = createCanvas(300, 300);
      p.save(cnv, 'yourRose.jpg');
    }
  }

  p.windowResized = function() {
    // let width = roseCurveCanvas.offsetWidth;
    // let height = roseCurveCanvas.offsetHeight;
    p.resizeCanvas(width, height);
    console.log(width, height);
  }

  //end of p5 curve
}

let myP5RoseCurve = new p5(roseCurveSketch);

//onload ended
}





// function setup() {
//   // let clientHeight = document.getElementById('rose-curve').clientHeight;
//   // let clientWidth = document.getElementById('rose-curve').clientWidth;
//   let width = canvasDiv.offsetWidth;
//   let height = canvasDiv.offsetHeight;
//   let cnv = createCanvas(width, 700);
//   cnv.parent("rose-curve");
//   // Saves the canvas as an image
//   // cnv = createCanvas(innerWidth, innerHeight);
//   // createCanvas(innerWidth, innerHeight);
//   background(12,5,38);
// }





