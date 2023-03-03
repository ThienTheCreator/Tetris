
let grid = new Array(20).fill("").map(() => new Array(10).fill(""));
let canvas;
let ctx;
let fallingPiece = [];
let isGameOver = false;
let move = "";
let dropSpeed = 400;

let row;
let col;

window.addEventListener('load', function () {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  updateDisplay(ctx);
  mainLoop(ctx);
})

async function mainLoop(ctx) {
  while (!isGameOver) {
    if (fallingPiece === undefined || fallingPiece.length === 0) {

      let isRowFull = (e) => {
        for (let i = 0; i < e.length; ++i) {
          if (e[i] == "")
            return false;
        }
        return true;
      };

      for (let i = 0; i < 20; ++i) {
        if (isRowFull(grid[i])) {
          for (let j = 0; j < 10; ++j) {
            grid[i][j] = "";
          }
          for (let j = i; j > 0; --j) {
            for (let k = 0; k < 10; ++k) {
              grid[j][k] = grid[j - 1][k];
            }
          }
        }
      }

      if (grid[0][0] != "y") {
        fallingPiece = [];
        grid[0][0] = "y";
        grid[0][1] = "y";
        grid[0][2] = "y";
        grid[0][3] = "y";
        fallingPiece.push({ row: 0, col: 0 });
        fallingPiece.push({ row: 0, col: 1 });
        fallingPiece.push({ row: 0, col: 2 });
        fallingPiece.push({ row: 0, col: 3 });
      }
    }

    let tempFallingPiece = [];
    if (canFall(fallingPiece)) {

      for ({ row, col } of fallingPiece) {
        if (row < 19) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col })
        }
      }

      fallingPiece = fallingPiece.filter(e1 => !tempFallingPiece.some(e2 => e1.row === e2.row && e1.col === e2.col));

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
    }
    fallingPiece = tempFallingPiece;

    if (grid[0][0] != "") {
      isGameOver = true;
    }

    await updateDisplay(ctx);


  }

}

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

function changeGrid(row, col, color, ctx) {
  ctx.fillStyle = color;
  ctx.fillRect(30 * col + 1, 30 * row + 1, 28, 28);
}

async function updateDisplay(ctx) {
  return delay(dropSpeed).then(e => {
    for (let i = 0; i < 20; ++i) {
      for (let j = 0; j < 10; ++j) {
        if (grid[i][j] !== "") {
          changeGrid(i, j, "grey", ctx);
        } else {
          changeGrid(i, j, "black", ctx);
        }
      }
    }
  })
};

function canFall(fallingPiece) {
  if(fallingPiece.length === 0)
    return false;
    
  for ({ row, col } of fallingPiece) {
    if (row == undefined || col == undefined || row >= 19) {
      return false;
    }

    for ({ row, col } of fallingPiece) {
      if (fallingPiece.some(e => e.row === row + 1 && e.col === col)) {
        continue;
      }
      if (row >= 19 || grid[row + 1][col] != "")
        return false;
    }
  }

  return true;
}

document.addEventListener('keydown', async function (event) {
  if (event.key === "ArrowDown") {
    dropSpeed = 150;
  } else if (event.key === "ArrowLeft") {
    let canMoveLeft = (fallingPiece) => {
      if (fallingPiece.length === 0)
        return false;

      for ({ row, col } of fallingPiece) {
        if (fallingPiece.some(e => e.row === row && e.col === col - 1)) {
          continue;
        }
        if (col <= 0 || grid[row][col - 1] != "")
          return false;
      }

      return true;
    }

    let tempFallingPiece = [];
    if (canMoveLeft(fallingPiece)) {
      for ({ row, col } of fallingPiece) {
        grid[row][col - 1] = grid[row][col];
        tempFallingPiece.push({ row: row, col: col - 1 });
      }
      fallingPiece = fallingPiece.filter(e1 => !tempFallingPiece.some(e2 => e1.row === e2.row && e1.col === e2.col));

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }

  } else if (event.key === "ArrowRight") {
    let canMoveRight = (fallingPiece) => {
      if (fallingPiece.length === 0)
        return false;

      for ({ row, col } of fallingPiece) {
        if (fallingPiece.some(e => e.row === row && e.col === col + 1)) {
          continue;
        }
        if (col >= 9 || grid[row][col + 1] != "")
          return false;
      }

      return true;
    }

    let tempFallingPiece = [];
    if (canMoveRight(fallingPiece)) {
      for ({ row, col } of fallingPiece) {
        grid[row][col + 1] = grid[row][col];
        tempFallingPiece.push({ row: row, col: col + 1 });
      }
      fallingPiece = fallingPiece.filter(e1 => !tempFallingPiece.some(e2 => e1.row === e2.row && e1.col === e2.col));

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }
  } else if (event.key === "ArrowUp") {

    let m = [
      [1, 0, 0, 0],
      [0, 0, -1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 1]
    ];

    let minRow = 20;
    let minCol = 10;
    for (let i = 0; i < fallingPiece.length; ++i) {
      minRow = Math.min(minRow, fallingPiece[i].row);
      minCol = Math.min(minCol, fallingPiece[i].col);
    }

    let rotateGrid = new Array(4).fill("").map(() => new Array(4).fill(""));

    for(let i = 0; i < 4; ++i){
      for(let j = 0; j < 4; ++j){
        if(minRow+i >= 20 || minCol+j >= 10){
          continue;
        }
        
        if (!fallingPiece.some(e => e.row === minRow+i && e.col === minCol + j)) {
          continue;
        }

        rotateGrid[i][j] = grid[minRow+i][minCol+j];
      }
    }

    let rotate = (gridToRotate) => {
      for(let i = 0; i < 2; ++i){
        for(let j = i; j < 3 - i; ++j){
          let temp = gridToRotate[i][j];
          gridToRotate[i][j] = gridToRotate[j][3-i];
          gridToRotate[j][3-i] = gridToRotate[3-i][3-j];
          gridToRotate[3-i][3-j] = gridToRotate[3-j][i];
          gridToRotate[3-j][i] = temp; 
        }
      }
    }

    rotate(rotateGrid)

    let hasSpace = (grid, rotateGrid) => {
      for({row, col} of fallingPiece){
        grid[row][col] = "";
      }

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          if(rotateGrid[i][j] != ""){
            if(minRow + i >= 20 || minCol+j >= 10 || grid[minRow+i][minCol+j] != ""){
              for({row, col} of fallingPiece){
                grid[row][col] = "y";
              }
              return false;
            }
          }
        }
      }
      return true;
    }

    if(hasSpace(grid, rotateGrid)){
      let temp = grid[fallingPiece[0].row][fallingPiece[0].col];
      for({row, col} of fallingPiece){
        grid[row][col] = "";
      }
      fallingPiece = [];

      for(let i = 0; i < 4; ++i){
        for(let j = 0; j < 4; ++j){
          if(rotateGrid[i][j] != ""){
            grid[minRow+i][minCol+j] = "y";
            fallingPiece.push({row: minRow + i, col: minCol + j});
          }
        }
      }
    }
  }
});

document.addEventListener('keyup', async function (event){
  if(event.key === "ArrowDown"){
    dropSpeed = 400;
  }else if(event.key === " "){
    while(canFall(fallingPiece)) {
      let tempFallingPiece = [];
      for ({ row, col } of fallingPiece) {
        if (row < 19) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col })
        }
      }

      fallingPiece = fallingPiece.filter(e1 => !tempFallingPiece.some(e2 => e1.row === e2.row && e1.col === e2.col));

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }
    fallingPiece = [];
  }
})

function changeNextPiece(blockType){
  let block = ["I", "J", "L", "O", "S", "T", "Z"];
  let nextPieceCanvas = document.getElementById("mainGrid");
  let nextPieceCtx = canvas.getContext("2d");

  if(blockType = "I"){
    
  }
}