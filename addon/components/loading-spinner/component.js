/*
  A port of @snorpey's loading spinner demo to an Ember component
  http://codepen.io/snorpey/pen/JoaJyq
 */
import Ember from "ember";

export default Ember.Component.extend({

  tagName: 'canvas',

  initialize: Ember.on('didInsertElement', function() {

    var canvasEl = this.get('element');


    var ctx = canvasEl.getContext( '2d' );

    var params = {
      scale: .3,
      animationSpeed: 0.015,
      rotationSpeed: 0.001,
      lineCount: 120,
      lineLength: 60,
      lineWidth: 1,
      lineInnerRadius: 100,
      lineInnerRadiusPulseDelta: 20,
      lineOuterRadiusWaveDelta: 3,
      waveWidth: 1,
      waveRotationIncreasePerStep: 0.005,
      foregroundColor: '#ffc379',
      backgroundColor: '#ffffff'
    };

    var counter = 0;
    var waveRotation = 0;
    var rotation = 0;

    var two_pi = Math.PI * 2;

    var lines = [ ];

    var ratio = window.devicePixelRatio || 1;
    var size = { width: window.innerWidth * ratio, height: window.innerHeight * ratio };
    var center = { x: size.width / 2, y: size.height / 2 };

    var i = 0;
    var line;
    var innerRadius;
    var outerRadius;
    var lineStartPoint = { x: 0, y: 0 };
    var lineEndPoint = { x: 0, y: 0 };
    var rotatedStartPoint;
    var rotatedEndPoint;

    updateCanvasSize();
    draw();

    function draw () {
      update();
      render();
      requestAnimationFrame( draw );
    }

    function update () {
      counter += params.animationSpeed;
      rotation += params.rotationSpeed;

      if ( lines.length > params.lineCount ) {
        lines.splice( params.lineCount, lines.length - params.lineCount );
      }
    }

    function render () {
      ctx.clearRect( 0, 0, size.width * ratio, size.height * ratio );
      ctx.fillStyle = params.backgroundColor;
      ctx.fillRect( 0, 0, size.width * ratio, size.height * ratio );

      for ( i = 0; i < params.lineCount; i++ ) {
        line = lines[i];

        if ( ! line ) {
          line = i * ( two_pi / params.lineCount );
        }

        waveRotation += params.waveRotationIncreasePerStep;

        innerRadius = Math.cos( counter );
        outerRadius = 0.9 + Math.cos( counter ) * 0.1 + Math.sin( waveRotation + i / params.waveWidth );

        ctx.beginPath();
        drawLine( ctx, line, innerRadius * ratio, outerRadius * ratio );
        ctx.lineWidth = params.lineWidth * ratio;
        ctx.strokeStyle = params.foregroundColor;
        ctx.stroke();
      }
    }

    function drawLine ( ctx, lineRotation, innerRadiusScale, outerRadiusScale ) {
      lineStartPoint.x = center.x + ( params.lineInnerRadius + ( params.lineInnerRadiusPulseDelta * ratio ) * innerRadiusScale + params.lineLength + ( params.lineOuterRadiusWaveDelta * ratio ) * outerRadiusScale ) * params.scale;
      lineStartPoint.y = center.y;
      lineEndPoint.x = center.x + ( params.lineInnerRadius + ( params.lineInnerRadiusPulseDelta * ratio ) * innerRadiusScale ) * params.scale;
      lineEndPoint.y = center.y;

      rotatedStartPoint = rotatePoint( lineStartPoint, center, lineRotation + rotation );
      rotatedEndPoint = rotatePoint( lineEndPoint, center, lineRotation + rotation );

      ctx.moveTo( rotatedStartPoint.x, rotatedStartPoint.y );
      ctx.lineTo( rotatedEndPoint.x, rotatedEndPoint.y );
    }

    function rotatePoint ( point, center, rotation ) {
      return {
        x: ( ( point.x - center.x ) * Math.cos( rotation ) + ( point.y - center.y ) * Math.sin( rotation ) ) + center.x,
        y: ( - ( point.x - center.x ) * Math.sin( rotation ) + ( point.y - center.y ) * Math.cos( rotation ) ) + center.y
      };
    }

    function updateCanvasSize () {
      canvasEl.setAttribute( 'width', size.width );
      canvasEl.setAttribute( 'height', size.height );
    }



  })

});
