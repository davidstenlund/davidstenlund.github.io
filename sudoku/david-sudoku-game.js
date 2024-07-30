// JavaScript sudoku game written by David Stenlund in June 2023. 

// Game variables stored in this object
const gameVar = {
  startTime: 0, 
  endTime: 0, 
  pausedTime: 0, 
  gamePaused: false,
  nowSolving: false,
  idGrid: 0, 
  startGrid: "0".repeat(81), 
  currentGrid: "0".repeat(81),
  solutionGrid: "0".repeat(81)
}

// Start a new game or load a saved one
function newSudokuGame(xid, xsaved, xtime) {
  let sudokuIndex;

  // If optional arguments are missing, start a random sudoku
  if (typeof xid === 'undefined') {
    sudokuIndex = Math.floor(Math.random() * sudokuLibrary.length);
  } else {
    sudokuIndex = getPuzzleIndex(xid);
    if (sudokuIndex === -1) { 
      alert("Error. Sudoku puzzle cannot be found," 
              + "likely due to an invalid puzzle number. Please try again.");
    }
  }

  // Store information about the new board and its solution
  gameVar.idGrid = sudokuLibrary[sudokuIndex][0];
  gameVar.startGrid = sudokuLibrary[sudokuIndex][1];
  gameVar.solutionGrid = sudokuLibrary[sudokuIndex][2]; 

  // Optional input: a string of saved progress
  if (typeof xsaved === 'undefined') { gameVar.currentGrid = sudokuLibrary[sudokuIndex][1]; } 
  else { gameVar.currentGrid = xsaved; }

  // Optional input: time used solving when progress was saved
  if (typeof xtime === 'undefined') { gameVar.startTime = new Date().getTime(); } 
  else { gameVar.startTime = new Date().getTime() - xtime; }

  setupGrid(gameVar.startGrid, gameVar.currentGrid);

  if (gameVar.currentGrid !== gameVar.solutionGrid) { gameVar.nowSolving = true; } 
  else { gameVar.nowSolving = false; }

  gameVar.gamePaused = false;
}

// Function for checking if the correct solution has been found
function checkGame() { 
  let cellsLeft = 0;
  let errorsFound = 0;
  let clickTime;
  let message = "";
  clearSelection();
  gameVar.currentGrid = gridToString();

  // Solution found
  if (gameVar.currentGrid === gameVar.solutionGrid) {
    if (gameVar.nowSolving) {
      gameVar.endTime = new Date().getTime();
      gameVar.nowSolving = false;
    }
    clickTime = (gameVar.endTime - gameVar.startTime);
    message += "Well done!<br><br>" + "You solved the sudoku in " + writeOutTime(clickTime);
  } 

  // Solution not yet found
  else { 
    clickTime = new Date().getTime() - gameVar.startTime;
    for (let i = 0; i < 81; i++) {
      if (gameVar.currentGrid.charAt(i) === '0') {
        cellsLeft += 1;
      } else if ( gameVar.currentGrid.charAt(i) !== gameVar.solutionGrid.charAt(i) ) {
        errorsFound += 1;
      }
    }
    message = "You still have " + cellsLeft + " more cells to fill out. <br><br>"
          + ( errorsFound > 0 ? 
                  "There are errors in " + errorsFound + " of the cells. <br><br>" : "" )
          + "Your time so far is: " + writeOutTime(clickTime);
  }

  // Write the result in the popup window
  document.getElementById("checkMessage").innerHTML = message;
  openPopup("popupCheck");
}

// Function for saving an unfinished game
function saveGame() {
  let clickTime;
  let saveString;
  let message = "";
  clearSelection();
  gameVar.currentGrid = gridToString();
  if (!gameVar.nowSolving) {
    clickTime = gameVar.endTime - gameVar.startTime;
  } else {
    clickTime = new Date().getTime() - gameVar.startTime;
  }

  // Puzzle number, current progress and time saved in a string
  saveString = gameVar.currentGrid.substring(0,25) + padNumber(gameVar.idGrid, 6) 
          + gameVar.currentGrid.substring(25,50) + padNumber(clickTime, 13) 
          + gameVar.currentGrid.substring(50);

  // Information printed in popup window
  message += "The current puzzle number is: " + gameVar.idGrid + "<br><br>"
          + "If you want to save your progress and continue another time, "
          + "you can copy and store the following line of digits "
          + "and then enter it when starting a new game. <br><br>";
  message += "<textarea rows='3' style='width: 100%;' readonly>" + saveString + "</textarea>";
  document.getElementById("saveMessage").innerHTML = message;
  openPopup("popupSave");
}

// Show given sudoku in the grid on the page
function setupGrid(xgiven, xsolved) {
  let row;
  let col;
  let gridText = "";
  if (typeof xsolved === 'undefined') {
    xsolved = xgiven;
  } 
  for (let i = 0; i < 81; i++) {
    row = Math.floor(i/9);
    col = i % 9; 
    gridText += "<div class='cell"
          + (xgiven.charAt(i) !== '0' ? " givenValue" : "")
          + "' id='cell" + row + col
          + "' style='border-width: "
          + ( row % 3 === 0 ? "2px " : "0.5px ")
          + ( col % 3 === 2 ? "2px " : "0.5px ")
          + ( row % 3 === 2 ? "2px " : "0.5px ")
          + ( col % 3 === 0 ? "2px " : "0.5px ")
          + "' onmousedown='disableDrag(event)'>";

    // Show the numbers entered so far
    gridText += (xsolved.charAt(i) !== '0' ? xsolved.charAt(i) : "") + "</div>";
  }
  document.getElementById("theGrid").innerHTML = gridText;
}

// Select puzzle to solve based on user inpput
function puzzleSelection() {
  let xid;
  let xstring;

  // Random sudoku
  if (document.getElementById("radioRandom").checked) {
    newSudokuGame();
    closePopup();
  } 

  // Puzzle selected by number
  else if (document.getElementById("radioPuzzle").checked) {
    xid = document.getElementById("inputPuzzle").value;
    if (isNaN(xid) || getPuzzleIndex(Number(xid)) == -1) {
      document.getElementById("wrongPuzzleNumber").innerHTML = "No such puzzle number found.";
    } else {
      newSudokuGame(Number(xid));
      closePopup();
    }
  } 

  // Load a saved game
  else {
    xstring = document.getElementById("inputSaved").value;
    if (!xstring || xstring.trim().length != 100) {
      document.getElementById("wrongSavedNumber").innerHTML 
              = "Cannot open game. Make sure the entered string is exactly the same as was saved.";
    } else {
      xstring = xstring.replace(/\D/g,'');
      xid = Number(xstring.substring(25, 31));
      let xsaved = xstring.substring(0, 25) + xstring.substring(31, 56) + xstring.substring(69);
      let xtime = Number(xstring.substring(56, 69));
      newSudokuGame(xid, xsaved, xtime); 
      closePopup();
    }
  }
}

// Print grid with "START" when page loads
function startView() { 
  let row;
  let col;
  let entry;
  let gridText = "";
  for (let i = 0; i < 81; i++) {
    row = Math.floor(i/9);
    col = i % 9; 
    switch (i) {
      case 38: entry = 'S'; break;
      case 39: entry = 'T'; break;
      case 40: entry = 'A'; break;
      case 41: entry = 'R'; break;
      case 42: entry = 'T'; break;
      default: entry = ''; break;
    }

    // Set cell borders in sudoku grid
    gridText += "<div class='cell givenValue' "
        + "' style='border-width: "
        + ( row % 3 === 0 ? "2px " : "0.5px ")
        + ( col % 3 === 2 ? "2px " : "0.5px ")
        + ( row % 3 === 2 ? "2px " : "0.5px ")
        + ( col % 3 === 0 ? "2px " : "0.5px ");

    // Start a new game when player clicks on the grid
    gridText += "' onclick='newSudokuGame()' onmousedown='disableDrag(event)'>" + entry + "</div>";
  }
  document.getElementById("theGrid").innerHTML = gridText;
}

// Pause game and hide the board
function pauseGame() {
  let row;
  let col;
  let entry;
  let gridText = "";

  // If already paused, resume game play
  if (gameVar.gamePaused) {
    setupGrid(gameVar.startGrid, gameVar.currentGrid);
    document.getElementById("buttonPause").innerHTML = "Pause";

    // Shift start time value by the amount of time that the game was paused
    if (gameVar.nowSolving) {
      let resumeTime = new Date().getTime(); 
      gameVar.startTime += (resumeTime - gameVar.pausedTime);
      gameVar.gamePaused = false;
    }
  } 

  // If not paused previously, then pause the game now
  else {
    // Store time when game was paused
    if (gameVar.nowSolving) { gameVar.pausedTime = new Date().getTime(); }
    document.getElementById("buttonPause").innerHTML = "Resume";
    gameVar.currentGrid = gridToString();

    // Display "PAUSED" on the game board
    for (let i = 0; i < 81; i++) {
      row = Math.floor(i/9);
      col = i % 9; 
      switch (i) {
        case 37: entry = 'P'; break;
        case 38: entry = 'A'; break;
        case 39: entry = 'U'; break;
        case 40: entry = 'S'; break;
        case 41: entry = 'E'; break;
        case 42: entry = 'D'; break;
        case 43: entry = '...'; break;
        default: entry = ''; break;
      }
      gridText += "<div class='cell givenValue' "
          + "' style='border-width: "
          + ( row % 3 === 0 ? "2px " : "0.5px ")
          + ( col % 3 === 2 ? "2px " : "0.5px ")
          + ( row % 3 === 2 ? "2px " : "0.5px ")
          + ( col % 3 === 0 ? "2px " : "0.5px ")
          + "' onclick='pauseGame()' " + "onmousedown='disableDrag(event)'>" + entry + "</div>";
    }
    document.getElementById("theGrid").innerHTML = gridText;
    gameVar.gamePaused = true;
  }
}

// Find what array index corresponds to the given puzzle number
function getPuzzleIndex(xid) {
  for (let i = 0; i < sudokuLibrary.length; i++) {
    if (sudokuLibrary[i][0] == xid) {return i};
  }
  return -1;
}

// Add number input to all selected cells in the grid
function addEntry(newEntry) {
  const selectedCells = document.querySelectorAll(".selected");
  for (let i = 0; i < selectedCells.length; i++) {
    selectedCells[i].innerHTML = newEntry;
    selectedCells[i].classList.remove("selected");
  }
}

// Deselect all cells
function clearSelection() {
  const selectedCells = document.querySelectorAll(".selected");
  for (let i = 0; i < selectedCells.length; i++) {
    selectedCells[i].classList.remove("selected");
  }
}

// Custom popup boxes
function openPopup(boxid) {
  let theBox;
  let boxtop; 
  let rect;

  // Scroll the page if necessary to ensure that the entire sudoku grid is visible
  const xgrid = document.getElementById("theGrid");
  rect = xgrid.getBoundingClientRect();
  if (rect.top < 0) {
    window.scrollBy(0, rect.top); 
  } else if (rect.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
    const scrollAmount = rect.bottom - (window.innerHeight || document.documentElement.clientHeight);
    window.scrollBy(0, scrollAmount);
  }

  document.getElementById(boxid).classList.add("open");
  switch (boxid) {
    case "popupNewGame": theBox = document.getElementById("popupNewGameBody"); break;
    case "popupCheck": theBox = document.getElementById("popupCheckBody"); break;
    case "popupSave": theBox = document.getElementById("popupSaveBody"); break;
    default: break;
  }

  // Place popup box on the sudoku grid (centered on page)
  rect = xgrid.getBoundingClientRect();
  if (window.innerWidth > 400) {
    boxtop = rect.top + 30; 
    theBox.style.top = boxtop+"px";
    theBox.style.transform = "translate(-50%, 0)";
/*
    let boxleft; 
    boxleft = rect.left + 30; 
    theBox.style.left = boxleft+"px";
*/
  // Dynamical width for small screens
  } else {
    boxtop = rect.top * (100 / window.innerWidth) + 7; 
    boxleft = rect.left * (100 / window.innerWidth) + 7; 
    theBox.style.top = boxtop+"vw";
/*
    theBox.style.left = boxleft+"vw";
*/
  }
  document.body.classList.add("popupActive");
}

// Close popup box and reset all input fields
function closePopup() {
  document.querySelector(".popupBox.open").classList.remove("open");
  document.body.classList.remove("popupActive");
  document.getElementById("radioRandom").checked = true;
  document.getElementById("inputPuzzle").value = "";
  document.getElementById("inputSaved").value = "";
  document.getElementById("wrongPuzzleNumber").innerHTML = "&nbsp;";
  document.getElementById("wrongSavedNumber").innerHTML = "&nbsp;";
  document.getElementById("fieldPuzzle").style.display = "none";
  document.getElementById("fieldSaved"). style.display = "none";
}

// Show/hide messages depending on radio button choice
function radioFieldCheck() {
  if (document.getElementById("radioPuzzle").checked) {
    document.getElementById("fieldPuzzle").style.display = "block";
  } else {
    document.getElementById("fieldPuzzle"). style.display = "none";
  }
  if (document.getElementById("radioSaved").checked) {
    document.getElementById("fieldSaved"). style.display = "block";
  } else {
    document.getElementById("fieldSaved"). style.display = "none";
  }
}

// Save the puzzle progress to a string
function gridToString() {
  let saveString = "";
  let xentry;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      xentry = document.getElementById("cell"+i+j).innerHTML;
      ( xentry === "" ? saveString += "0" : saveString += xentry );
    }
  }
  return saveString;
}

// Write a number as a string with padded zeroes in front
function padNumber(number, chars) {
  number = number.toString();
  while (number.length < chars) {
    number = "0" + number;
  }
  return number;
}

// Write a time value (in milliseconds) as text
function writeOutTime(xtime) {
  let timeString = "";
  const hours = Math.floor((xtime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((xtime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((xtime % (1000 * 60)) / 1000);
  timeString += ( hours > 0 ? hours + "&nbsp;hour" + ( hours !== 1 ? "s" : "" ) + ", " : "" );
  timeString += ( minutes > 0 ? minutes + "&nbsp;minute" 
          + ( minutes !== 1 ? "s" : "" ) + " and " : "" );
  timeString += seconds + "&nbsp;second" + ( seconds !== 1 ? "s" : "" ) + ". ";
  return timeString;
}


// Prevent a text cursor if clicking and dragging on the grid
function disableDrag(e) {
  e.preventDefault();
}

// Function for what happens on a click
document.addEventListener('click', function(e){   

  // Popup box open and clicked on background
  if (event.target.classList.contains('popupBox')) {
    closePopup();
  } 

  // Clicked in a sudoku grid cell
  else if (gameVar.nowSolving && e.target.classList.contains("cell")){
    mycell = e.target; 
    if (mycell.classList.contains("givenValue")) {
      return;
    }
    if (e.shiftKey) {
      mycell.classList.toggle("selected");
    } else {
      clearSelection();
      mycell.classList.add("selected");
    }
  } 

  // Clicked on one of the game buttons
  else if (e.target.classList.contains("gameButton")){
    switch (e.target.id) {
      case "buttonCheck": checkGame(); break;
      case "buttonNew": openPopup("popupNewGame"); break;
      case "buttonSave": saveGame(); break;
      case "buttonPause": pauseGame(); break;
      case "buttonClose1":
      case "buttonClose2":
      case "buttonClose3": closePopup(); break;
      case "buttonPopupNewGame": puzzleSelection(); break;
      case "buttonPopupRestart": newSudokuGame(gameVar.idGrid); closePopup(); break;
      case "buttonClear": addEntry(""); break;
      default: return;
    }
  } 

  // Clicked on one of the digit buttons
  else if (e.target.classList.contains("digitButton")){
    switch (e.target.id) {
      case "button1": addEntry(1); break;
      case "button2": addEntry(2); break;
      case "button3": addEntry(3); break;
      case "button4": addEntry(4); break;
      case "button5": addEntry(5); break;
      case "button6": addEntry(6); break;
      case "button7": addEntry(7); break;
      case "button8": addEntry(8); break;
      case "button9": addEntry(9); break;
      default: return;
    } 
  } 

  // Clicked on a radio button
  else if (e.target.type === "radio") {
    switch (e.target.id) {
      case "radioRandom": 
      case "radioPuzzle": 
      case "radioSaved": radioFieldCheck(); break;
      default: return;
    } 
  } 

  // Clicked somewhere else
  else {
    clearSelection();
  }
});

// Actions when certain keys are pressed
document.addEventListener('keydown', function(e){
  if (e.defaultPrevented) {
    return;
  }

  // Default actions for popup boxes on enter key
  if (e.key === "Enter") {
    if (document.getElementById("popupNewGame").classList.contains("open")) { puzzleSelection(); }
    else if (document.getElementById("popupCheck").classList.contains("open")) { closePopup(); }
    else if (document.getElementById("popupSave").classList.contains("open")) { closePopup(); }
  }

  // Numbers can be entered by key strokes
  switch (e.key) {
    case "1": addEntry(1); break;
    case "2": addEntry(2); break;
    case "3": addEntry(3); break;
    case "4": addEntry(4); break;
    case "5": addEntry(5); break;
    case "6": addEntry(6); break;
    case "7": addEntry(7); break;
    case "8": addEntry(8); break;
    case "9": addEntry(9); break;
    case "Backspace": addEntry(""); break;
    default: return;
  }
});


// Initialize the game when page has loaded
window.addEventListener('load', startView());

