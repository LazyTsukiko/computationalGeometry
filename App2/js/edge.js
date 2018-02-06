﻿
//creates an edge between 2 points
function Edge(p1, p2, board) {
	var edge = this;
	this.p1 = p1;
	this.p2 = p2;
	this.jxgEdge;

	this.getLeftPoint = function (){
		if (Point.compareX(edge.p1, edge.p2) > 0) return p2;
		else return p1;
	}

	this.getRightPoint = function () {
		if (Point.compareX(edge.p1, edge.p2) > 0) return p1;
		else return p2;
	}

}

Edge.prototype.evaluateLine = function(x) {
	var p = (x - this.p1.coords[0]) / (this.p2.coords[0] - this.p1.coords[0]);
	var y = p * (this.p2.coords[1]) + (1 - p) * (this.p1.coords[1]);
	return y;
}

Edge.compareYAtX = function (x) {
	if (x == null) throw exception;
	return function (e1, e2) {
		var ret = e1.evaluateLine(x) - e2.evaluateLine(x);
		return ret;
	}
}

Edge.pointAbove = function (p, e) {
	return p.coords[1] - e.evaluateLine(p.coords[0]);
}

//returns 
Edge.findIntersection = function (e1, e2) {
	var A1, B1, C1, A2, B2, C2, det, x11, x12, x21, x22, y11, y12, y21, y22, x, y;

	x11 = e1.p1.coords[0];
	x12 = e1.p2.coords[0];
	x21 = e2.p1.coords[0];
	x22 = e2.p2.coords[0];
	y11 = e1.p1.coords[1];
	y12 = e1.p2.coords[1];
	y21 = e2.p1.coords[1];
	y22 = e2.p2.coords[1];

	A1 = y12 - y11;
	B1 = x11 - x12;
	C1 = A1 * x11 + B1 * y11;

	A2 = y22 - y21;
	B2 = x21 - x22;
	C2 = A2 * x21 + B2 * y21;

	det = A1 * B2 - A2 * B1;

	if (det == 0) return null;

	x = (B2 * C1 - B1 * C2) / det;
	y = (A1 * C2 - A2 * C1) / det;

	if (Math.min(x11, x12) < x && x < Math.max(x11, x12) &&
		Math.min(x21, x22) < x && x < Math.max(x21, x22)) {
		return [x, y];
	}
	return null;

}