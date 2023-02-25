//Turn on webcam

//Change colours over time
//How we can put thebooksdem and beyondtheshell as text that kinda comes up, maybe falling down?

const density = "Ñ@#W$9876543210?!abc;:+=-,._                       "

// $@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'.
//One that works: $@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,^`'. 
// Ñ@#W$9876543210?!abc;:+=-,._ '

// function preload() {
//   img = loadImage('turtle_no_bg_64.png');
// }
let cols = ['#0f0', '#0400ff', '#FF66B3', '#ffffff']; //array of hex codes
let video;
let asciiDiv;

waitTime = 5;

function setup() {
  noCanvas();
  video = createCapture(VIDEO);
  video.size(96,48);
  asciiDiv = createDiv();
  asciiDiv.position(400, 100); 
  video.hide();
}
  function draw() {
  push();
  video.loadPixels();
  translate(width,0);
  scale(-1, 1);
  // scale(-1.0,1.0);
  frameRate(12);
  let asciiImage = "";
  
  for (let j = 0; j < video.height; j++) {
    let row = '';
    for (let i = 0; i < video.width; i++) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
  
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, len, 0));
      const c = density.charAt(charIndex);
      
      if (c == " ") asciiImage += "&nbsp;";
      else asciiImage += c;
    }
    asciiImage += '<br/>';
  }
  asciiDiv.html(asciiImage);
  //change colour
    let index = 0;
    if (frameCount >= waitTime * index) {
  // for (var i = 0; i < 3; i++) {
    select('body').style('color', cols[random(4)]);
    console.log(cols);
  }
  index++;
  pop();
}