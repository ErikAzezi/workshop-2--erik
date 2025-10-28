let gif;
let playing = false;
let frameInterval = 100; 
let currentFrame = 0;
let totalFrames = 5; 
let frameTimer;


let drawing = false;
let startX, startY, endX, endY;
let anglePercentage = null;
let drawnLineVisible = false; 
let lineTimer; // Timer to clear the drawn line

function preload() {
    gif = loadImage('erikgif.gif'); // 
}

function setup() {
    let canvasWidth = min(windowWidth, windowHeight * 0.5625); 
    let canvasHeight = canvasWidth * 1.777;

    if (canvasHeight > windowHeight) {
        canvasHeight = windowHeight;
        canvasWidth = canvasHeight * 0.5625;
    }

    createCanvas(canvasWidth, canvasHeight);
    background(50);
    imageMode(CENTER);

   
    gif.pause();
    gif.setFrame(0); // Start at the first frame
}

function draw() {
    background(50);

    if (gif) {
        let scaleX = width / gif.width;
        let scaleY = height / gif.height;
        let scale = max(scaleX, scaleY);
        let scaledWidth = gif.width * scale;
        let scaledHeight = gif.height * scale;

        image(gif, width / 2, height / 2, scaledWidth, scaledHeight);

        if (!playing) {
            fill(0);
            rectMode(CENTER);
            rect(width / 2, height / 2 - 70, 400, 40);

        
            fill(255); 
            textAlign(CENTER, CENTER);
            textSize(24);
            text("Touch here to swing at ball", width / 2, height / 2 - 70);

           
            fill(0); 
            rect(width / 2, height / 2 - 30, 400, 40);

           
            fill(255); 
            textSize(17);
            text("Draw a line below to guess the trajectory of the ball", width / 2, height / 2 - 30);
        }
    } else {
      
        fill(0); 
        rectMode(CENTER);
        rect(width / 2, height / 2, 300, 50);

        fill(255); 
        textAlign(CENTER, CENTER);
        textSize(24);
        text("GIF not loaded", width / 2, height / 2);
    }

   
    if (drawing && startX !== undefined && startY !== undefined) {
        stroke(255, 0, 0); 
        strokeWeight(4);
        line(startX, startY, touches.length > 0 ? touches[0].x : mouseX, touches.length > 0 ? touches[0].y : mouseY);
    }

    if (drawnLineVisible && startX !== undefined && startY !== undefined && endX !== undefined && endY !== undefined) {
        stroke(255, 0, 0); 
        strokeWeight(4);
        line(startX, startY, endX, endY);
    }

   
    if (anglePercentage !== null) {
        fill(255); 
        textAlign(CENTER, CENTER);
        textSize(32); 
        text(`Accuracy: ${anglePercentage.toFixed(2)}%`, width / 2, height - 50);
    }
}

function touchStarted() {
    if (!playing && mouseY < height / 2) {
        
        playing = true;
        currentFrame = 0; 
        gif.setFrame(currentFrame); 
        gif.play(); 

        
        frameTimer = setInterval(() => {
            currentFrame++;
            if (currentFrame < totalFrames) {
                gif.setFrame(currentFrame);
            } else {
                clearInterval(frameTimer); 
                gif.pause(); // Pause the GIF
                gif.setFrame(totalFrames - 1); // Set to the last frame
                playing = false; // Allow restarting the animation
            }
        }, frameInterval); 
    } else if (mouseY >= height / 2) {
        // Bottom half of the screen: Start drawing
        drawing = true;
        startX = touches.length > 0 ? touches[0].x : mouseX;
        startY = touches.length > 0 ? touches[0].y : mouseY;
    }
    return false;
}

function touchMoved() {
    // Update the end point of the line while drawing
    if (drawing) {
        endX = touches.length > 0 ? touches[0].x : mouseX;
        endY = touches.length > 0 ? touches[0].y : mouseY;
    }
    return false;
}

function touchEnded() {
    if (drawing) {
      
        drawing = false;

        
        endX = touches.length > 0 ? touches[0].x : mouseX;
        endY = touches.length > 0 ? touches[0].y : mouseY;

        
        calculateAccuracy(startX, startY, endX, endY);

        // Make the drawn line visible for a few seconds
        drawnLineVisible = true;
        clearTimeout(lineTimer); // Clear any existing timer
        lineTimer = setTimeout(() => {
            drawnLineVisible = false; // Hide the line after 3 seconds
        }, 3000);
    }
    return false;
}

function calculateAccuracy(x1, y1, x2, y2) {
    // Imaginary accurate line: (0, height) to (width, 0)
    let accurateStartX = 0;
    let accurateStartY = height;
    let accurateEndX = width;
    let accurateEndY = 0;

    // Calculate the slope of the user's line
    let userSlope = (y2 - y1) / (x2 - x1);

    // Calculate the slope of the accurate line
    let accurateSlope = (accurateEndY - accurateStartY) / (accurateEndX - accurateStartX);

    // Calculate the difference in slopes
    let slopeDifference = abs(userSlope - accurateSlope);

    // Normalize the accuracy percentage (smaller slope difference = higher accuracy)
    anglePercentage = max(0, 100 - slopeDifference * 100);
}