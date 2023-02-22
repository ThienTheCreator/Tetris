window.addEventListener('load', function () {
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");
  

  ctx.fillStyle = "black";
  for(let i = 0; i < 100; i++){
    ctx.fillRect( i, 0, 1, 1 );
  }
})



