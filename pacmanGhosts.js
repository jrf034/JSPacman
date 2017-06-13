/*
This file handles all of the ghosts movements, animations, actions, and displays
*/
function node(parent, x, y, f, g, h) {
	this.parent = parent;
	this.x = x;
	this.y = y;
	this.f = f;
	this.g = g;
	this.h = h;
	this.child = null;
	this.direction;
}

var ghostImages = new Image();
ghostImages.src = "ghostSpritesheet.png";

var ghostDim = 22;
var cellDim = 24;

var blue = {
	down: [[5,5], [37,5]],
	up: [[5,133], [37,133]],
	left: [[69,37], [101,37]],
	right: [[133,69], [165,69]],
};

var red = {
	down: [[5,37], [37,37]],
	up: [[5,165], [37,165]],
	left: [[69,69], [101,69]],
	right: [[133,101], [165,101]],
};

var pink = {
	down: [[133,5], [165, 5]],
	up: [[133,133], [165,133]],
	left: [[5,69], [37,69]],
	right: [[69,101], [101, 101]],
};

var orange = {
	down: [[69,5], [101,5]],
	up: [[69,133], [101,133]],
	left: [[133,37], [165,37]],
	right: [[5,101], [37,101]],
};

var running = {
	regular: [[69,165], [101,165]],
	flashing: [[133,165], [165,165]]
};

var ghostDirection = {
	up: {x: 0, y: -1, name: "up", opposed: "down", id: 0},
	down: {x: 0, y: 1, name: "down", opposed: "up", id: 2},
	left: {x: -1, y: 0, name: "left", opposed: "right", id: 3},
	right: {x: 1, y: 0, name: "right", opposed: "left", id: 1}
};

function Ghost(X, Y, edible, color, frame, dir){
	this.posX = X;
	this.posY = Y;
	this.finePOSX = X;
	this.finePOSY = Y;
	this.isEdible = edible;
	this.ghostColor = color;
	this.ImgFrame = frame;
	this.direction = dir;
	this.choose = "up";
	this.pathArray;
	this.orangeLoop = false;
	this.orangePart = 0;


	//draws the ghost in their current position
	this.drawGhosts = function(ctx) {
		var frame = this.ImgFrame;
		var dir = this.direction;
		if (this.isEdible == true)  {
			this.GhostDrawer(running["regular"][frame][0], running["regular"][frame][1], ctx);
		} else if(this.ghostColor == "blue"){
			this.GhostDrawer(blue[dir][frame][0], blue[dir][frame][1], ctx);
		} else if (this.ghostColor == "red") {
			this.GhostDrawer(red[dir][frame][0], red[dir][frame][1], ctx);
		} else if (this.ghostColor == "pink") {
			this.GhostDrawer(pink[dir][frame][0], pink[dir][frame][1], ctx);
		} else if (this.ghostColor == "orange") {
			this.GhostDrawer(orange[dir][frame][0], orange[dir][frame][1], ctx);
		}
		this.findFree();
	};

	//helper function for drawGhosts, reduce size of function
	this.GhostDrawer = function(offX, offY, ctx) {
		var X = this.finePOSX;
		var Y = this.finePOSY;
		ctx.drawImage(ghostImages, offX, offY, ghostDim, ghostDim, X*cellDim+1, Y*cellDim+1, ghostDim, ghostDim);
	};

	this.updateInformation = function(){
		this.ImgFrame += 1;
		this.ImgFrame = this.ImgFrame % 2;
	};

		//moves the ghosts to their next position
	this.moveGhosts = function(PacX, PacY, player) {
		var freeSpots = this.findFree(); //find all free spots
		var total = 0;
		var dir = ["up", "right", "down", "left"];
		for (var i in freeSpots) {
			total += freeSpots[i];
		}
		var oppositeDir = ghostDirection[this.direction].opposed;

		var nextSpot =  new node(null, 0, 0, 0, 0.0, 0.0);
		nextSpot.direction = oppositeDir;

		var newTarget = colorAI(PacX, PacY, player, this);
		PacY = newTarget[1];
		PacX = newTarget[0];

		if (PacY == this.posY && PacX == this.posX) {
	 		var locationFree = false;
	 		while (!locationFree) {
				PacX = (PacX % 18) + 1;
				PacY = (PacY % 20) + 1;
				if (maze[PacY][PacX] >= 89) {
					locationFree = true;
				} else { //the location is a wall, keep moving diagonally until a free spot is found
					locationFree = false;
				}
			}	
		} 

		if (total <= 0) { //turn around
			this.direction = oppositeDir;
			this.posY += ghostDirection[this.direction].y;
			this.posX += ghostDirection[this.direction].x;
		} else if (total > 0) {
			this.findPacman(PacX, PacY);
			this.pathArray.shift(); //first element is useless
			var nextSpot = this.pathArray.shift();
		} 

		//temp fix to stop them turning around
		if (nextSpot.direction == oppositeDir) {
			var selection = 0;
			var rand = 0;
			var newDir;
			while (selection == 0) { //randomly select an open direction
				rand = Math.floor(Math.random() * 4);
				selection = freeSpots[rand];
			}
			newDir = dir[rand];
			this.direction = newDir;
			this.posY += ghostDirection[this.direction].y;
			this.posX += ghostDirection[this.direction].x;
		} else {
			this.direction = nextSpot.direction;
			this.posY = nextSpot.x;
			this.posX = nextSpot.y;
		}
	};

	//finds all free spots around the ghost
	//removes its opposed direction from the list
	this.findFree = function() {
		var dir = ["up", "right", "down", "left"];
		var testY = 0;
		var testX = 0;
		var testItem = 0;
		var openSpots = [0, 0, 0, 0];
		for (var i = 0; i < 4; i++) {
			testY = this.posY + ghostDirection[dir[i]].y;
			testX = this.posX + ghostDirection[dir[i]].x;
			testItem = maze[testY][testX];
			if (testItem >= 89) {
				openSpots[i] = 1;
			}
		}
		var oppositeDir = ghostDirection[this.direction].opposed;
		testItem = ghostDirection[oppositeDir].id;
		if (openSpots[testItem] > 0) {
			openSpots[testItem] -= 1;
		}
		return openSpots;
	};

	this.updateFinePos = function(PacX, PacY, speed){
		if (this.posX > this.finePOSX) {
			this.finePOSX += 1 / speed;
		} else if (this.posY > this.finePOSY){
			this.finePOSY += 1 / speed;
		} else if (this.posX < this.finePOSX) {
			this.finePOSX -= 1 / speed;
		} else if (this.posY < this.finePOSY){
			this.finePOSY -= 1 / speed;
		} else {
			this.finePOSX += 0;
			this.finePOSY += 0;
		}

		//correct JS float point errors, and addition problems when 1 is divislbe by current speed.
		if (this.finePOSX % 1 > 0.9 || this.finePOSX % 1 <= 0.1) {
			this.finePOSX = Math.round(this.finePOSX);
		} else {
			this.finePOSX = Math.round(this.finePOSX * 100) / 100;
		}

		if (this.finePOSY % 1> 0.9 || this.finePOSY % 1 <= 0.1) {
			this.finePOSY = Math.round(this.finePOSY);
		} else {
			this.finePOSY = Math.round(this.finePOSY * 100) / 100;
		}

		var test3 = this.finePOSX;
		var test4 = this.finePOSY;

		console.log(this.ghostColor + " Ghost X: " + this.finePOSX);
		console.log(this.ghostColor + "Ghost Y: " + this.finePOSY);
		console.log("Pacman X: " + PacX);
		console.log("Pacman Y: " + PacY);

		if (Math.floor(PacX) == Math.floor(this.finePOSX) && Math.floor(PacY) == Math.floor(this.finePOSY) && !this.isEdible) {
			return true;
		} else {
			return false;
		}
	};

	this.checkPacmanCollision = function(PacX, PacY) {
		if (this.posX == PacX && this.posY == PacY) {
			return true;
		} else {
			return false;
		}
	}

	this.findPacman = function(PacX, PacY) {
		this.pathArray = findPath(this.posX, this.posY, PacX, PacY, ghostDirection[this.direction].opposed);
	}
	//makes the ghosts edible
	this.becomeEdible = function() {
		//** TODO **//
	};
}