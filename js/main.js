// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
   return  window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function(callback){
             window.setTimeout(callback, 1000 / 60);
           };
})();

(function(){

   var canvas, context, star, x, y, projectedX, projectedY, z, opacity;
   var hfov, vfov, hViewDistance, vViewDistance;
   var canvasW = document.body.clientWidth;
   var canvasH = document.documentElement.clientHeight;
   var starsAmount = 3000;
   var stars = [];
   var starSpeed = 2;
   var isPositive = true;
   var starSize = 2;
   var maxZ = 1000;
   var lastMousePosition = {};
   var xMultiplier = 0;
   var yMultiplier = 0;
   var starSpeedIncrease = false;
   var starSpeedDecrease = false;
   var starSpeedMax = 25;
   var starSpeedMultiplier = 0;
   var starSpeedPauseCount = 0;
   var starSpeedPauseLimit = 25;

   var hangbackCount = 0;
   var hangbackLimit = 5;

   prepareCanvas();
   setup();
   calculateFieldOfView();
   draw();
   attachEvents(canvas);
   animate();

   function calculateFieldOfView(){
      hfov = 100 * Math.PI / 180;
      vfov = 80 * Math.PI / 180;
      hViewDistance = (canvasW / 2) / Math.tan(hfov / 2);
      vViewDistance = (canvasH / 2) / Math.tan(vfov / 2);
   }

   function setup(){
      for(var i=0; i<starsAmount; i++) {
        stars.push([getRandomX(),getRandomX(),getRandomZ()]);
      }
   }

   function prepareCanvas(){
      canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      context = canvas.getContext( '2d' );
      document.body.appendChild( canvas );
   }

   function animate() {
       requestAnimFrame(animate);
       draw();
   }

   function handleMouseScroll(ev){
      starSpeed = ev.wheelDelta;
      if (ev.wheelDelta <= 0) {
          isPositive = false;
      } else {
         isPositive = true;
      }
   }

   function checkPosNeg(){
      if (starSpeed <= 0) {
          isPositive = false;
      } else {
         isPositive = true;
      }
   }

   function handleMouseClick() {
      hangbackCount = 0;
      if (!starSpeedIncrease) {
         starSpeedIncrease = true;
      } else {
         starSpeedDecrease = true;
      }

      if (isPositive && starSpeedIncrease && starSpeed < starSpeedMax) {
         starSpeedMultiplier += 1;
      }

   }

   function handleMouseMove(event){
      if (typeof(lastMousePosition.x) != 'undefined') {
          var deltaX = lastMousePosition.x - event.offsetX,
              deltaY = lastMousePosition.y - event.offsetY;
          if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
             xMultiplier += deltaX;
            // console.log('Left');
          } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
             xMultiplier += deltaX;
             // console.log('Right');
          } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
             yMultiplier += deltaY;
             // console.log('Up');
          } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
             yMultiplier += deltaY;
             // console.log('Down');
          }
      }
      lastMousePosition = {
          x : event.offsetX,
          y : event.offsetY
      };
      calculateFieldOfView();
   }

   function getRandomX(){
      return Math.floor((Math.random() * canvasW) - (canvasW/2));
   }

   function getRandomY(){
      return Math.floor((canvasH / 2) - (Math.random() * canvasH));
   }

   function getRandomZ(){
      return Math.floor((Math.random() * maxZ));
   }

   function draw() {

      if (starSpeedIncrease && (hangbackCount < hangbackLimit) && starSpeed !== starSpeedMax) {
         hangbackCount++;
         starSpeed -= hangbackCount;
      } else if (starSpeedIncrease && (hangbackCount == hangbackLimit) && (starSpeedPauseCount < starSpeedPauseLimit)) {
         starSpeed = 0.5;
         starSpeedPauseCount++;
      } else if (starSpeedIncrease && starSpeedPauseCount >= starSpeedPauseLimit) {
         starSpeed = starSpeedMax;
      }

      context.fillStyle = 'rgb(000,000,000)';
      context.fillRect(0, 0, canvasW, canvasH);
      context.fill();

      for (var i = 0; i < stars.length; i++) {

         star = stars[i];
         z = star[2] - starSpeed;
         if ((z <= 0 && isPositive) || (!isPositive && z >= maxZ)) {
            star[0] = getRandomX();
            star[1] = getRandomY();
            z = getRandomZ();
         }
         star[2] = z;

         x = (star[0] * canvasW) / z;
         y = (star[1] * canvasH) / z;

         // Project to 2D space
         projectedX = (x * hViewDistance) / z;
         projectedY = (y * vViewDistance) / z;

         // Transform to screen coordinates
         projectedX += canvasW / 2;
         projectedY = (canvasH / 2) - projectedY;
         opacity = getOpacityFromZ(z);
         context.fillStyle = 'rgba(255,255,255,'+opacity+ ')';

        context.fillRect((projectedX  + xMultiplier), (projectedY  + yMultiplier), starSize, starSize);

      }

      context.fill();

   }

   function getOpacityFromZ(z) {
      return 1 - ("0." + Math.floor(z/100));
   }

   function attachEvents(canvas){

      if (canvas.addEventListener){
         canvas.addEventListener( 'mousewheel', handleMouseScroll, false );     // Chrome/Safari/Opera
         canvas.addEventListener( 'DOMMouseScroll', handleMouseScroll, false ); // Firefox
         canvas.addEventListener( 'mousemove', handleMouseMove, false );
         canvas.addEventListener( 'DOMMouseMove', handleMouseScroll, false );
         canvas.addEventListener( 'mousedown', handleMouseClick, false );
      } else if (canvas.attachEvent){
         canvas.attachEvent('onmousewheel',handleMouseScroll); // IE
         canvas.attachEvent('onmousemove', handleMouseMove);
         canvas.attachEvent('onmousedown', handleMouseClick);
      }

   }

})();