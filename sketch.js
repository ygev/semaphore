let posX = [0, 0, 0, 0, 0, 0];
let posY = [0, 0, 0, 0, 0, 0];

let lerpPosX = [];
let lerpPosY = [];

let leftAlphaAngle = [
  -135,
  -180,
  135,
  90,
  -90,
  -90,
  -90,
  -180,
  135,
  90,
  -135,
  -135,
  -135,
  -135,
  -135,
  -180,
  -180,
  -180,
  -180,
  135,
  135,
  90,
  45,
  45,
  135,
  -45
];
let rightAlphaAngle = [
  -90,
  -90,
  -90,
  -90,
  45,
  0,
  -45,
  -135,
  -135,
  0,
  90,
  45,
  0,
  -45,
  135,
  90,
  45,
  0,
  -45,
  90,
  45,
  -45,
  0,
  -45,
  0,
  0
];

let errorLeftAngle = [135, -135, 135, -135];
let errorRightAngle = [45, -45, 45, -45];

let alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
];

let gotPose = false;

let startTime = 0;

let ierror = 0;

let i = 0;

function setup() {
  createCanvas(windowHeight * 1.4, windowHeight);
  video = createCapture(VIDEO);
  video.size(height * 1.4, height);
  video.hide();

  const poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
}

function modelLoaded() {
  print("Model Loaded!");
  let options = {
    imageScaleFactor: 1,
    minConfidence: 0.9
  };
}

function gotPoses(poses) {
  let options = {
    imageScaleFactor: 1,
    minConfidence: 0.9
  };

  //print(poses);
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

  // print(posX);
  let leftAngle = getLeftAngle(posX, posY);
  let rightAngle = getRightAngle(posX, posY);
  //print("left: " + leftAngle);
  //print("right: " + rightAngle);
  //verifyAngle(leftAngle, leftAlphaAngle, rightAngle, rightAlphaAngle, 4);

  let a = select(".big-letter");
  if (
    verifyAngle(leftAngle, errorLeftAngle, rightAngle, errorRightAngle, ierror)
  ) {
    ierror++;
  }
  if (ierror >= 3) {
    print("game start");
    if (i < alphabet.length) {
      a.html(alphabet[i]);
    }
    if (
      verifyAngle(leftAngle, leftAlphaAngle, rightAngle, rightAlphaAngle, i)
    ) {
      print(alphabet[i]);
      i++;
    }
  }
}

function verifyAngle(
  leftAngle,
  leftAlphaAngle,
  rightAngle,
  rightAlphaAngle,
  letter
) {
  if (
    leftAngle > leftAlphaAngle[letter] - 10 &&
    leftAngle < leftAlphaAngle[letter] + 10 &&
    rightAngle > rightAlphaAngle[letter] - 10 &&
    rightAngle < rightAlphaAngle[letter] + 10
  ) {
    return true;
  } else {
    return false;
  }
}

function getLeftAngle(posX, posY) {
  return (Math.atan2(posY[0] - posY[4], posX[0] - posX[4]) * 180) / Math.PI;
}

function getRightAngle(posX, posY) {
  return (Math.atan2(posY[1] - posY[5], posX[1] - posX[5]) * 180) / Math.PI;
}
