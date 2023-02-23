
let grid = new Array(10).fill("").map(() => new Array(20).fill(""));
let canvas;
let ctx;
window.addEventListener('load', function () {
  canvas = document.getElementById("mainGrid");
  ctx = canvas.getContext("2d");
  console.log(ctx);
  updateDisplay(ctx);
  mainLoop(ctx);
})

function changeGrid(row, col, color, ctx){
  ctx.fillStyle = color;

  for(let i = 0; i < 29; i++){
    ctx.fillRect( i + 30*row, 30*col, 1, 1 );           // draw top border
    ctx.fillRect( 29 + 30*row, i + 30*col, 1, 1 );      // draw right border
    ctx.fillRect( 30*row, 29 - i + 30*col, 1, 1 );        // draw bottom border
    ctx.fillRect( 29 - i + 30*row, 29 + 30*col, 1, 1 );   // draw left border
  }

  ctx.fillStyle = color;
  ctx.fillRect(30*row+1, 30*col+1, 28, 28);
}

async function updateDisplay(ctx){
  return new Promise((resolve) => {
    setTimeout(() => {
      for(let i = 0; i < 10; i++){
      for(let j = 0; j < 20; j++){
        if(grid[i][j] !== ""){
          await changeGrid(i, j, "grey", ctx);
        }else{
          await changeGrid(i, j, "black", ctx);
        }
      }
    }
    }, 1000);
  });
}

async function mainLoop(ctx){
  grid[0][0] = "y";
  for(let i = 0; i < 20; i++){
    console.log(i);
    for(let j = 19; j > 0; j--){
      if(grid[0][j-1] != ""){
        grid[0][j] = "y";
        grid[0][j-1] = "";
      }
    }
    await updateDisplay(ctx);
    console.log(i);
  }
}

