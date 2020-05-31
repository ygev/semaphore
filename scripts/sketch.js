let posX = [0, 0, 0, 0, 0, 0];
let posY = [0, 0, 0, 0, 0, 0];

let lerpPosX = [];
let lerpPosY = [];

let gotPose = false;

let gameStart = false;

let timerValue;

let wave = 0;

let numCorrect = 0;

///angle of waving. first number is left, second number is right
wave_angle = {
  up: [135, 45],
  down: [-135, -45],
};

//angle of letter. first number is left, second number is right
letter_angle = {
  A: [-135, -90],
  B: [180, -90],
  C: [135, -90],
};

function setup() {
  createCanvas(windowHeight * 1.2, windowHeight * 0.9);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  const poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  //set count down interval to 1 second
  setInterval(timeIt, 1000);
}

function modelLoaded() {
  print("Model Loaded!");
  let options = {
    imageScaleFactor: 1,
    minConfidence: 0.9,
  };
}

//recognize poses
function gotPoses(poses) {
  let options = {
    imageScaleFactor: 1,
    minConfidence: 0.9,
  };

  //smooth animation between movement with lerp
  if (poses.length > 0) {
    let newPosX = [];
    let newPosY = [];

    for (let i = 0; i <= 5; i++) {
      newPosX[i] = poses[0].pose.keypoints[i + 5].position.x;
      newPosY[i] = poses[0].pose.keypoints[i + 5].position.y;

      posX[i] = lerp(newPosX[i], posX[i], 0.5);
      posY[i] = lerp(newPosY[i], posY[i], 0.5);
    }

    gotPose = true;
  } else {
    gotPose = false;
  }
}

function draw(poses) {
  //flip the video to mirro user
  push();
  translate(video.width, 0);
  scale(-1.0, 1.0);
  image(video, 0, 0, width, height);

  fill(255);
  //  noStroke();
  if (gotPose == true) {
    drawDots();
  }
  waveStart();
  if (gameStart == true) {
    countDown();

    //generate random letter and compare it to the user's current angle
    if (
      verifyAngle(getUserAngle(), letter_angle[randomLetter]) &&
      timerValue > 0
    ) {
      numCorrect++; //increase score count
      randomLetter = getRandomLetter(letter_angle);
      print(randomLetter);
    } //end the game once the timer runs to 0
    else if (gameStart == false) {
      print("game end");
      print(numCorrect);
    }
  }
}

//draw dots and lines on the person
function drawDots() {
  for (let i = 0; i < posX.length; i++) {
    ellipse(posX[i], posY[i], 20);
  }
  stroke(255);
  strokeWeight(5);

  line(posX[9 - 5], posY[9 - 5], posX[7 - 5], posY[7 - 5]); //left wrist to elbow
  line(posX[7 - 5], posY[7 - 5], posX[5 - 5], posY[5 - 5]); //left elbow to shoulder
  line(posX[5 - 5], posY[5 - 5], posX[6 - 5], posY[6 - 5]); //left shoulder to right shoulder
  line(posX[6 - 5], posY[6 - 5], posX[8 - 5], posY[8 - 5]); //right shoulder to elbow
  line(posX[8 - 5], posY[8 - 5], posX[10 - 5], posY[10 - 5]); //right elbow to wrist
}

//get user's current angle
function getUserAngle() {
  userLeftAngle =
    (Math.atan2(posY[0] - posY[4], posX[0] - posX[4]) * 180) / Math.PI;
  userRightAngle =
    (Math.atan2(posY[1] - posY[5], posX[1] - posX[5]) * 180) / Math.PI;

  return [userLeftAngle, userRightAngle];
}

//verify angle: [0] is left, [1] is right
function verifyAngle(userAngle, correctAngle) {
  marginError = 10;
  if (
    userAngle[0] > correctAngle[0] - 10 &&
    userAngle[0] < correctAngle[0] + 10 &&
    userAngle[1] > correctAngle[1] - 10 &&
    userAngle[1] < correctAngle[1] + 10
  ) {
    return true;
  } else {
    return false;
  }
}

//start game by waving
function waveStart() {
  if (verifyAngle(getUserAngle(), wave_angle["up"]) && wave == 0) {
    wave = 1;
    print("1");
  }
  if (verifyAngle(getUserAngle(), wave_angle["down"]) && wave == 1) {
    wave = 2;
    print("2");
  }
  if (verifyAngle(getUserAngle(), wave_angle["up"]) && wave == 2) {
    wave = 3;
    print("3");
  }
  if (wave == 3) {
    gameStart = true;
    print("start");
    wave = 4;
    timerValue = 3;
    randomLetter = getRandomLetter(letter_angle);
    print(randomLetter);
  }
}

//countdown
function timeIt() {
  if (timerValue > 0) {
    timerValue--;
  }
}

//display countdown and end game when countdown is 0
function countDown() {
  if (timerValue >= 10) {
    print("0:" + timerValue);
  }
  if (timerValue < 10) {
    print("0:0" + timerValue);
  }
  if (timerValue == 0) {
    print("game over");
    gameStart = false;
  }
}

//get a random letter in  letter_angle object
function getRandomLetter(obj) {
  var keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
}
