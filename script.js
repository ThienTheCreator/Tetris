class Piece {
  type = "I";
  position = [];
  upperLeftCorner = {row: 0, col: 0};
  gridSize = 0;
  
  constructor(type, position){
    this.type = type;
    this.position = position;
  }
}

let grid = new Array(21).fill("").map(() => new Array(10).fill(""));
let canvas;
let ctx;
let nextPieceCanvas;
let nextPieceCtx;
let fallingPiece = new Piece("I", [{row: 0, col: 0}]);
let nextPiece;
let isGameOver = true;
let dropSpeed = 400;
let upperLeftCorner = { row: 0, col: 0 };
let gridSize = 0;
let fallingPieceGrid = new Array(4).fill("").map(() => new Array(4).fill(""));

let blockType = ["I", "J", "L", "O", "S", "T", "Z"];

let colorHex = {
  I: "#00f0f0",
  J: "#0000f0",
  L: "#f0a000",
  O: "#f0f000",
  S: "#00f000",
  T: "#a000f0",
  Z: "#d80000",
};

let greyHex = {
  I: "#808080",
  J: "#808080",
  L: "#808080",
  O: "#808080",
  S: "#808080",
  T: "#808080",
  Z: "#808080",
};

let blockColorHex = colorHex;

function setGame() {
  document.getElementById("linesCleared").innerHTML = 0;
  setNextPiece("I");
  gridSize = 4;
  for (let i = 0; i < 21; ++i) {
    for (let j = 0; j < 10; ++j) {
      grid[i][j] = "";
    }
  }
  updateDisplay(ctx, 0);
  fallingPiece.position = [];
  changeNextPieceDisplay(nextPiece.type, blockColorHex[nextPiece.type]);
  updateDisplay(ctx, dropSpeed);
  
  if(isGameOver){
    isGameOver = false;
    mainLoop(ctx);
  }
}

function setGrey() {
  blockColorHex = greyHex;
  updateDisplay(ctx, 0);
  changeNextPieceDisplay(nextPiece.type, blockColorHex[nextPiece.type]);
}

function setColor() {
  blockColorHex = colorHex;
  updateDisplay(ctx, 0);
  changeNextPieceDisplay(nextPiece.type, blockColorHex[nextPiece.type]);
}

// Setup get two canvases and set next piece when first load
window.addEventListener("load", function() {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  nextPieceCanvas = document.getElementById("nextPiece");
  nextPieceCtx = nextPieceCanvas.getContext("2d");

  setGame();
});

function incrementLinesClear() {
  ++document.getElementById("linesCleared").innerHTML;
}

async function mainLoop(ctx) {
  while (!isGameOver) {
    if (fallingPiece.position === undefined || fallingPiece.position.length === 0) {
      let isRowFull = (e) => {
        for (let i = 0; i < e.length; ++i) {
          if (e[i] == "") return false;
        }
        return true;
      };

      // Clears line if it is full
      for (let i = 0; i < 21; ++i) {
        if (isRowFull(grid[i])) {
          for (let j = 0; j < 10; ++j) {
            grid[i][j] = "";
          }
          incrementLinesClear();
          for (let j = i; j > 0; --j) {
            for (let k = 0; k < 10; ++k) {
              grid[j][k] = grid[j - 1][k];
            }
          }
        }
      }

      if (grid[0][3] === "" && grid[0][4] === "" && grid[0][5] === "") {
        changeFallingPiece();

        setNextPiece(blockType[Math.floor(Math.random() * blockType.length)]);
        changeNextPieceDisplay(nextPiece.type, blockColorHex[nextPiece.type]);
      }
    }

    let tempFallingPiece = [];
    if (canFall(fallingPiece.position)) {
      for ({ row, col } of fallingPiece.position) {
        if (row < 20) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col });
        }
      }

      let position = fallingPiece.position.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of position) {
        grid[row][col] = "";
      }
      ++fallingPiece.upperLeftCorner.row;
    }
    fallingPiece.position = tempFallingPiece;

    let canPlace = (grid) => {
      for (let i = 0; i < 10; ++i) {
        if (grid[0][i] != "") return false;
      }
      return true;
    };

    if (!canPlace(grid)) {
      isGameOver = true;
    }

    await updateDisplay(ctx, dropSpeed);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function changeGrid(row, col, color, ctx) {
  ctx.fillStyle = color;
  ctx.fillRect(30 * col + 1, 30 * row + 1, 28, 28);
}

async function updateDisplay(ctx, dropSpeed) {
  return delay(dropSpeed).then((e) => {
    for (let i = 1; i < 21; ++i) {
      for (let j = 0; j < 10; ++j) {
        if (grid[i][j] === "") {
          changeGrid(i - 1, j, "black", ctx);
        } else {
          changeGrid(i - 1, j, blockColorHex[grid[i][j]], ctx);
        }
      }
    }
  });
}

// Returns a boolean if the current piece can fall without conflicting with blocks beneath
function canFall(positions) {
  if (positions.length === 0) return false;

  for ({ row, col } of positions) {
    if (row == undefined || col == undefined || row >= 20) {
      return false;
    }

    for ({ row, col } of positions) {
      if (positions.some((e) => e.row === row + 1 && e.col === col)) {
        continue;
      }
      if (row >= 20 || grid[row + 1][col] != "") return false;
    }
  }

  return true;
}

document.addEventListener("keydown", async function(event) {
  if (event.key === "ArrowDown") {
    dropSpeed = 100;
  } else if (event.key === "ArrowLeft") {
    let canMoveLeft = (position) => {
      if (position.length === 0) return false;

      for ({ row, col } of position) {
        if (position.some((e) => e.row === row && e.col === col - 1)) {
          continue;
        }
        if (col <= 0 || grid[row][col - 1] != "") return false;
      }

      return true;
    };

    let tempFallingPiece = [];
    if (canMoveLeft(fallingPiece.position)) {
      for ({ row, col } of fallingPiece.position) {
        grid[row][col - 1] = grid[row][col];
        tempFallingPiece.push({ row: row, col: col - 1 });
      }

      let position = fallingPiece.position.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of position) {
        grid[row][col] = "";
      }
      fallingPiece.position = tempFallingPiece;
      --fallingPiece.upperLeftCorner.col;
    }
  } else if (event.key === "ArrowRight") {
    let canMoveRight = (position) => {
      if (position.length === 0) return false;

      for ({ row, col } of position) {
        if (position.some((e) => e.row === row && e.col === col + 1)) {
          continue;
        }
        if (col >= 9 || grid[row][col + 1] != "") return false;
      }

      return true;
    };

    let tempFallingPiece = [];
    if (canMoveRight(fallingPiece.position)) {
      for ({ row, col } of fallingPiece.position) {
        grid[row][col + 1] = grid[row][col];
        tempFallingPiece.push({ row: row, col: col + 1 });
      }
      fallingPiece.position = fallingPiece.position.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of fallingPiece.position) {
        grid[row][col] = "";
      }
      fallingPiece.position = tempFallingPiece;
      ++fallingPiece.upperLeftCorner.col;
    }
  } else if (event.key === "ArrowUp") {

    // if falling piece is O block then there is not a need to rotate
    if (fallingPiece.gridSize === 2) return;

    let rotateGrid = new Array(4).fill("").map(() => new Array(4).fill(""));

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        if (fallingPiece.upperLeftCorner.row + i >= 21 || fallingPiece.upperLeftCorner.col + j >= 10) {
          continue;
        }

        if (
          !fallingPiece.position.some(
            (e) => e.row === fallingPiece.upperLeftCorner.row + i && e.col === fallingPiece.upperLeftCorner.col + j
          )
        ) {
          continue;
        }

        rotateGrid[i][j] = grid[fallingPiece.upperLeftCorner.row + i][fallingPiece.upperLeftCorner.col + j];
      }
    }

    // rotate 4x4 of grid for I block only 
    let rotate4 = (gridToRotate) => {
      for (let i = 0; i < 2; ++i) {
        for (let j = i; j < 3 - i; ++j) {
          let temp = gridToRotate[i][j];
          gridToRotate[i][j] = gridToRotate[j][3 - i];
          gridToRotate[j][3 - i] = gridToRotate[3 - i][3 - j];
          gridToRotate[3 - i][3 - j] = gridToRotate[3 - j][i];
          gridToRotate[3 - j][i] = temp;
        }
      }
    };

    // rotate 3x3 of grid for J, L, S, T, Z block
    let rotate3 = (gridToRotate) => {
      for (let i = 0; i < 2; ++i) {
        let temp = gridToRotate[0][i];
        gridToRotate[0][i] = gridToRotate[i][2];
        gridToRotate[i][2] = gridToRotate[2][2 - i];
        gridToRotate[2][2 - i] = gridToRotate[2 - i][0];
        gridToRotate[2 - i][0] = temp;
      }
    };

    if (gridSize === 3) {
      rotate3(rotateGrid);
    } else if (gridSize === 4) {
      rotate4(rotateGrid);
    }

    let temp = "";
    let canRotate = (grid, rotateGrid) => {
      for ({ row, col } of fallingPiece.position) {
        temp = grid[row][col];
        grid[row][col] = "";
      }

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          if (rotateGrid[i][j] != "") {
            if (
              fallingPiece.upperLeftCorner.row + i >= 21 ||
              fallingPiece.upperLeftCorner.col + j >= 10 ||
              grid[fallingPiece.upperLeftCorner.row + i][fallingPiece.upperLeftCorner.col + j] != ""
            ) {
              for ({ row, col } of fallingPiece.position) {
                grid[row][col] = temp;
              }
              return false;
            }
          }
        }
      }
      return true;
    };

    if (canRotate(grid, rotateGrid)) {
      for ({ row, col } of fallingPiece.position) {
        grid[row][col] = "";
      }
      fallingPiece.position = [];

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          if (rotateGrid[i][j] != "") {
            grid[fallingPiece.upperLeftCorner.row + i][fallingPiece.upperLeftCorner.col + j] = temp;
            fallingPiece.position.push({ row: fallingPiece.upperLeftCorner.row + i, col: fallingPiece.upperLeftCorner.col + j });
          }
        }
      }
    }
  }
  updateDisplay(ctx, 100);
});

document.addEventListener("keyup", async function(event) {
  if (event.key === "ArrowDown") {
    dropSpeed = 400;
  } else if (event.key === " ") {
    while (canFall(fallingPiece.position)) {
      let tempFallingPiece = [];
      for ({ row, col } of fallingPiece.position) {
        if (row < 20) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col });
        }
      }

      let position = fallingPiece.position.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of position) {
        grid[row][col] = "";
      }
      fallingPiece.position = tempFallingPiece;
    }
    fallingPiece.position = [];
    updateDisplay(ctx, 100);
  }
});

// Fill square with upper-left corner based on x and y on next piece canvas
// num represents how many squares or the shape of the rectangle
function horizontalSquares(x, y, num, color) {
  nextPieceCtx.fillStyle = color;
  for (let i = 0; i < num; ++i) {
    nextPieceCtx.fillRect(30 * i + x, y + 1, 28, 28);
  }
}

// Display next block based on the pixels
function changeNextPieceDisplay(blockType, color) {
  nextPieceCtx.fillStyle = "black";
  nextPieceCtx.fillRect(0, 0, 150, 150);

  if (blockType == "I") {
    horizontalSquares(16, 61, 4, color);
  } else if (blockType == "J") {
    horizontalSquares(31, 46, 1, color);
    horizontalSquares(31, 76, 3, color);
  } else if (blockType == "L") {
    horizontalSquares(91, 46, 1, color);
    horizontalSquares(31, 76, 3, color);
  } else if (blockType == "O") {
    horizontalSquares(46, 46, 2, color);
    horizontalSquares(46, 76, 2, color);
  } else if (blockType == "S") {
    horizontalSquares(61, 46, 2, color);
    horizontalSquares(31, 76, 2, color);
  } else if (blockType == "T") {
    horizontalSquares(61, 46, 1, color);
    horizontalSquares(31, 76, 3, color);
  } else if (blockType == "Z") {
    horizontalSquares(31, 46, 2, color);
    horizontalSquares(61, 76, 2, color);
  }
}

function setNextPiece(blockType) {
  let newPiece = new Piece(blockType, []);

  switch (blockType) {
    case "I":
      newPiece.gridSize = 4;
      newPiece.upperLeftCorner.row = -1;
      newPiece.upperLeftCorner.col = 3;
      break;
    case "J":
    case "L":
    case "S":
    case "T":
    case "Z":
      newPiece.gridSize = 3;
      newPiece.upperLeftCorner.row = 0;
      newPiece.upperLeftCorner.col = 3;
      break;
    case "O":
      newPiece.gridSize = 2;
      newPiece.upperLeftCorner.row = -1;
      newPiece.upperLeftCorner.col = 3;
      break;
  }

  if (blockType == "I") {
    for (let i = 3; i <= 6; ++i) {
      newPiece.position.push({ row: 0, col: i });
    }
  } else if (blockType == "J") {
    newPiece.position.push({ row: 0, col: 3 });
    for (let i = 3; i <= 5; ++i) {
      newPiece.position.push({ row: 1, col: i });
    }
  } else if (blockType == "L") {
    newPiece.position.push({ row: 0, col: 5 });
    for (let i = 3; i <= 5; ++i) {
      newPiece.position.push({ row: 1, col: i });
    }
  } else if (blockType == "O") {
    for (let i = 4; i <= 5; ++i) {
      newPiece.position.push({ row: 0, col: i });
      newPiece.position.push({ row: 1, col: i });
    }
  } else if (blockType == "S") {
    for (let i = 4; i <= 5; ++i) {
      newPiece.position.push({ row: 0, col: i });
      newPiece.position.push({ row: 1, col: i - 1 });
    }
  } else if (blockType == "T") {
    newPiece.position.push({ row: 0, col: 4 });
    for (let i = 3; i <= 5; ++i) {
      newPiece.position.push({ row: 1, col: i });
    }
  } else if (blockType == "Z") {
    for (let i = 4; i <= 5; ++i) {
      newPiece.position.push({ row: 0, col: i - 1 });
      newPiece.position.push({ row: 1, col: i });
    }
  }
  
  nextPiece = newPiece;
}

// Keeps track of the falling pieces by pusing to a variable
function changeFallingPiece() {
  let canPlaceNextPiece = (position) => {
    for({ row, col } of position){
      if(grid[row][col] !== "")
        return false;
    }
    return true;
  }

  if(canPlaceNextPiece(nextPiece.position)){

    fallingPiece = nextPiece;
    for({ row, col } of fallingPiece.position){
      grid[row][col] = fallingPiece.type;
    }
    setNextPiece;
  }else {
    isGameOver = true;
  }
}
