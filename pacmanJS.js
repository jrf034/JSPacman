/*
This file handles all of the control elements that feed into the viewer
Including:
	- Timing
	- Holding objects
	- Handling buttons and text displays
	- Maintaining information needed to pass into object classes
*/

var X = 0;
var Y = 1;

var VECTORS = {
	up: {x: 0, y: -1, degrees: 270, name: "up"},
	down: {x: 0, y: 1, degrees: 90, name: "down"},
	left: {x: -1, y: 0, degrees: 180, name: "left"},
	right: {x: 1, y: 0, degrees: 0, name: "right"},
	still: {x: 0, y: 0, degrees: 0, name: "still"},
};

var LEFT_ARROW = 37;
var UP_ARROW = 38;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;

var pacman = window.pacman || {};

window.onload = function(){
	pacman.game = (function()
	{
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		var STATUS = false;
		var SCORE = 0;
		var OLD_DIRECTION = VECTORS.left;
		var direction = VECTORS.left;
		var INCR = 10;
		var SIZE = 24;
		var REFRESH_RATE = 50;
		var POS = [9, 15];
		var finePOS = [9.0, 15.0];
        var scoreboard = document.getElementById("scoreboard");
        var highScoreboard = document.getElementById("highScore");
        var levelCntr = document.getElementById("Level");
        var livesCntr = document.getElementById("Lives");
		var move = 0;
		var pacmanFrame = 0;
		var newHighscore = false;
		var moving = true;
		var dots = 0;
		var level = 1;
		
		var player = new Player(finePOS[X], finePOS[Y], POS[X], POS[Y], pacmanFrame, OLD_DIRECTION["name"]);
		var blinky = new Ghost(9, 7, false, "red", 1, "up", true);
		var inky = new Ghost(8, 9, false, "blue", 1, "left", false);
		var pinky = new Ghost(9, 9, false, "pink", 1, "up", true);
		var clyde = new Ghost(10, 9, false, "orange", 1, "right", false);

		var ghostArray = [blinky, inky, pinky, clyde];

		//move the pacman in the required direction
		function movePacman(){
			var nextPosition = POS[0];
			updatePos(OLD_DIRECTION);
		}

		//Main function, loop through all required operations
		function loop() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawMaze(ctx);
			if (move % 4 == 0) {
				movePacman();
			}

			var ghostSpeed = 0;
			if (player.isEating) {
				ghostSpeed = 5;
			} else {
				ghostSpeed = 5;
			}

			if (move % ghostSpeed == 0) {
				updateGhosts();
			}

			updateFinePos();
			player.updateInformation(finePOS[X], finePOS[Y], POS[X], POS[Y], pacmanFrame, OLD_DIRECTION["name"]);
			player.drawPlayer(ctx);

			updateScore();
			for (var name in ghostArray) {
				var test = ghostArray[name].updateFinePos(finePOS[X], finePOS[Y], ghostSpeed);
				if (test && player.lives <= 1) {
					gameOver();
				} else  if (test) {
					player.lives -= 1;
					resetLevel(true);
				}
				ghostArray[name].drawGhosts(ctx);
				if (player.isEating > 396) {
					player.isEating -= 1;
					ghostArray[name].isEdible = true;
				} else if (player.isEating < 2 || ghostArray[name].isEaten) {
					ghostArray[name].isEdible = false;
				} else {
					player.isEating -= 1;
				}
			}

			move++;
			if (moving){
				pacmanFrame++;
				pacmanFrame = pacmanFrame % 3
			}
			//151 total dots
			var orange = 151 - (Math.floor(100 / level));
			var blue = 151 - (Math.floor(30 / level));

			dots = countDots();
			if (dots <= 0) {
				resetLevel(false);
			} else if (dots < orange) {
				clyde.setCanLeave(true);
			} else if (dots < blue) {
				inky.setCanLeave(true);
			}

			STATUS = setTimeout(function() { loop(); }, REFRESH_RATE);
		}

		//move to the next level
		function resetLevel(died) {
			if (died) {
				livesCntr.innerHTML = player.lives;
			} else {
				maze = JSON.parse(resetMaze);
				drawMaze(ctx);
				level++;
				levelCntr.innerHTML = level;
			}
			POS = [9, 15];
			finePOS = [9.0, 15.0];
			pacmanFrame = 0;
			direction = VECTORS.left;
			OLD_DIRECTION = VECTORS.left;
			player.updateInformation(9.0, 15.0, 9, 15, 0, "left")		
			blinky.resetPosition(9, 7, 9.0, 7.0, "up", true);
			inky.resetPosition(8, 9, 8.0, 9.0, "left", false);
			pinky.resetPosition(9, 9, 9.0, 9.0, "up", true);
			clyde.resetPosition(10, 9, 10.0, 9.0, "right", false);
			wait(1000)
		}

		//pass it off to the pacman class
		function updateFinePos(){
			var newPOS = player.updateFinePos();
			finePOS[X] = newPOS[X];
			finePOS[Y] = newPOS[Y];
		}

		function updateGhosts() {
			for (var name in ghostArray) {
				if (move % 3 == 0) {
					ghostArray[name].updateInformation();
				}
				ghostArray[name].moveGhosts(POS[X], POS[Y], player);
			}
		}

		//pass it off to the pacman class
		function updatePos(direction){
			var newPOS = player.updatePos(direction);
			POS[X] = newPOS[X];
			POS[Y] = newPOS[Y];
			SCORE += newPOS[2];
		}

		//update the scoreboard
		function updateScore() {
			scoreboard.innerHTML = SCORE;
			livesCntr.innerHTML = player.lives;
			var setHighScore = localStorage.getItem("pacmanHighscore");
			if (setHighScore == null){
				highScoreboard.innerHTML = 0;
				localStorage.setItem("pacmanHighscore", 0);			
			} else if (SCORE > setHighScore) {
				highScoreboard.innerHTML = SCORE;
				localStorage.setItem("pacmanHighscore", SCORE);	
				newHighscore = true;				
			} else {
				highScoreboard.innerHTML = setHighScore;				
			}
		}

		function continueGame(){
			if (STATUS) {
				clearTimeout(STATUS);
				STATUS = false;	
			} else {
				loop();
			}
		}

		//Public, called by HTML page to start the process
		function begin(){
			loop();
		}

		//Clear the canvas, prepare to start
		function start(){
			ctx.fillStyle = "#000000";
			ctx.fillRect(0,0,canvas.width, canvas.height);
			scoreboard.innerHTML = 0;
			updateScore();
			drawMaze(ctx);
		}

		//Reload the webpage
		function restart() {
			location.reload();
		}

		function wait(ms) {
			var d = new Date();
			var d2 = null;
			do { 
				d2 = new Date(); 
			} while(d2-d < ms);
		}

		//End the game
		function gameOver() {
			start();
			if(newHighscore){
				if(alert("You Lost!\nCongratulations! You set a new highscore: " + SCORE)) {
					start();
				}
				else {
					restart();
				}
				throw("Game Over");
			} else {
				if(alert("You Lost! \nFinal score: " + SCORE)) {
					start();
				}
				else {
					restart();
				}
				throw("Game Over");
				}				
			}

		//register a keypress and set new direction
		window.onkeydown = function (e) {
			e = e || window.event;
			var next_direction = VECTORS.up;
			switch (e.keyCode) {
				case UP_ARROW:
					next_direction = VECTORS.up;
					break;
				case DOWN_ARROW:
					next_direction = VECTORS.down;
					break;
				case LEFT_ARROW:
					next_direction = VECTORS.left;
					break;
				case RIGHT_ARROW:
					next_direction = VECTORS.right;
					break;
				default:
					next_direction = OLD_DIRECTION
					break;
			}
			var test = e.keyCode;
			OLD_DIRECTION = next_direction;
		};

		return {
			begin: begin,
			start: start,
			restart: restart,
		}
	})();
	pacman.game.start();
}