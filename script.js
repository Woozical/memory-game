// For Springboard, June 2021 Cohort
// Mark Tilley

// Access DOM elements
const gameContainer = document.getElementById("game");
const restartButton = document.querySelector('#restartBtn');
const startButton = document.querySelector('#startBtn');
const wipeButton = document.querySelector('#wipeData');
const timerDisplay = document.querySelector('#timer');
const bestTimeDisplay = document.querySelector('#bestTime');
const difficultyForm = document.querySelector('form');

// Initialize game state variables

// This map will let us link DOM elements together with their corresponding javascript objects
// Javascript objects will handle all game logic and state
let cards = new Map();
let cardCompare = [];
let gameStarted = false;
let timerID = 0;
let timer = 0;
  
const colorsNormal = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
];

const colorsHard = [
  'hotpink',
  'yellow',
  'aqua',
  'greenyellow',
  'blueviolet',
]

const colorsInsane = [
  'teal',
  'tan',
  'lightsalmon',
  'paleturquoise',
  'olivedrab',
]

function buildCardColors(){
  let arr = [];
  let difficulty = difficultyForm.difficulty.value;
  arr = arr.concat(colorsNormal, colorsNormal);
  switch(difficulty){
    case "1":
      arr = arr.concat(colorsHard, colorsHard);
      break;
    case "2":
      arr = arr.concat(colorsHard, colorsHard);
      arr = arr.concat(colorsInsane, colorsInsane);
      break;
  }
  return arr;
}

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}


// Helper function to convert an integer measuring seconds into the following format:
// M:SS
function timeToString(seconds){
  let timeMin = `${Math.trunc(seconds/60)}`;
  let timeSec = seconds % 60 < 10 ? `0${seconds % 60}` : `${seconds % 60}`;
  return `${timeMin}:${timeSec}`;
}

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.classList.add(color);
    newDiv.classList.add('hidden');
    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);
    // append the div to the element with an id of game
    gameContainer.append(newDiv);


    // create a corresponding object for game logic
    const card = {
      color : color,
      isFlipped : false,
      isMatched : false,
    }
    // map the card, using the div element as key
    cards.set(newDiv, card);
  }
}

/* Update all card divs to match their game logic state
isFlipped == true means the div should only have its color CSS class
isFlipped == false means the div should have the 'hidden' CSS class
*/
function updateGameBoard(){
  const divs = document.querySelectorAll('div#game div')
  for (let div of divs){
    if (cards.get(div).isFlipped){
      div.classList.remove('hidden');
    } else {
      div.classList.add('hidden');
    }
  }
}

function handleCardClick(event) {
  // if the game has started, do nothing
  if (!gameStarted){
    return;
  }
  // if we're still comparing 2 cards, do nothing
  if (cardCompare.length >= 2){
    return;
  }

  // Debug
  // console.log("you just clicked", event.target);
  // console.log(cards.get(event.target));

  // Get game object card for clicked div
  const clickedCard = cards.get(event.target);

  // Flip a card if it was previously hidden, otherwise do nothing and abort
  if (!clickedCard.isFlipped){
    clickedCard.isFlipped = true;
    updateGameBoard();
  } else {
    return;
  }
  cardCompare.push(clickedCard);
  
  // if two cards are flipped, see if they match
  if (cardCompare.length === 2){
    //match cards
    if (cardCompare[0].color === cardCompare[1].color){
      cardCompare[0].isMatched = true;
      cardCompare[1].isMatched = true;
      cardCompare = [];

      //Check to see if all cards are matched
      let allMatched = true;
      for (let card of cards.values()){
        if (!card.isMatched){
          allMatched = false;
        }
      }

      if (allMatched){
        endGame();
      }

    } else {
      setTimeout(function(){
        cardCompare[0].isFlipped = false;
        cardCompare[1].isFlipped = false;
        cardCompare = [];
        updateGameBoard();
      }, 1000)
    }
  }

}

function restartGame(){
  if (gameStarted){
    clearInterval(timerID);
    gameStarted = false;
  }
  cards = new Map();
  cardCompare = [];
  while (gameContainer.children.length > 0){
    gameContainer.removeChild(gameContainer.firstChild);
  }
  shuffledColors = shuffle(buildCardColors());
  createDivsForColors(shuffledColors);
  startButton.removeAttribute('disabled');
  timer = 0;
  timerDisplay.innerText = `Time: ${timeToString(timer)}`;
}

function startGame(){
  gameStarted = true;
  startButton.setAttribute('disabled', '');
  timerID = setInterval(function(){
    timer += 1;
    timerDisplay.innerText = `Time: ${timeToString(timer)}`;
  }, 1000);
}

// Called when the player has matched all cards
function endGame(){
  //stop and save timer
  clearInterval(timerID);
  const storedBest = parseInt(localStorage.bestTime);
  if (timer < storedBest || !storedBest){
    localStorage.setItem('bestTime', timer);
    bestTimeDisplay.innerText = `Best Time: ${timeToString(timer)}`;
  } else {
    bestTimeDisplay.innerText = `Best Time: ${timeToString(storedBest)}`;
  }
  gameStarted = false;
}

// Load in localStorage data, if it exists
if (localStorage.bestTime){
  bestTimeDisplay.innerText = `Best Time: ${timeToString(parseInt(localStorage.bestTime))}`;
}
if (localStorage.difficulty){
  difficultyForm.difficulty.value = localStorage.difficulty;
}
// Build the game board for the first time
let shuffledColors = shuffle(buildCardColors());
createDivsForColors(shuffledColors);
// Handler for all functionality in the header/menu section
function menuClickHandler(e){
  console.log(e.target);
  switch (e.target){
    case restartButton:
      restartGame();
      break;
    case startButton:
      startGame();
      break;
    case wipeButton:
      localStorage.removeItem('bestTime');
      bestTimeDisplay.innerText = 'Best Time: ?';
      break;
    default:
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'FORM'){
        localStorage.setItem('difficulty', difficultyForm.difficulty.value);
        if (!gameStarted){
          restartGame();
        }
        break;
      }
  }
}
document.querySelector('.header').addEventListener('click', menuClickHandler);