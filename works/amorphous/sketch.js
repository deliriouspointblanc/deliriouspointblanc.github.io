/* ===
Based off ml5 Example: LSTM Generator example with p5.js
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/charRNN
Copyright (c) 2019 ml5
This software is released under the MIT License.
https://opensource.org/licenses/MIT
=== */

/* === AMORPHOUS BUTTERFLY - Year 3 Final Project by Yasmin Morgan
--> Speculation on machine relationships, what constitutes as intimacy?
--> How can you be touched by this encounter, whatever it may be?
--> based off of ml5.js tutorials and work done in 1st term Machine Learning for Creative Practice - charRNN and poseNet
--> I learned the technique of using the textarea and stateful generation character by character from Ellen Nickles's project 'Personalized Privacy Policy' (https://github.com/ellennickles/personalized-privacy-policy). I reference her code using 'Nickle's code'.
=== */

let toraii; //two vars for lstm models
let helicoid;

let helicoidText; //texture for shader
let toraiiText;

let textInput; //DOM elements
let textInput2;
let lengthSlider;
let lengthSlider2;
let tempSlider;
let tempSlider2;
let button;
let button2;
let runningInference = false; //switch to true for debugging     
let runningInference2 = false; //without text generation
let helicoidShader;
let toraiiShader;
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

//From Nickle's code
let currentText = '';
let currentText_2 = '';
let autoGenerating = false;
let autoGenerating2 = false;
let modelIsReady = false;

function preload() {
  toraiiShader = loadShader('assets/toraii.vert', 'assets/toraii.frag');
  helicoidShader = loadShader('assets/helicoid.vert', 'assets/helicoid.frag');
}

function setup() {
  frameRate(12); //reduce frameRate so project runs faster
 
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  // Move canvas so inside the <div id="sketch-holder">.
  canvas.parent('sketch-holder');
  
  // Create the LSTM Generator passing it the model directory
  toraii = ml5.charRNN('/models/koansAndpoems/', modelReady);
  helicoid = ml5.charRNN('/models/murakami/', modelReady);

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
  
  if (!runningInference) {
    setTimeout(onGenerateButton, 2000); //begin model 1 generation after 2 seconds of loading project
  }
  
  //===== poseNet parameters =====//
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
     model: 'assets/targetRot2/model.json',
     metadata: 'assets/targetRot2/model_meta.json',
     weights: 'assets/targetRot2/model.weights.bin',
   };
   brain.load(modelInfo, brainLoaded);

  // LOAD TRAINING DATA - only uncomment if training poseNet
//   brain.loadData('targetRot2_poses.json', dataReady);
  
  xPosSlider = createSlider(0, 1000, 255);
  yPosSlider = createSlider(0, 1000, 0);
  xPosSlider.hide();
  yPosSlider.hide();
  
}

// Nickle's code ========
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
  select('#result').html(currentText); //this is how I get over the issue of generating text inside the p element. Instead, I put everything into a textarea element.
  checkTextareaHeight();
}

function updateTextUI_2() {
  select('#result2').html(currentText_2); //same for 2nd model
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
  currentText = ''; //textareas reset to empty
  updateTextUI();
  currentText_2 = '';
  updateTextUI_2();
  
  if (!runningInference) {
    setTimeout(onGenerateButton, 2000); //begin model 1 generation
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

//=====Nickle's functions finished ====//

// Update the slider values, template from ml5.js example.
function updateSliders() {
//  select('#length').html(lengthSlider.value());
  select('#temperature').html(tempSlider.value());
}

function updateSliders2() {
//  select('#length2').html(lengthSlider2.value());
  select('#temperature2').html(tempSlider2.value());
}

function modelReady() {
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
  // ====== poseNet code ========== //
  let r = xPosSlider.value();
  let g = yPosSlider.value();
  
  push();
  translate(width-video.width,-200,0);
  scale(-1, 1);
  /* === Webcam is not shown in this project but you can uncomment below for debugging purposes=== */
  //poseNet might work better if video was positioned in the middle of project. Currently right behind the right-hand shader.
  
//  image(video, 0, 0, video.width, video.height);
  pop();
  
  // ====== SHADERS ========== //
  // passing shaders into the createGraphics layer
  helicoidText.shader(helicoidShader);
  toraiiText.shader(toraiiShader);
  
  // Send the resolution, mouse, and time to our shader
  helicoidShader.setUniform('iResolution', [width*1.25, height*0.833]);
  helicoidShader.setUniform('iMouse', [map(mouseX, 0, width, 0, 100), map(mouseY, 0, height, 0, 100)]);
  helicoidShader.setUniform('poseScale', [map(r, .8, width, .5, 8.), map(g, 0., height, 0., 10.)]); //poseScale uniform changes the depth and thickness of helicoid shader, interesting effects
  helicoidShader.setUniform('iTime', frameCount * 0.05); 
  
  toraiiShader.setUniform('iResolution', [width, height]);
  toraiiShader.setUniform('iMouse', [map(mouseX, 0, width, 0, 200), map(mouseY, 0, height, 0, 200)]);
  toraiiShader.setUniform('poseBox', [map(r, 1., width, 2., 8.), map(g, 0., height, 0., 10.)]); //poseBox increases/decreases the 'intensity' of the ribbon/ripple effect
  toraiiShader.setUniform('iTime', frameCount * 0.01);
  
  // passing the helicoidText layer geometry to render on
  helicoidText.rect(0,0,width/4 - 300,height);
  toraiiText.rect(0,0,width/4,height/2);
  
  // pass the shader as a texture
  texture(helicoidText);

  push();
  translate(- (width/2) + 400,20, -100);
  box(width/4 + 150, height/2 + 100);
  pop();
  
  texture(toraiiText);
  push();
  translate(width/2 - 400, 20, -100);
  box(width/4 + 150, height/2 + 100);
  pop();

  //Nickle's code - output the last letter of current text and seed into the next one, required to be in draw to generate.
  if(autoGenerating && modelIsReady) {
    generateWithSingleChar();
  } 
  
  if (autoGenerating2 && modelIsReady) {
    generateWithSingleChar_2();
  }
}

// ==== Nickles code==== //

// Generate new text
function generate(seed, stateful) {
   // prevent starting inference if we've already started another instance
  if(!runningInference) {
    runningInference = true;

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
          setTimeout(onGenerateButton2, 5000); //when sentence finishes, triggers next model to start generating after 5 seconds
        }

        currentText += str; //adding result to current text
        updateTextUI();
      }
      runningInference = false;
    }
  }
}

function generate2(seed, stateful) {
    // prevent starting inference if we've already started another instance
  if(!runningInference2) {
    runningInference2 = true;

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
          setTimeout(onGenerateButton, 5000);
        }

        currentText_2 += str; //incrementing result to current text
        updateTextUI_2();
      }
      runningInference2 = false;
    }
  }
}

// ==== Nickles code finished==== //

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