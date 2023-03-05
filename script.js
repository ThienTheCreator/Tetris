let grid = new Array(21).fill("").map(() => new Array(10).fill(""));
let canvas;
let ctx;
let nextPieceCanvas;
let nextPieceCtx;
let fallingPiece = [];
let nextPiece;
let isGameOver = false;
let move = "";
let dropSpeed = 400;

let row;
let col;

let blockType = ["I", "J", "L", "O", "S", "T", "Z"];

window.addEventListener('load', function () {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  nextPieceCanvas = document.getElementById("nextPiece");
  nextPieceCtx = nextPieceCanvas.getContext("2d");

  nextPiece = "I";
  changeNextPieceDisplay(nextPiece);
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

      for (let i = 0; i <= 20; ++i) {
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

      if (grid[0][3] != "y") {
        changeFallingPiece(nextPiece);
        
        nextPiece = blockType[Math.floor(Math.random()*blockType.length)];
        changeNextPieceDisplay(nextPiece);
      }
    }

    let tempFallingPiece = [];
    if (canFall(fallingPiece)) {

      for ({ row, col } of fallingPiece) {
        if (row < 20) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col })
        }
      }

      fallingPiece = fallingPiece.filter(e1 => 
        !tempFallingPiece.some(e2 => 
          e1.row === e2.row && e1.col === e2.col
        )
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
    }
    fallingPiece = tempFallingPiece;

    let canPlace = (grid) => {
      for(let i = 0; i < 10; ++i){
        if(grid[0][i] != "")
          return false;
      }
      return true;
    }

    if (!canPlace(grid)) {
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
    for (let i = 1; i <= 20; ++i) {
      for (let j = 0; j <= 9; ++j) {
        if (grid[i][j] !== "") {
          changeGrid(i - 1, j, "grey", ctx);
        } else {
          changeGrid(i - 1, j, "black", ctx);
        }
      }
    }
  })
};

function canFall(fallingPiece) {
  if(fallingPiece.length === 0)
    return false;
    
  for ({ row, col } of fallingPiece) {
    if (row == undefined || col == undefined || row >= 20) {
      return false;
    }

    for ({ row, col } of fallingPiece) {
      if (fallingPiece.some(e => e.row === row + 1 && e.col === col)) {
        continue;
      }
      if (row >= 20 || grid[row + 1][col] != "")
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
      
      fallingPiece = fallingPiece.filter(e1 => 
        !tempFallingPiece.some(e2 => 
          e1.row === e2.row && e1.col === e2.col
        )
      );

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
      fallingPiece = fallingPiece.filter(e1 => 
        !tempFallingPiece.some(e2 => 
          e1.row === e2.row && e1.col === e2.col
        )
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }
  } else if (event.key === "ArrowUp") {
    let minRow = 21;
    let minCol = 10;
    for (let i = 0; i < fallingPiece.length; ++i) {
      minRow = Math.min(minRow, fallingPiece[i].row);
      minCol = Math.min(minCol, fallingPiece[i].col);
    }

    let rotateGrid = new Array(4).fill("").map(() => new Array(4).fill(""));

    for(let i = 0; i < 4; ++i){
      for(let j = 0; j < 4; ++j){
        if(minRow+i > 20 || minCol+j > 9){
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
            if(minRow + i > 20 || minCol+j > 9 || grid[minRow+i][minCol+j] != ""){
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
        if (row < 20) {
          grid[row + 1][col] = grid[row][col];
          tempFallingPiece.push({ row: row + 1, col: col })
        }
      }

      fallingPiece = fallingPiece.filter(e1 => 
        !tempFallingPiece.some(e2 => 
          e1.row === e2.row && e1.col === e2.col
        )
      );

      for ({ row, col } of fallingPiece) {
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }
    fallingPiece = [];
  }
})

function horizontalSquares(x, y, num){
  nextPieceCtx.fillStyle = "grey";
  for(let i = 0; i < num; ++i){
    nextPieceCtx.fillRect( 30 * i + x, y + 1, 28, 28);
  }
}

function changeNextPieceDisplay(blockType){
  nextPieceCtx.fillStyle = "black";
  nextPieceCtx.fillRect( 0, 0, 150, 150);
  if(blockType == "I"){
    horizontalSquares(16, 61, 4);
  }else if(blockType == "J"){
    horizontalSquares(31, 46, 1);
    horizontalSquares(31, 76, 3);
  }else if(blockType == "L"){
    horizontalSquares(91, 46, 1);
    horizontalSquares(31, 76, 3);
  }else if(blockType == "O"){
    horizontalSquares(46, 46, 2);
    horizontalSquares(46, 76, 2);
  }else if(blockType == "S"){
    horizontalSquares(61, 46, 2);
    horizontalSquares(31, 76, 2);
  }else if(blockType == "T"){
    horizontalSquares(61, 46, 1);
    horizontalSquares(31, 76, 3);
  }else if(blockType == "Z"){
    horizontalSquares(31, 46, 2);
    horizontalSquares(61, 76, 2);
  }
}

function changeFallingPiece(blockType){
  fallingPiece = [];
  if(blockType == "I"){
    for(let i = 3; i <= 6; ++i){
      grid[0][i] = "y";
      fallingPiece.push({ row: 0, col: i });
    }
  }else if(blockType == "J"){
    grid[0][3] = "y";
    fallingPiece.push({ row: 0, col: 3 });
    for(let i = 3; i <= 5; ++i){
      grid[1][i] = "y";
      fallingPiece.push({ row: 1, col: i });
    }
  }else if(blockType == "L"){
    grid[0][5] = "y";
    fallingPiece.push({ row: 0, col: 5 });
    for(let i = 3; i <= 5; ++i){
      grid[1][i] = "y";
      fallingPiece.push({ row: 1, col: i });
    }
  }else if(blockType == "O"){
    for(let i = 4; i <= 5; ++i){
      grid[0][i] = "y";
      grid[1][i] = "y";
      fallingPiece.push({ row: 0, col: i });
      fallingPiece.push({ row: 1, col: i });
    }
  }else if(blockType == "S"){
    for(let i = 4; i <= 5; ++i){
      grid[0][i] = "y";
      grid[1][i-1] = "y";
      fallingPiece.push({ row: 0, col: i });
      fallingPiece.push({ row: 1, col: i-1 });
    }
  }else if(blockType == "T"){
    grid[0][4] = "y";
    fallingPiece.push({ row: 0, col: 4 });
    for(let i = 3; i <= 5; ++i){
      grid[1][i] = "y";
      fallingPiece.push({ row: 1, col: i });
    }
  }else if(blockType == "Z"){
    for(let i = 4; i <= 5; ++i){
      grid[0][i-1] = "y";
      grid[1][i] = "y";
      fallingPiece.push({ row: 0, col: i-1 });
      fallingPiece.push({ row: 1, col: i });
    }
  }
}
