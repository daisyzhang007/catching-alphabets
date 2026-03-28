// ml5 handpose setup
let handpose;
let video;
let predictions = [];

// Letter variables
let letters = [];
let alphabet = "abcdefghijklmnopqrstuvwxyz";

let mouthX = 0;
let mouthY = 0;
let mouthSize = 60;

function setup() {
  createCanvas(640, 480);
  
  // Webcam + handpose model
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelLoaded);
  handpose.on("predict", gotPredictions);
  
  // Generate 50 falling letters (with animation properties)
  for (let i = 0; i < 50; i++) {
    let randomLetter = alphabet.charAt(floor(random(alphabet.length)));
    let letterObj = {
      x: random(width),
      y: random(-200, 0),
      letter: randomLetter,
      speed: random(1, 3),
      isEaten: false, // Track if letter is caught
      fadeAlpha: 255, // For fade-out animation (255 = fully visible)
      scaleSize: 1,   // For shrink animation (1 = full size)
      rotation: 0     // For spin animation (0 = no rotation)
    };
    letters.push(letterObj);
  }
  
  textSize(24);
  textAlign(CENTER, CENTER); // Center text for rotation/spin
}

function modelLoaded() {
  console.log("Handpose ready!");
}

function gotPredictions(results) {
  predictions = results;
}

function draw() {
  background(255);
  
  // Update mouth position (follow index finger)
  updateMouthPosition();
  
  // Update + draw letters (with animations for eaten ones)
  for (let i = letters.length - 1; i >= 0; i--) {
    let l = letters[i];
    
    // 1. If letter is NOT eaten: make it fall
    if (!l.isEaten) {
      l.y += l.speed;
      
      // Reset if it falls off screen
      if (l.y > height) {
        l.y = random(-200, 0);
        l.x = random(width);
      }
      
      // Check collision with mouth (mark as eaten)
      if (dist(l.x, l.y, mouthX, mouthY) < mouthSize/2) {
        l.isEaten = true; // Trigger animation
      }
    } 
    // 2. If letter IS eaten: play animation
    else {
      l.fadeAlpha -= 10; // Fade out (lower alpha = more transparent)
      l.scaleSize -= 0.05; // Shrink (smaller scale = smaller letter)
      l.rotation += 0.2; // Spin (add rotation each frame)
      
      // Remove letter once animation finishes (alpha < 0)
      if (l.fadeAlpha < 0) {
        letters.splice(i, 1);
        addNewLetter(); // Add new letter to replace eaten one
      }
    }
    
    // Draw the letter (apply animation effects)
    push(); // Isolate styling for this letter
    translate(l.x, l.y); // Move to letter position (for rotation)
    rotate(l.rotation); // Apply spin
    scale(l.scaleSize); // Apply shrink
    fill(0, l.fadeAlpha); // Apply fade (alpha controls transparency)
    text(l.letter, 0, 0); // Draw letter at rotated position
    pop(); // Reset styling
  }
  
  // Draw mouth (semi-transparent red circle)
  fill(255, 0, 0, 150);
  noStroke();
  circle(mouthX, mouthY, mouthSize);
}

// Update mouth position to follow index finger tip
function updateMouthPosition() {
  if (predictions.length > 0) {
    let indexFinger = predictions[0].landmarks[8];
    mouthX = width - indexFinger[0]; // Flip X for mirror effect
    mouthY = indexFinger[1];
  }
}

// Add new random letter (replaces eaten ones)
function addNewLetter() {
  let randomLetter = alphabet.charAt(floor(random(alphabet.length)));
  let letterObj = {
    x: random(width),
    y: random(-200, 0),
    letter: randomLetter,
    speed: random(1, 3),
    isEaten: false,
    fadeAlpha: 255,
    scaleSize: 1,
    rotation: 0
  };
  letters.push(letterObj);
}