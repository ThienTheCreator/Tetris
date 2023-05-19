let grid = new Array(21).fill("").map(() => new Array(10).fill(""));
let canvas;
let ctx;
let nextPieceCanvas;
let nextPieceCtx;
let fallingPiece = [];
let nextPiece;
let isGameOver = false;
let dropSpeed = 400;
let upperLeftCorner = { row: 0, col: 0 };
let gridSize = 0;
let fallingPieceGrid = new Array(4).fill("").map(() => new Array(4).fill(""));
let isMonochrome = false;

let blockType = ["I", "J", "L", "O", "S", "T", "Z"];
let blockColorHex = {
  I: "#00f0f0",
  J: "#0000f0",
  L: "#f0a000",
  O: "#f0f000",
  S: "#00f000",
  T: "#a000f0",
  Z: "#d80000",
};

function setGame() {
  isGameOver = false;
  document.getElementById("lines").innerHTML = 0;
  nextPiece = "I";
  gridSize = 4;
  for (let i = 0; i < 21; ++i) {
    for (let j = 0; j < 10; ++j) {
      grid[i][j] = "";
    }
  }
  updateDisplay(ctx, 0);
  fallingPiece = [];
  changeNextPieceDisplay(nextPiece, blockColorHex[nextPiece]);
  updateDisplay(ctx, dropSpeed);
  mainLoop(ctx);
}

function setMonochrome() {
  isMonochrome = true;
  updateDisplay(ctx, 0);
  changeNextPieceDisplay(nextPiece, "grey");
}

function unsetMonochrome() {
  isMonochrome = false;
  updateDisplay(ctx, 0);
  changeNextPieceDisplay(nextPiece, blockColorHex[nextPiece]);
}

// Setup get two canvases and set next piece when first load
window.addEventListener("load", function () {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  nextPieceCanvas = document.getElementById("nextPiece");
  nextPieceCtx = nextPieceCanvas.getContext("2d");

  setGame();
});

function incrementLinesClear() {
  ++document.getElementById("lines").innerHTML;
}

async function mainLoop(ctx) {
  while (!isGameOver) {
    if (fallingPiece === undefined || fallingPiece.length === 0) {
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
        changeFallingPiece(nextPiece);

        nextPiece = blockType[Math.floor(Math.random() * blockType.length)];
        changeNextPieceDisplay(nextPiece, blockColorHex[nextPiece]);
      }
    }

    let tempFallingPiece = [];
    if (canFall(fallingPiece)) {
      for ({ row, col } of fallingPiece) {
        if (row < 20) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col });
        }
      }

      fallingPiece = fallingPiece.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      ++upperLeftCorner.row;
    }
    fallingPiece = tempFallingPiece;

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
          isMonochrome
            ? changeGrid(i - 1, j, "grey", ctx)
            : changeGrid(i - 1, j, grid[i][j], ctx);
        }
      }
    }
  });
}

// Returns a boolean if the current piece can fall without conflicting with blocks beneath
function canFall(fallingPiece) {
  if (fallingPiece.length === 0) return false;

  for ({ row, col } of fallingPiece) {
    if (row == undefined || col == undefined || row >= 20) {
      return false;
    }

    for ({ row, col } of fallingPiece) {
      if (fallingPiece.some((e) => e.row === row + 1 && e.col === col)) {
        continue;
      }
      if (row >= 20 || grid[row + 1][col] != "") return false;
    }
  }

  return true;
}

document.addEventListener("keydown", async function (event) {
  if (event.key === "ArrowDown") {
    dropSpeed = 100;
  } else if (event.key === "ArrowLeft") {
    let canMoveLeft = (fallingPiece) => {
      if (fallingPiece.length === 0) return false;

      for ({ row, col } of fallingPiece) {
        if (fallingPiece.some((e) => e.row === row && e.col === col - 1)) {
          continue;
        }
        if (col <= 0 || grid[row][col - 1] != "") return false;
      }

      return true;
    };

    let tempFallingPiece = [];
    if (canMoveLeft(fallingPiece)) {
      for ({ row, col } of fallingPiece) {
        grid[row][col - 1] = grid[row][col];
        tempFallingPiece.push({ row: row, col: col - 1 });
      }

      fallingPiece = fallingPiece.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
      --upperLeftCorner.col;
    }
  } else if (event.key === "ArrowRight") {
    let canMoveRight = (fallingPiece) => {
      if (fallingPiece.length === 0) return false;

      for ({ row, col } of fallingPiece) {
        if (fallingPiece.some((e) => e.row === row && e.col === col + 1)) {
          continue;
        }
        if (col >= 9 || grid[row][col + 1] != "") return false;
      }

      return true;
    };

    let tempFallingPiece = [];
    if (canMoveRight(fallingPiece)) {
      for ({ row, col } of fallingPiece) {
        grid[row][col + 1] = grid[row][col];
        tempFallingPiece.push({ row: row, col: col + 1 });
      }
      fallingPiece = fallingPiece.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
      ++upperLeftCorner.col;
    }
  } else if (event.key === "ArrowUp") {

    // if falling piece is O block then there is not a need to rotate
    if (gridSize === 2) return;

    let rotateGrid = new Array(4).fill("").map(() => new Array(4).fill(""));

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        if (upperLeftCorner.row + i >= 21 || upperLeftCorner.col + j >= 10) {
          continue;
        }

        if (
          !fallingPiece.some(
            (e) => e.row === upperLeftCorner.row + i && e.col === upperLeftCorner.col + j
          )
        ) {
          continue;
        }

        rotateGrid[i][j] = grid[upperLeftCorner.row + i][upperLeftCorner.col + j];
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
      for ({ row, col } of fallingPiece) {
        temp = grid[row][col];
        grid[row][col] = "";
      }

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          if (rotateGrid[i][j] != "") {
            if (
              upperLeftCorner.row + i >= 21 ||
              upperLeftCorner.col + j >= 10 ||
              grid[upperLeftCorner.row + i][upperLeftCorner.col + j] != ""
            ) {
              for ({ row, col } of fallingPiece) {
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
      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = [];

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          if (rotateGrid[i][j] != "") {
            grid[upperLeftCorner.row + i][upperLeftCorner.col + j] = temp;
            fallingPiece.push({ row: upperLeftCorner.row + i, col: upperLeftCorner.col + j });
          }
        }
      }
    }
  }
  updateDisplay(ctx, 100);
});

document.addEventListener("keyup", async function (event) {
  if (event.key === "ArrowDown") {
    dropSpeed = 400;
  } else if (event.key === " ") {
    while (canFall(fallingPiece)) {
      let tempFallingPiece = [];
      for ({ row, col } of fallingPiece) {
        if (row < 20) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col });
        }
      }

      fallingPiece = fallingPiece.filter(
        (e1) =>
          !tempFallingPiece.some((e2) => e1.row === e2.row && e1.col === e2.col)
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }
    fallingPiece = [];
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

// Keeps track of the falling pieces by pusing to a variable
function changeFallingPiece(blockType) {
  switch (blockType) {
    case "I":
      gridSize = 4;
      upperLeftCorner.row = -1;
      upperLeftCorner.col = 3;
      break;
    case "J":
    case "L":
    case "S":
    case "T":
    case "Z":
      gridSize = 3;
      upperLeftCorner.row = 0;
      upperLeftCorner.col = 3;
      break;
    case "O":
      gridSize = 2;
      upperLeftCorner.row = -1;
      upperLeftCorner.col = 3;
      break;
  }

  if (blockType == "I") {
    for (let i = 3; i <= 6; ++i) {
      grid[0][i] = blockColorHex["I"];
      fallingPiece.push({ row: 0, col: i });
    }
  } else if (blockType == "J") {
    grid[0][3] = blockColorHex["J"];
    fallingPiece.push({ row: 0, col: 3 });
    for (let i = 3; i <= 5; ++i) {
      grid[1][i] = blockColorHex["J"];
      fallingPiece.push({ row: 1, col: i });
    }
  } else if (blockType == "L") {
    grid[0][5] = blockColorHex["L"];
    fallingPiece.push({ row: 0, col: 5 });
    for (let i = 3; i <= 5; ++i) {
      grid[1][i] = blockColorHex["L"];
      fallingPiece.push({ row: 1, col: i });
    }
  } else if (blockType == "O") {
    for (let i = 4; i <= 5; ++i) {
      grid[0][i] = blockColorHex["O"];
      grid[1][i] = blockColorHex["O"];
      fallingPiece.push({ row: 0, col: i });
      fallingPiece.push({ row: 1, col: i });
    }
  } else if (blockType == "S") {
    for (let i = 4; i <= 5; ++i) {
      grid[0][i] = blockColorHex["S"];
      grid[1][i - 1] = blockColorHex["S"];
      fallingPiece.push({ row: 0, col: i });
      fallingPiece.push({ row: 1, col: i - 1 });
    }
  } else if (blockType == "T") {
    grid[0][4] = blockColorHex["T"];
    fallingPiece.push({ row: 0, col: 4 });
    for (let i = 3; i <= 5; ++i) {
      grid[1][i] = blockColorHex["T"];
      fallingPiece.push({ row: 1, col: i });
    }
  } else if (blockType == "Z") {
    for (let i = 4; i <= 5; ++i) {
      grid[0][i - 1] = blockColorHex["Z"];
      grid[1][i] = blockColorHex["Z"];
      fallingPiece.push({ row: 0, col: i - 1 });
      fallingPiece.push({ row: 1, col: i });
    }
  }
}
