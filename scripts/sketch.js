let posX = [0, 0, 0, 0, 0, 0];
let posY = [0, 0, 0, 0, 0, 0];

let lerpPosX = [];
let lerpPosY = [];

let gotPose = false;

let gameStart = false;

let timerValue, previousLetter;

let wave = 1;

let numCorrect = 0;

let videoWidth, videoHeight;

let firstHint, secondHint;

///angle of waving. first number is left, second number is right
wave_angle = {
  up: [-180, 0],
  down: [-135, -45],
};

//angle of letter. first number is left, second number is right
letter_angle = {
  A: [-90, -45],
  B: [-90, 0],
  C: [-90, 45],
  D: [-90, 90],
  E: [135, -90],
  F: [-180, -90],
  G: [-135, -90],
  H: [-45, 0],
  I: [-45, 45],
  J: [-180, 90],
  K: [90, -45],
  L: [135, -45],
  M: [-180, -45],
  N: [-135, -45],
  O: [45, 0],
  P: [90, 0],
  Q: [135, 0],
  R: [-180, 0],
  S: [-135, 0],
  T: [90, 45],
  U: [135, 45],
  V: [-135, 90],
  W: [-180, 135],
  X: [-135, 135],
  Y: [-180, 45],
  Z: [-180, -135],
};

function setup() {
  createCanvas(windowHeight * 1.4, windowHeight * 0.8);
  video = createCapture(VIDEO);
  videoWidth = width;
  videoHeight = width * 0.75;
  video.size(videoWidth, videoHeight);
  video.hide();
  const poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  //set count down interval to 1 second
  setInterval(timeIt, 1000);
}

function modelLoaded() {
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
  push();
  translate(video.width, 0);
  scale(-1.0, 1.0);
  image(video, 0, 0, videoWidth, videoHeight);

  fill(255);

  if (gotPose == true) {
    drawDots();
  }
  waveStart(3);
  if (gameStart == true) {
    countDown();
    initDom();

    if (
      verifyAngle(getUserAngle(), letter_angle[randomLetter], 10) &&
      timerValue > 0
    ) {
      numCorrect++; //increase score count
      previousLetter = randomLetter;
      randomLetter = getRandomLetter(letter_angle);

      while (randomLetter == previousLetter) {
        randomLetter = getRandomLetter(letter_angle);
      }
      gameDom();
    } //end the game once the timer runs to 0
    else if (gameStart == false) {
      handleEnd();
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
function verifyAngle(userAngle, correctAngle, marginError) {
  if (
    userAngle[0] > correctAngle[0] - marginError &&
    userAngle[0] < correctAngle[0] + marginError &&
    userAngle[1] > correctAngle[1] - marginError &&
    userAngle[1] < correctAngle[1] + marginError
  ) {
    return true;
  } else {
    return false;
  }
}

//start game by waving
function waveStart(numWave) {
  if (verifyAngle(getUserAngle(), wave_angle["up"], 25) && wave % 2 == 1) {
    wave++;
  }
  if (verifyAngle(getUserAngle(), wave_angle["down"], 25) && wave % 2 == 0) {
    wave++;
  }
  if (wave == numWave) {
    gameStart = true;
    wave++;
    timerValue = 12;
    randomLetter = getRandomLetter(letter_angle);
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
  let timerText = select(".countdown__num");
  if (timerValue >= 10) {
    timerText.html(timerValue);
  }
  if (timerValue < 10) {
    timerText.html("0" + timerValue);
  }
  if (timerValue == 0) {
    gameStart = false;
    timerText.html("0" + timerValue);
  }
}

//get a random letter in  letter_angle object
function getRandomLetter(obj) {
  let keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
}

function handleEnd() {
  endArrow = select(".start-end__img");
  endArrow.addClass("start-end__img-move");

  uiScore = select(".score");
  uiTimer = select(".countdown");

  uiScore.addClass("score-end");
  uiTimer.addClass("countdown-end");

  uiInfo = select(".info");
  uiInfo.addClass("info-end");

  endCard = select(".hint-end");
  endCard.addClass("hint-end-mid");

  finalScore = select(".hint__final-score");
  if (numCorrect < 10) {
    finalScore.html("0" + numCorrect);
  }
  if (numCorrect >= 10) {
    finalScore.html(numCorrect);
  }

  firstHint = select(".hint-mid");
  firstHint.removeClass("hint-mid");
  firstHint.addClass("hint-top");
}

//dom animation and replacement
function initDom() {
  firstHint = select(".hint-mid");
  secondHint = select(".hint-bttm");
  if (firstHint != null && secondHint != null) {
    //move position of hints
    firstHint.removeClass("hint-mid");
    firstHint.addClass("hint-top");
    secondHint.removeClass("hint-bttm");
    secondHint.addClass("hint-mid");

    //change text and image on hint
    secondTopText = select(".hint__toptxt-bttm");
    secondTopText.html("Strike a pose");
    document.getElementById("img-2").src =
      "images/letters/" + randomLetter + ".svg";
    secondBottomText = select(".hint__bottomtxt-bttm");
    secondBottomText.html("for");
    secondLetter = select(".hint__letter-bttm");
    secondLetter.html(randomLetter);
  }
  //change letter and image
}

function gameDom() {
  correctArrow = select(".correct__img");
  correctArrow.removeClass("correct__img-init");

  correctArrow.removeClass("correct__img-moveUp");
  //check if it's odd
  scoreText = select(".score__num");
  if (numCorrect < 10) {
    scoreText.html("0" + numCorrect);
  }
  if (numCorrect >= 10) {
    scoreText.html(numCorrect);
  }

  //if odd
  if (numCorrect % 2 == 1) {
    firstHint = select(".hint-top");
    secondHint = select(".hint-mid");

    if (firstHint != null && secondHint != null) {
      firstHint.removeClass("hint-top");
      firstHint.addClass("hint-mid");
      secondHint.removeClass("hint-mid");
      secondHint.addClass("hint-top");

      //change text and image on hint
      firstTopText = select(".hint__toptxt-mid");
      firstTopText.html("Strike a pose");
      document.getElementById("img-1").src =
        "images/letters/" + randomLetter + ".svg";
      firstBottomText = select(".hint__bottomtxt-mid");
      firstBottomText.html("for");
      firstLetter = select(".hint__letter-mid");
      firstLetter.html(randomLetter);
    }
  }
  //check if it's even
  else if (numCorrect % 2 == 0) {
    firstHint = select(".hint-mid");
    secondHint = select(".hint-top");
    if (firstHint != null) {
      firstHint.removeClass("hint-mid");
      firstHint.addClass("hint-top");
      secondHint.removeClass("hint-top");
      secondHint.addClass("hint-mid");

      //change text and image on hint
      secondTopText = select(".hint__toptxt-bttm");
      secondTopText.html("Strike a pose");
      document.getElementById("img-2").src =
        "images/letters/" + randomLetter + ".svg";
      secondBottomText = select(".hint__bottomtxt-bttm");
      secondBottomText.html("for");
      secondLetter = select(".hint__letter-bttm");
      secondLetter.html(randomLetter);
    }
  }
  correctArrow.addClass("correct__img-moveUp");
}
