
let grid = new Array(20).fill("").map(() => new Array(10).fill(""));
let canvas;
let ctx;
let fallingPiece = [];
window.addEventListener('load', function () {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  console.log(ctx);
  updateDisplay(ctx);
  mainLoop(ctx);
})

function changeGrid(row, col, color, ctx){
  ctx.fillStyle = color;

  for(let i = 0; i < 29; ++i){
    ctx.fillRect( i + 30*col, 30*row, 1, 1 );           // draw top border
    ctx.fillRect( 29 + 30*col, i + 30*row, 1, 1 );      // draw right border
    ctx.fillRect( 30*col, 29 - i + 30*row, 1, 1 );        // draw bottom border
    ctx.fillRect( 29 - i + 30*col, 29 + 30*row, 1, 1 );   // draw left border
  }

  ctx.fillStyle = color;
  ctx.fillRect(30*col+1, 30*row+1, 28, 28);
}

function delay(ms){
  return new Promise((resolve) => 
    setTimeout(resolve, ms)
  );
}

async function updateDisplay(ctx){
  return delay(500).then(e => {
    for(let i = 0; i < 20; ++i){
      for(let j = 0; j < 10; ++j){
        if(grid[i][j] !== ""){
          changeGrid(i, j, "grey", ctx);
        }else{
          changeGrid(i, j, "black", ctx);
        }
      }
    }
  })
};

async function mainLoop(ctx){
  fallingPiece = [[0,0],[0,1],[0,2],[0,3]];
  grid[0][0] = "y";
  grid[0][1] = "y";
  grid[0][2] = "y";
  grid[0][3] = "y";
  let isFalling = true;
  console.log(fallingPiece)
  while(isFalling){
    if(fallingPiece === undefined || fallingPiece.length === 0){
      break;
    }
    let tempFallingPiece = [];
    for(let [row, col] of fallingPiece){
      console.log(row)
      if(row < 19){
        grid[row+1][col] = grid[row][col];
        grid[row][col] = "";
        tempFallingPiece.push([row+1, col])
      }else{
        isFalling = false;
        break;
      }
    }
    await updateDisplay(ctx);
    fallingPiece = tempFallingPiece;
  }
}

document.addEventListener('keydown', function(event) {
  if(event.key === "ArrowDown") {
    console.log("ArrowDown");
  }else if(event.key === "ArrowLeft") {
    console.log("ArrowLeft");
  }else if(event.key === "ArrowRight"){
    for(let i = 0; i < 20; ++i){
      for(let j = 0; j < 10; ++j){

      }
    }
  }else if(event.key === "ArrowUp"){
    console.log("ArrowUp");
  }
});
