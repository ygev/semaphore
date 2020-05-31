let posX = [0, 0, 0, 0, 0, 0];
let posY = [0, 0, 0, 0, 0, 0];

let lerpPosX = [];
let lerpPosY = [];

let gotPose = false;

let gameStart = false;

let timerValue;

let wave = 0;

function setup() {
  createCanvas(windowHeight * 1.35, windowHeight);
  video = createCapture(VIDEO);
  video.size(height * 1.35, height);
  video.hide();
  const poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
  setInterval(timeIt, 1000);
}

function modelLoaded() {
  print("Model Loaded!");
  let options = {
    imageScaleFactor: 1,
    minConfidence: 0.9,
  };
  startTime = second();
}

function gotPoses(poses) {
  let options = {
    imageScaleFactor: 1,
    minConfidence: 0.9,
  };

  //smooth animation between movements
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
  }
}

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

function getUserAngle() {
  userLeftAngle =
    (Math.atan2(posY[0] - posY[4], posX[0] - posX[4]) * 180) / Math.PI;
  userRightAngle =
    (Math.atan2(posY[1] - posY[5], posX[1] - posX[5]) * 180) / Math.PI;

  return [userLeftAngle, userRightAngle];
}

function verifyAngle(userAngle, correctAngle) {
  marginError = 10;
  if (
    userAngle[0] > correctAngle[0] - 10 &&
    userAngle[0] < correctAngle[0] + 10
  ) {
    return true;
  } else {
    return false;
  }
}

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
    timerValue = 12;
  }
}

wave_angle = {
  up: [135, 45],
  down: [-135, -45],
};

function timeIt() {
  if (timerValue > 0) {
    timerValue--;
  }
}

function countDown() {
  print("hi");
  if (timerValue >= 10) {
    print("0:" + timerValue);
  }
  if (timerValue < 10) {
    print("0:0" + timerValue);
  }
  if (timerValue == 0) {
    print("game over");
  }
}
