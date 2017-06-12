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

function findPath(startX, startY, endX, endY, opposedDir) {
	var initial = new node(null, startY, startX, 0, 0.0, 0.0);
	var ending = new node(null, endY, endX, 0, 0.0, 0.0);

	var results = AStar(initial, ending, opposedDir);

	for (var i = 1; i < results.length; i++) {
		var childX = results[i].x;
		var childY = results[i].y;
		var parX = results[i].parent.x;
		var parY = results[i].parent.y;

		if (childX < parX) {
			results[i].direction = "up";
		} else if (childX > parX) {
			results[i].direction = "down";
		} else if (childY > parY) {
			results[i].direction = "right";
		} else if (childY < parY) {
			results[i].direction = "left";
		}
	}

	return results;
}

function AStar(start, goal, opposedDir) {
	var evaluatedSet = [];
	var openSet = [start];
	var dir = ["up", "right", "down", "left"];
	var start = true;

	while (openSet.length) {
		var minIndex = extractMin(openSet);
		var q = openSet.splice(minIndex, 1)[0];

		var comp = nodeCompare(q, goal);

		if (comp) {
			return reconstructPath(q);
		}

		var freeSpots = findOpenNeigh(q);

		// if (start) { // for the first time, remove the opposed direction so it can't double back
		// 	var opposed = dir.indexOf(opposedDir)
		// 	freeSpots[opposed] = 0;
		// 	start = false;
		// }

		for (var i = 0; i < freeSpots.length; i++) {
			if (freeSpots[i]) { //only if the direction is available
				var parDist = q.g + 1;
				var goalDist = manhattanDistance(q, goal);
				var fScore = parDist + goalDist;
				var newX =  q.x + ghostDirection[dir[i]].x;
				var newY =  q.y + ghostDirection[dir[i]].y;

				var newNode = new node(q, newX, newY, fScore, parDist, goalDist);
				var sup = nodeIsInSet(newNode, openSet);
				var supper = nodeIsInSet(newNode, evaluatedSet);
				if (!nodeIsInSet(newNode, openSet) && !nodeIsInSet(newNode, evaluatedSet)) {
					openSet.push(newNode);
				}
			}
		}
		evaluatedSet.push(q);
	}
}

function manhattanDistance(n1, n2){
	var dist = Math.abs(n1.x - n2.x) + Math.abs(n1.y - n2.y);
	return dist;
}

function extractMin(set) {
	var comp = Number.MAX_SAFE_INTEGER;
	var minIndex = 0;

	for (var i = 0; i < set.length; i++) {
		if (set[i].f < comp) {
			comp = set[i].f;
			minIndex = i;
		}
	}

	return minIndex;
}

function nodeCompare(n1, n2) {
	var test = n1.x;
	var test1 = n1.y;
	var test2 = n2.x;
	var test3 = n2.y;
	if (n1.x == n2.x && n1.y == n2.y) {
		return true;
	} else {
		return false;
	}
}

function findOpenNeigh(n1) {
	var dir = ["up", "right", "down", "left"];
	var testY = 0;
	var testX = 0;
	var testItem = 0;
	var openSpots = [0, 0, 0, 0];
	for (var i = 0; i < 4; i++) {
		testY = n1.y + ghostDirection[dir[i]].y;
		testX = n1.x + ghostDirection[dir[i]].x;
		testItem = maze[testX][testY];
		if (testItem >= 89) {
			openSpots[i] = 1;
		}
	}
	return openSpots;
}

function nodeIsInSet(n1, set) {
	for (var i = 0; i < set.length; i++) {
		if (nodeCompare(n1, set[i])) {
			if (n1.f >= set[i].f){
				return true;
			}
		}
	}
	return false;
}

function reconstructPath(n1){
	var totalPath = [n1];
	var n2 = n1;
	while (n1.parent != null) {
		totalPath.unshift(n1.parent);
		n2 = n1;
		n1 = n1.parent;
		n1.child = n2;
	}
	return totalPath;
}