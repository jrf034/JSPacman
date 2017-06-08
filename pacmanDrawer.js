/*
This file handles all of pacmans movement, animation, actions, and display
*/

var pacmanImages = new Image();
pacmanImages.src = "pacmanSpritesheet.png";

var pacmanDim = 22;

var pacmanSprites = {
	down: [[5,5], [37,5]],
	up: [[37,69], [69,69]],
	left: [[69,5], [5,37]],
	right: [[69,37], [5,69]]
};

function Player(fineX, fineY, X, Y, frame, dir){
	this.finePOSX = fineX;
	this.finePOSY = fineY;
	this.POSX = X;
	this.POSY = Y;
	this.ImgFrame = frame;
	this.direction = dir;
	this.moving = true;

		//draws the pacman in their current position
	this.drawPlayer = function(ctx) {
		var frame = this.ImgFrame;
		var dir = this.direction;
		if (!this.moving) {
			this.pacmanDrawer(pacmanSprites[dir][1][0], pacmanSprites[dir][1][1], ctx);
		} else if (frame < 2) {
			this.pacmanDrawer(pacmanSprites[dir][frame][0], pacmanSprites[dir][frame][1], ctx);
		} else {
			this.pacmanDrawer(37, 37, ctx);			
		}
	};

	this.updateInformation = function(fineX, fineY, X, Y, frame, dir){
		this.finePOSX = fineX;
		this.finePOSY = fineY;
		this.POSX = X;
		this.POSY = Y;
		this.ImgFrame = frame;
		this.direction = dir;		
	};

	//helper function for drawpacmans, reduce size of function
	this.pacmanDrawer = function(offX, offY, ctx) {
		var X = this.finePOSX;
		var Y = this.finePOSY;
		ctx.drawImage(pacmanImages, offX, offY, pacmanDim, pacmanDim, X*cellDim+1, Y*cellDim+1, pacmanDim, pacmanDim);
	};

	this.updatePos = function(direction){
		if (direction) {
			var testPOSX = this.POSX + direction.x;
			var testPOSY = this.POSY + direction.y;
			var scoreIncr = 0;
			var testItem = maze[testPOSY][testPOSX];
			if (testItem >= 90) {
				this.POSX += direction.x;
				this.POSY += direction.y;
				if (testItem >= 98){ 
					scoreIncr += 10;
				}
				maze[testPOSY][testPOSX] = 90;
				this.moving = true;
			} else {
				this.POSX += 0;
				this.POSY += 0;
				this.moving = false;
				pacmanFrame = 0;
			}
		} else {
			throw "Invalid direction";
		}
		return [this.POSX, this.POSY, scoreIncr];
	};

	this.updateFinePos = function(){
		if (this.POSX > this.finePOSX) {
			this.finePOSX += 0.25;
		} else if (this.POSY > this.finePOSY){
			this.finePOSY += 0.25;
		} else if (this.POSX < this.finePOSX) {
			this.finePOSX -= 0.25;
		} else if (this.POSY < this.finePOSY){
			this.finePOSY -= 0.25;
		} else {
			this.finePOSX += 0;
			this.finePOSY += 0;
		}
		return [this.finePOSX, this.finePOSY];
	};
}