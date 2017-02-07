var myApp=angular.module("chartDirective", ["ngAnimate"]);
myApp.directive('canvasGraph',function(){
		  return {
		    scope: {
		      passedscore: '@currentValue',
		      maxscore: '@maxValue',
		      passedsize: '@gSize',
		      passedsizexy: '@xySize',
		      passedFontSize: '@fontSize',
		      passedInnerColor: '@innerColor',
		      passedOuterColor: '@outerColor',
		      passedBlockColor: '@blockColor',
		      index: '@idIndex',
		      
		    },
		    restrict: 'AE',
		    replace: true,
		    transclude: true,
		    template: '<canvas id="{{index}}" width="{{passedsizexy}}" height="{{passedsizexy}}">{{passedscore}}</canvas>',
		    link : function(scope, element, attrs){
		    	//function(element,bikScore,graphSize,canvasSizex,canvasSizey){
		    	
		    		
		           scope.canvas = element[0];
		           scope.context = scope.canvas.getContext('2d');
		           scope.$watch(function(scope) { return scope.passedscore+scope.maxscore }, function() {  
		           
		    	  var xstart=scope.passedsizexy/2;
	              var ystart=scope.passedsizexy/2;
	              
	              var radiusOne=scope.passedsize-1;
	              var radiusTwo=radiusOne*0.8;
	              var radiusThree=radiusOne*0.7;
	              
	              var startAngle=1*Math.PI;
	              var endAngle=3*Math.PI;
	              
	              var score=Math.round((scope.passedscore/scope.maxscore)*100);
	              
	              
	              if(score==0){
	            	  var scoreGraph=2;
	              }else{
	            	  if(score==100){
	            		  var scoreGraph=0;
	            	  }else{
	              var scoreGraph=score/50;
	            	  }
	              }
	                
	              	
	              
	              var rectwidth= radiusTwo*0.1
	              var rectheight= radiusOne*0.12
	              scope.context.setTransform(1, 0, 0, 1, 0, 0);
	              scope.context.clearRect(0, 0, scope.canvas.width, scope.canvas.height);


	              
	              // circle one
	              scope.context.beginPath();
	              scope.context.arc(xstart,ystart,radiusOne,startAngle,endAngle);
	              scope.context.strokeStyle = scope.passedInnerColor;
	              scope.context.stroke();
	              scope.context.fillStyle = scope.passedInnerColor;
	              scope.context.fill();
	              
	              //circle two
	              scope.context.beginPath();
	              scope.context.arc(xstart,ystart,radiusTwo,startAngle,endAngle);
	              scope.context.strokeStyle = scope.passedOuterColor;
	              scope.context.stroke();
	              scope.context.fillStyle = scope.passedOuterColor;
	              scope.context.fill();
	              //circle three
	              scope.context.beginPath();
	              scope.context.arc(xstart,ystart,radiusThree,startAngle,endAngle);
	              scope.context.strokeStyle = "rgb(0,0,0)";
	              scope.context.stroke();
	              scope.context.fillStyle = "rgb(0,0,0)";
	              scope.context.fill();
	              
	              scope.context.translate( xstart, ystart);
	              //draw rectangles
	              for(i=0;i<36;i++)  { 

	            	  scope.context.fillStyle = scope.passedBlockColor;
	             
	            	  scope.context.fillRect(-(radiusOne+radiusTwo)/2, -radiusTwo*0.1, rectwidth, rectheight);
	            	  scope.context.rotate(10*Math.PI/180);
	              }
	              // indicator
	              //part1
	              scope.context.rotate(180*Math.PI/180);
	              scope.context.beginPath();
	              scope.context.arc(0,0,(radiusOne+radiusThree)/2,scoreGraph*Math.PI,0*Math.PI);
	              scope.context.lineWidth=(radiusOne-radiusThree);
	              scope.context.strokeStyle = "rgba(0, 0, 0, 0.3)";
	              scope.context.stroke();
	              scope.context.fillStyle = "rgba(0, 0, 0, 0.3)";
	              //scope.context.fill();
	              scope.context.lineWidth=1;
	              //part2
	              scope.context.beginPath();
	              scope.context.arc(0,0,radiusThree,startAngle,endAngle);
	              scope.context.strokeStyle = "rgba(0,0,0,0)";
	              
	             // scope.context.stroke();
	              //scope.context.fillStyle = "rgb(0,0,0)";
	              //scope.context.fill();
	              
	              //Text
	              scope.context.rotate(180*Math.PI/180);
	              scope.context.font = '12pt Pokoljaro';
	              
	              scope.context.lineWidth = 1;
	              // stroke color
	              scope.context.textAlign = "center";
	              scope.context.fillStyle = 'white';
	              scope.context.fillText(scope.passedscore, 0, 6);
	              		//scope.canvas.toBlob(function(blob) {
	            	   // saveAs(blob, scope.passedscore+"_score.png");
	            //	});
		           
		    });
		    }	
		  };

		});