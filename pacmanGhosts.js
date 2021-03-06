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
var eyesImages = new Image();
ghostImages.src = "ghostSpritesheet.png";
eyesImages.src = "EyesSpritesheet.png";

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

var eyes = {
	down: [5,5],
	up: [29,22],
	left: [5,22],
	right: [29,5],	
}

var ghostDirection = {
	up: {x: 0, y: -1, name: "up", opposed: "down", id: 0},
	down: {x: 0, y: 1, name: "down", opposed: "up", id: 2},
	left: {x: -1, y: 0, name: "left", opposed: "right", id: 3},
	right: {x: 1, y: 0, name: "right", opposed: "left", id: 1},
	still: {x: 0, y: 0, name: "still", opposed: "still", id: 4},
};

function Ghost(X, Y, edible, color, frame, dir, leave){
	this.posX = X;
	this.posY = Y;
	this.finePOSX = X;
	this.finePOSY = Y;
	this.isEdible = edible;
	this.ghostColor = color;
	this.ImgFrame = frame;
	this.direction = dir;
	this.canLeave = leave;
	this.choose = "up";
	this.pathArray;
	this.orangeLoop = false;
	this.orangePart = 0;
	this.isEaten = false;

	//draws the ghost in their current position
	this.drawGhosts = function(ctx) {
		var frame = this.ImgFrame;
		var dir = this.direction;
		if(this.isEaten){
			this.eyesDrawer(eyes[dir][0], eyes[dir][1], ctx);
		} else if (this.isEdible)  {
			this.becomeEdible(ctx);
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

	//helper function for drawGhosts, reduce size of function
	this.eyesDrawer = function(offX, offY, ctx) {
		var X = this.finePOSX;
		var Y = this.finePOSY;
		ctx.drawImage(eyesImages, offX, offY, ghostDim, ghostDim / 2, X*cellDim+5, Y*cellDim+1, ghostDim, ghostDim / 2);
	};


	this.updateInformation = function(){
		this.ImgFrame += 1;
		this.ImgFrame = this.ImgFrame % 2;
	};

	this.resetPosition = function (X, Y, fX, fY, dir, leave) {
		this.posX = X;
		this.posY = Y;
		this.finePOSX = fX;
		this.finePOSY = fY;
		this.direction = dir;
		this.canLeave = leave;
		this.isEaten = false;
		this.isEdible = false;
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
		if (this.canLeave == false) {
			this.leaveTheBox(total, oppositeDir);
			return;
		} else if (this.finePOSX == 9 && this.finePOSY == 9 && this.isEaten) {
			this.isEaten = false;
		} else if (this.isEaten) {
			PacX = 9;
			PacY = 9;
		} else {
			var newTarget = colorAI(PacX, PacY, player, this);
			PacY = newTarget[1];
			PacX = newTarget[0];
		}

		var nextSpot =  new node(null, 0, 0, 0, 0.0, 0.0);
		nextSpot.direction = oppositeDir;

		var overlap = this.checkSelfOverlap(PacX, PacY);
		PacY = overlap[1];
		PacX = overlap[0];

		if (total <= 0) { //turn around
			this.setNextPos(oppositeDir, null);
			return;
		} else if (total > 0) {
			this.pathArray = findPath(this.posX, this.posY, PacX, PacY, ghostDirection[this.direction].opposed);
			this.pathArray.shift(); //first element is useless
			var nextSpot = this.pathArray.shift();
		} 

		//temp fix to stop them turning around
		if (nextSpot.direction == oppositeDir && total > 0) {
			var selection = 0;
			var rand = 0;
			var newDir;
			while (selection == 0) { //randomly select an open direction
				rand = Math.floor(Math.random() * 4);
				selection = freeSpots[rand];
			}
			newDir = dir[rand];
			this.setNextPos(newDir, null);
		} else if (total > 0) {
			this.setNextPos("still", nextSpot);
		} else {
			this.setNextPos(this.direction, null);
		}
	};

	this.checkSelfOverlap = function(PacX, PacY) {
 		var locationFree = false;
		if (PacY == this.posY && PacX == this.posX) {
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
		return [PacX, PacY];
	};

	this.leaveTheBox = function(total, oppositeDir) {
		if (total == 0 && this.finePOSX == 8) {
			this.setNextPos(oppositeDir, null);
			return;
		} else if (total == 0 && this.finePOSX == 10){
			this.setNextPos(oppositeDir, null);
			return;
		} else {
			this.setNextPos(this.direction, null);
			return;
		}
	};

	this.setNextPos = function(newDir, nextSpot) {
		if (nextSpot == null) {
			this.direction = newDir;
			this.posY += ghostDirection[this.direction].y;
			this.posX += ghostDirection[this.direction].x;		
		} else {
			this.direction = nextSpot.direction;
			this.posY = nextSpot.x;
			this.posX = nextSpot.y;
		}
	}

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

		//correct JS float point errors, and addition problems when 1 is divisible by current speed.
		if (this.finePOSX % 1 > 0.9 || this.finePOSX % 1 <= 0.1) {
			this.finePOSX = Math.round(this.finePOSX);
		} else {
			this.finePOSX = Math.round(this.finePOSX * 100) / 100;
		}

		if (this.finePOSY % 1 > 0.9 || this.finePOSY % 1 <= 0.1) {
			this.finePOSY = Math.round(this.finePOSY);
		} else {
			this.finePOSY = Math.round(this.finePOSY * 100) / 100;
		}

		if (Math.floor(PacX) == Math.floor(this.finePOSX) && Math.floor(PacY) == Math.floor(this.finePOSY) && !this.isEdible && !this.isEaten) {
			return true;
		} else if (Math.abs(this.finePOSX - PacX) < 1 && Math.abs(this.finePOSY - PacY) < 1 && this.isEdible) { //got eaten
			this.isEaten = true;
			this.isEdible = false;
		} else {
			return false;
		}
	};

	//makes the ghosts edible
	this.becomeEdible = function(ctx) {
		this.GhostDrawer(running["regular"][frame][0], running["regular"][frame][1], ctx);
	};

	this.setCanLeave = function(leave) {
		this.canLeave = leave;
	}
}