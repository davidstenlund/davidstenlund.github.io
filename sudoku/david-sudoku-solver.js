// A basic JavaScript sudoku solver, written by David Stenlund in June 2023. 

function solveSudoku(xgrid) {
  const xarray = gridToArray(xgrid);
  const xempty = emptyIndices(xgrid);
  return arrayToString(basicSolve(xarray));
}

function basicSolve(xarray, xhistory = [], xval = 0) {
  let row;
  let col;
  let nextval;

  // Find the cell with fewest options
  let {nextCell, nextOptions} = findBestCell(xarray);
  let numopt;
  if (typeof nextOptions === 'undefined' || nextOptions.length == 0) {
    numopt = 0; 
  } else {
    numopt = nextOptions.length;
  }

  // No empty cells left
  if (nextCell === 100) {return xarray;}

  // No valid option left, so we need to backtrack
  if (numopt == 0 || nextOptions[numopt - 1] <= xval) {
    nextCell = xhistory[xhistory.length - 1];
    row = Math.floor(nextCell / 9);
    col = nextCell % 9;
    nextval = xarray[row][col];
    xhistory.pop();
    xarray[row][col] = 0;
    return basicSolve(xarray, xhistory, nextval);
  }
  nextval = nextOptions.find(x => x > xval);
  row = Math.floor(nextCell / 9);
  col = nextCell % 9;
  xarray[row][col] = nextval;
  xhistory.push(nextCell);
  return basicSolve(xarray, xhistory, 0);
}

function findBestCell(xarray) {
  let row;
  let col;
  let leastOptions = 100;
  let nextCell = 100;
  let nextOptions = [];
  for (let i = 0; i < 81; i++) {
    row = Math.floor(i / 9);
    col = i % 9;
    if (xarray[row][col] == 0) {
      let options = cellOptions(xarray, i);
      if (options.length < leastOptions) {
        nextCell = i;
        nextOptions = options;
        leastOptions = options.length;
      }
    }
  }
  return { nextCell, nextOptions };
}

// Available options that can be entered into a given cell
function cellOptions(xarray, xpos) {
  const options = [];
  for (let i = 1; i <= 9; i++) {
    if (validEntry(xarray, xpos, i)) {
      options.push(i);
    }
  }
  return options;
}

function validEntry(xarray, xpos, xval) {
  const xrow = Math.floor(xpos / 9);
  const xcol = xpos % 9;

  if (xval < 1 || xval > 9) {return false;}
  for (let i = 0; i < 9; i++) {
    if (i === xcol) {continue;}
    if (xarray[xrow][i] === xval) {return false;}
  }
  for (let i = 0; i < 9; i++) {
    if (i === xrow) {continue;}
    if (xarray[i][xcol] === xval) {return false;}
  }
  let yrow = Math.floor(xrow / 3) * 3;
  let ycol = Math.floor(xcol / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (yrow + i === xrow && ycol + j === xcol) {continue;}
      if (xarray[yrow + i][ycol + j] === xval) {return false;}
    }
  }
  return true;
}

/*
// Brute force method (discarded, since other method is better)
function bruteSolve(xarray, xempty, xpos = 0, xval = 1) {
  if (xpos >= xempty.length) {
    return xarray;
  } else if (xpos < 0) {
    alert("Something is wrong. The sudoku cannot be solved. ");
    return [[0,0],[0,0]];
  }
  xrow = Math.floor(xempty[xpos] / 9);
  xcol = xempty[xpos] % 9;
  if (xval > 9) {
    xarray[xrow][xcol] = 0;
    xrow = Math.floor(xempty[xpos - 1] / 9);
    xcol = xempty[xpos - 1] % 9;
    return bruteSolve(xarray, xempty, xpos - 1, xarray[xrow][xcol] + 1);
  }
  xarray[xrow][xcol] = xval;
  if (validEntry(xarray, xempty[xpos], xval)) {
    return bruteSolve(xarray, xempty, xpos + 1, 1);
  } else {
    return bruteSolve(xarray, xempty, xpos, xval + 1);
  }
  return xarray;
}
*/

// Find what positions have empty cells
function emptyIndices(xgrid) {
  const xempty = [];
  for (let i = 0; i < 81; i++) {
    if (xgrid.charAt(i) === "0") {
      xempty.push(i);
    }
  }
  return xempty;
}

function gridToArray(xstring) {
  const xarray = [];
  for (let i = 0; i < 9; i++) {
    xarray[i] = [];
    for (let j = 0; j < 9; j++) {
      if (typeof xstring === 'undefined') {
        xarray[i][j] = (parseInt(document.getElementById("cell"+i+j).innerHTML) || 0);
      } else {
        xarray[i][j] = parseInt(xstring.charAt(9 * i + j));
      }
    }
  }
  return xarray;
}

function arrayToString(xarray) {
  let xstring = "";
  for (let i = 0; i < 9; i++) {
    xstring += xarray[i].join("");
  }
  return xstring;
}
