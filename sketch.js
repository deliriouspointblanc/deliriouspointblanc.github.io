// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
LSTM Generator example with p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/charRNN

Let's create 2 charRNN instances, one for TORAII and one for HELICOID.

//DONE: Make dialogue continuous/recursive
- Add p5 shader with the webgl shaders
- Experiment with more shader

//Referencing Ellie's project (https://github.com/ellennickles/personalized-privacy-policy) on generating text using textarea and a smart way of updating the UI so that I don't just put the generated text into a p element

Ellie combines text generation and stateful to allow char RNN to generate full sentences, checking in the generate function that if sentence begins with a period, autoGenerating stops.

To-DO:
- Grab the last sentence of what the model said & use it as input to the second model
- After some time, delete the text and start fresh for more generating, or make it possible to scroll
- Make it possible for users to write their own seed text and for the generation to restart.
- move the nose with poseNet, changes z direction of shaders
=== */

let toraii;
let helicoid;

let helicoidText;
let toraiiText;

let textInput;
let textInput2;
let lengthSlider;
let lengthSlider2;
let tempSlider;
let tempSlider2;
let button;
let button2;
let runningInference = false;
let runningInference2 = false;
let model1;
let model2;

let helicoidShader;
let toraiiShader;

//Ellie's code/ideas
let currentText = '';
let currentText_2 = '';
let autoGenerating = false;
let autoGenerating2 = false;
let modelIsReady = false;

let count = 0;
let resetButton;

//poseNet variables
let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "";

let state = 'waiting';
//let targetLabel;
let targetRot;

let xPosSlider, yPosSlider;
let xPos; 
let yPos; 

function delay(time) { //from CodingTrain
  return new Promise((resolve, reject) => {
    if (isNaN(time)) {
      reject(new Error('delay requires a valid number.'));
    } else {
      setTimeout(resolve, time);
    }
  });
}

async function keyPressed() {
//  if (key == 't') {
//    brain.normalizeData();
//    brain.train({epochs: 50}, finished); 
//  } else if (key == 's') {
//    brain.saveData();
//  } else if (key == 'd') {
////    targetLabel = key;
//    xPos = mouseX;
//    yPos = mouseY;
//    targetRot = [xPos, yPos];
//    console.log(xPos, yPos);
//    
//    await delay(3000);
//    console.log('collecting');
//    state = 'collecting';
//    
//    await delay(5000);
//    console.log('not collecting');
//    state = 'waiting';
//  }
}

function preload() {
  toraiiShader = loadShader('assets/toraii.vert', 'assets/toraii.frag');
  helicoidShader = loadShader('assets/helicoid.vert', 'assets/helicoid.frag');
}

function setup() {
  //noCanvas();
  frameRate(12);
  
  if (!runningInference) {
    setTimeout(onGenerateButton, 2000); //begin model 1 generation
  }
 
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  // Move the canvas so it's inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');
  
  // Create the LSTM Generator passing it the model directory
  toraii = ml5.charRNN('/models/koansAndpoems/', modelReady);
  helicoid = ml5.charRNN('/models/hemingway/', modelReady);

   // initialize the createGraphics layers
  helicoidText = createGraphics(800, 400, WEBGL);
  toraiiText = createGraphics(800, 400, WEBGL);

  // turn off the createGraphics layers stroke
  helicoidText.noStroke();
  toraiiText.noStroke();
  
  // Grab the DOM elements 1st model
  textInput = select('#textInput');
  tempSlider = select('#tempSlider');
  tempSlider.input(updateSliders);
  
  //2nd model
  textInput2 = select('#textInput2');
  tempSlider2 = select('#tempSlider2');
  tempSlider2.input(updateSliders2);
  
  select('#resetBoth').mousePressed(onResetBoth);
  
  //poseNet parameters
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  
  let options = {
    inputs: 34,
    outputs: 2, //2 continuous
    //outputs: [xpos, ypos],
    task: 'regression',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  
  // LOAD PRETRAINED MODEL
   const modelInfo = {
     model: 'models/targetRot2/model.json',
     metadata: 'models/targetRot2/model_meta.json',
     weights: 'models/targetRot2/model.weights.bin',
   };
   brain.load(modelInfo, brainLoaded);

  // LOAD TRAINING DATA
//   brain.loadData('targetRot2_poses.json', dataReady);
  
  xPosSlider = createSlider(0, 1000, 255);
  yPosSlider = createSlider(0, 1000, 0);
  xPosSlider.hide();
  yPosSlider.hide();
  
}

// ELLIE ========
//: Read and seed with full text from input box
function generateWithFullInputText() {
  let original = textInput.value();
  currentText = original.toLowerCase();
  generate(currentText, false); //not stateful
}

function generateWithFullInputText_2() {
  let original = textInput2.value();
  currentText_2 = original.toLowerCase();
  generate2(currentText_2, false); //not stateful
}

// Seed with last character of current text, preserving state (stateful LSTM)
function generateWithSingleChar() {
  generate(currentText.slice(-1), true);
}

function generateWithSingleChar_2() {
  generate2(currentText_2.slice(-1), true);
}

// Update UI with current text
function updateTextUI() {
  select('#result').html(currentText); //this is how I get over the issue of using the p element, I just put everything into a textarea element.
  checkTextareaHeight();
}

function updateTextUI_2() {
  select('#result2').html(currentText_2); //this is how I get over the issue of using the p element, I just put everything into a textarea element.
  checkTextareaHeight2();
}

// Clear current text, stop auto-generating
function onResetButton() {
  currentText = '';
  updateTextUI();
  autoGenerating = false;
}

function onReset2Button() {
  currentText_2 = '';
  updateTextUI_2();
  autoGenerating = false;
}

function onResetBoth() {
  currentText = '';
  updateTextUI();
  currentText_2 = '';
  updateTextUI_2();
  
  if (!runningInference) {
    setTimeout(onGenerateButton, 2000); //begin model 1 generation
//    setInterval(onGenerateButton2, 10000);
  }
  
  autoGenerating = false;
  console.log('Resetting both');
}

// Start auto-generating
function onGenerateButton() {
  if(currentText == '') generateWithFullInputText();
  else generateWithSingleChar();
  autoGenerating = true;
}

function onGenerateButton2() {
  if(currentText_2 == '') generateWithFullInputText_2();
  else generateWithSingleChar_2();
  autoGenerating2 = true;
}

//=====ELLIE finished ====//

// Update the slider values
function updateSliders() {
//  select('#length').html(lengthSlider.value());
  select('#temperature').html(tempSlider.value());
}

function updateSliders2() {
//  select('#length2').html(lengthSlider2.value());
  select('#temperature2').html(tempSlider2.value());
}

function modelReady() {
  //select('#status').html('Model Loaded');
  console.log('Model Loaded');
  modelIsReady = true;
}

//poseNet Code
function brainLoaded() {
  console.log('pose classification ready!');
  predictRot();//classifyPose();
}

function predictRot() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.predict(inputs, gotResult);
  } else {
    setTimeout(predictRot, 100);
  }
}

function gotResult(error, results) {  
//  if (results[0].confidence > 0.75) {
//    poseLabel = results[0].label.toUpperCase();
//  }
  console.log(results);
  let xPos = results[0].value;
  let yPos = results[1].value;
  xPosSlider.value(xPos);
  yPosSlider.value(yPos);
//  bSlider.value(b);
  predictRot();
}

function dataReady() {
  brain.normalizeData();
  brain.train({
    epochs: 50
  }, finished);
}

function finished() {
  console.log('model trained');
  brain.save();
  predictRot(); //classifyPose();
}

function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      brain.addData(inputs, targetRot);
    }
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  console.log(count);
  
  //poseNet stuff ========
    let r = xPosSlider.value();
  let g = yPosSlider.value();
//  let b = bSlider.value();
  
  push();
  translate(width-video.width,-200,0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);
  
  //Text to show where mouseX and mouseY is
//  console.log("mouseX: " + mouseX);
//  console.log("mouseY: " + mouseY);
  
//  push();
//  noStroke();
//  fill(r, g, b);
//  rect(0, 0, 50, 50); //draws current slidervaue
//  pop();
  
//  if (pose) {
//    for (let i = 0; i < skeleton.length; i++) {
//      let a = skeleton[i][0];
//      let b = skeleton[i][1];
//      strokeWeight(2);
//      stroke(0);
//
//      line(a.position.x, a.position.y, b.position.x, b.position.y);
//    }
//    for (let i = 0; i < pose.keypoints.length; i++) {
//      let x = pose.keypoints[i].position.x;
//      let y = pose.keypoints[i].position.y;
//      fill(0);
//      stroke(255);
//      ellipse(x, y, 16, 16);
//    }
//  }
  pop();
  
  // ====== SHADER ========== //
  // instead of just setting the active shader using shader() we are passing it to the createGraphics layer
  helicoidText.shader(helicoidShader);
  toraiiText.shader(toraiiShader);
  
  // lets send the resolution, mouse, and time to our shader
  // before sending mouse + time we modify the data so it's more easily usable by the shader
  helicoidShader.setUniform('iResolution', [width/2, height]);
  helicoidShader.setUniform('iMouse', [map(mouseX, 0, width, 0, 200), map(mouseY, 0, height, 0, 200)]);
  helicoidShader.setUniform('iTime', frameCount * 0.05); 
  
  toraiiShader.setUniform('iResolution', [width, height]);
  toraiiShader.setUniform('iMouse', [map(r, 0, width, 0, 100), map(g, 0, height, 0, 100)]);
  toraiiShader.setUniform('iTime', frameCount * 0.01);
  
  // passing the helicoidText layer geometry to render on
  helicoidText.rect(0,0,width/4 - 300,height);
  toraiiText.rect(0,0,width/4,height/2);

  //background(0);
  
  // pass the shader as a texture
  // anything drawn after this will have this texture.
  texture(helicoidText);
  
  
  push();
  translate(- (width/2) + 400,20, -100);
//  rotateZ(theta * mouseX * 0.0001);
//  rotateX(theta * mouseX * 0.0001);
//  rotateY(theta * mouseX * 0.0001);  
//  theta += 0.05;
  box(width/4 + 150, height/2 + 100);
  pop();
  
  texture(toraiiText);
  push();
  translate(width/2 - 400, 20, -100);
//  rotateZ(theta * mouseX * 0.0001);
//  rotateX(theta * mouseX * 0.0001);
//  rotateY(theta * mouseX * 0.0001);  
//  theta += 0.05;
  box(width/4 + 150, height/2 + 100);
  pop();

  //Ellie
  if(autoGenerating && modelIsReady) {
    generateWithSingleChar();
  } 
  
  if (autoGenerating2 && modelIsReady) {
    generateWithSingleChar_2();
  }
}

//ELLIE====

// Generate new text
function generate(seed, stateful) {
   // prevent starting inference if we've already started another instance
  if(!runningInference) {
    runningInference = true;

    // Update the status log
    //select('#status').html('Generating...');
    console.log('Generating...');

    let data = {
      seed: seed,
      temperature: tempSlider.value(),//0.5,
      length: 1,
      stateful: stateful,
    };

    // Generate text
    toraii.generate(data, gotData);

    // When it's finished
    function gotData(err, result) {
      if(result) {
        // If the result is not a period, add output sample to current text
        var str = result.sample;
        var check = str.startsWith(".");

        if (check) {
          // console.log("a period!");
          autoGenerating = false;
          count += 1;
          setTimeout(onGenerateButton2, 5000); //when sentence finishes, triggers next model to start generating after 5 seconds
        }

        currentText += str; //adding result to current text
        updateTextUI();
      }
      // Update the status log
      status = 'Ready! '
//      select('#status').html(status);
      runningInference = false;
    }
  }
}

function generate2(seed, stateful) {
    // prevent starting inference if we've already started another instance
  if(!runningInference2) {
    runningInference2 = true;

    // Update the status log
//    select('#status').html('Generating...');

    let data = {
      seed: seed,
      temperature: tempSlider2.value(), //0.7,
      length: 1,
      stateful: stateful,
    };

    // Generate text
    helicoid.generate(data, gotData);

    // When it's finished
    function gotData(err, result) {
      if(result) {
        // If the result is not a period, add output sample to current text
        var str = result.sample;
        var check = str.startsWith(".");

        if (check) {
           console.log("a period!");
          autoGenerating2 = false;
          count += 1;
          setTimeout(onGenerateButton, 5000);
        }

        currentText_2 += str; //adding result to current text
        updateTextUI_2();
      }
      // Update the status log
      status = 'Ready! '
//      select('#status').html(status);
      runningInference2 = false;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//Set textarea so automatically scrolls down with new generation
//From stack overflow: https://stackoverflow.com/questions/7373081/how-to-have-a-textarea-to-keep-scrolled-to-the-bottom-when-updated
function checkTextareaHeight(){
   var textarea = document.getElementById("result");
   if(textarea.selectionStart == textarea.selectionEnd) {
      textarea.scrollTop = textarea.scrollHeight;
   }
}

function checkTextareaHeight2(){
   var textarea = document.getElementById("result2");
   if(textarea.selectionStart == textarea.selectionEnd) {
      textarea.scrollTop = textarea.scrollHeight;
   }
}