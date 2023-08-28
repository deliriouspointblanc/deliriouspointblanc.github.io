//From: https://editor.p5js.org/yasminmorgan.info@gmail.com/sketches/i-n9W7iXa

var cols = 6; //amount of tiles in columns
var rows = 6; //amount of tiles in rows

let tiles1 = [];
let tiles2 = [];
let img;
let w = 100; //size of tile
let waitTime = 2; //increase for slower speed

let xPos; 


function preload() {
	//https://yasminmorgan.com/portfolio/prudence.png
	//https://yasminmorgan.com/assets/profile_combined.png
  //https://yasminmorgan.com/assets/profile_combined.png
  //https://live.staticflickr.com/4/3529/3770300517_22b80348cc_z.jpg?zz=1
	
  img = loadImage("https://yasminmorgan.com/assets/profile_combined.png"); 
	// img2 = loadImage("https://yasminmorgan.com/portfolio/prudence.png");
}

function setup() {
  let clientHeight = document.getElementById('image-tiling').clientHeight;
  let clientWidth = document.getElementById('image-tiling').clientWidth;
  let cnv = createCanvas(clientWidth, clientHeight);
  cnv.parent("image-tiling");

  createCanvas(500, 600);
  // noCanvas();
  
	
    // Create 25 tiles from random parts of the image
  for (let i = 0; i < cols * rows; i++) {
    let x = floor(random(0, img.width - (w/2)));
    let y = floor(random(0, img.height - (w/2)));
    
    tiles1[i] = img.get(x, y, w, w);
	// tiles2[i] = img2.get(x, y, w, w);
		
    //Uncomment below to get a different style of tiles overlap each other
    //tiles[i] = img.get(x, y, floor(img.width / 5), floor(img.width / 5));
  }
	
	xPos = random(0,img.width);
}

function draw() {
  background(188);
	
	image(img,xPos, 0);
  frameRate(36);
  
  // tilingAnim();

}

function tilingAnim() {
  translate((width-rows*w)/2,(height-cols*w)/2); //if there is space in canvas, translate to middle
  let index = 0;
    for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      var x = j * w; //swap j and i to animate vertically or horizontally
      var y = i * w;
      
      //this if statement is what allows the tiles to delay appearing
      if (frameCount >= waitTime * index) {
        angleMode(DEGREES);
        //translate(x, y);
        //rotate(90);
        image(tiles1[index], x, y);
				
	    // image(tiles2[index], x + w*2, y + w*2);
        // rotate(90);
      }
      index++;
    }
  }
  
}

// function windowResized() {
//   resizeCanvas(clientWidth, clientHeight);
// }