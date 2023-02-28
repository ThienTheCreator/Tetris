
let grid = new Array(20).fill("").map(() => new Array(10).fill(""));
let canvas;
let ctx;
let fallingPiece = [];
let isGameOver = false;
let move = "";

let row;
let col;

window.addEventListener('load', function () {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  console.log(ctx);
  updateDisplay(ctx);
  mainLoop(ctx);
})

function changeGrid(row, col, color, ctx) {
  ctx.fillStyle = color;

  for (let i = 0; i < 29; ++i) {
    ctx.fillRect(i + 30 * col, 30 * row, 1, 1);           // draw top border
    ctx.fillRect(29 + 30 * col, i + 30 * row, 1, 1);      // draw right border
    ctx.fillRect(30 * col, 29 - i + 30 * row, 1, 1);        // draw bottom border
    ctx.fillRect(29 - i + 30 * col, 29 + 30 * row, 1, 1);   // draw left border
  }

  ctx.fillStyle = color;
  ctx.fillRect(30 * col + 1, 30 * row + 1, 28, 28);
}

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function updateDisplay(ctx) {
  return delay(100).then(e => {
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

async function mainLoop(ctx) {
  while (!isGameOver) {
    if (fallingPiece === undefined || fallingPiece.length === 0) {
      if(grid[0][0] != "y"){
        fallingPiece = [];
        grid[0][0] = "y";
        grid[0][1] = "y";
        fallingPiece.push({row: 0, col: 0});
        fallingPiece.push({row: 0, col: 1});
      }
    }

    let canFall = (fallingPiece) => {
      for ({row, col} of fallingPiece) {
        if (row == undefined || col == undefined || row >= 19 || grid[row + 1][col] != "" || grid[row][col] === "") {
          return false;
        }
      }

      return true;
    }

    let tempFallingPiece = [];
    if (canFall(fallingPiece)) {
      
    for ({row, col} of fallingPiece) {
      if (row < 19) {
        grid[row + 1][col] = grid[row][col];
        grid[row][col] = "";
        tempFallingPiece.push({row: row + 1, col: col})
      } 
    }
    
    
    }
    fallingPiece = tempFallingPiece;

    if (grid[0][0] != "") {
      isGameOver = true;
    }

    await updateDisplay(ctx);
  }

}

document.addEventListener('keydown', async function (event) {
  if (event.key === "ArrowDown") {
    console.log("ArrowDown");
  } else if (event.key === "ArrowLeft") {
    let canMoveLeft = (fallingPiece) => {
      for ({row, col} of fallingPiece) {
        if (row <= 0 || grid[row][col - 1] != "")
          return false;
      }

      return true;
    }

    let tempFallingPiece = [];
    if (canMoveLeft(fallingPiece)) {
      for({row, col} of fallingPiece){
        grid[row][col-1] = grid[row][col];
        grid[row][col] = "";
        tempFallingPiece.push({row: row, col: col - 1});
      }
      fallingPiece = tempFallingPiece;
    }
    
  } else if (event.key === "ArrowRight") {
      let canMoveRight = (fallingPiece) => {
        if(fallingPiece.length === 0)
          return false;

        for ({row, col} of fallingPiece) {
          if(fallingPiece.some(e => e.row === row && e.col === col + 1)){
            continue;
          }
          if (col >= 9 || grid[row][col + 1] != "")
            return false;
        }

        return true;
      }
    
    let tempFallingPiece = [];
    if (canMoveRight(fallingPiece)) {
      for({row, col} of fallingPiece){
        grid[row][col+1] = grid[row][col];
        tempFallingPiece.push({row: row, col: col + 1});
      }
      fallingPiece = fallingPiece.filter(e1 => !tempFallingPiece.some(e2 => e1.row === e2.row && e1.col === e2.col));
      console.log(fallingPiece)
      for({row, col} of fallingPiece){
        grid[row][col] = "";
      }
      fallingPiece = tempFallingPiece;
    }
  } else if (event.key === "ArrowUp") {
    console.log("ArrowUp");
  }
});
