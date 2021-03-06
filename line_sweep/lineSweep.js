﻿window.onload = function(){
	var ls = new lineSweep();
	ls.displayLineSweep();
}

function lineSweep() {
	var lineSweep = this;
	var eventQueue = [];
	var sweepStatus = [];
	var edges = [];
	var intersections = [];
	var tree = new Tree();
	var root = tree.root;
	this.graph;
	this.container;

	var eventType = {
		leftPoint: 1,
		rightPoint: 2,
		intersection: 3,
	};

	function Event(edge, point, type) {
		this.type = type;
		this.edge = edge;
		this.point = point;
	}

	this.displayLineSweep = function (event) {
		lineSweep.container = new GraphContainer("Line Intersection")

		var attr = { interactionType: "edgeGraph" };
		lineSweep.graph = new Graph(attr, lineSweep.container.graphDiv);

		var buttonContainer = lineSweep.container.buttonCol;
		buttonContainer.id = "buttonContainer";

		var button = document.createElement('div');
		button.id = "computeLineSweep";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Compute Edge Intersections"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		random($(lineSweep.container.graphCol));
	}

	function transition() {

		//graph.freeze();

		$("#computeLineSweep").remove();

		var $buttonContainer = $("#buttonContainer");

		var $eventButtonContainer = $(document.createElement("div"));

		$buttonContainer.append($eventButtonContainer);

		var $prevEventButton = $("<div>", { id: "prevEventButton", class: "button-inline" });
		$prevEventButton.css("horizontal-align", "center");
		$prevEventButton.on("click", prev);
		$prevEventText = $(document.createElement("div"));
		$prevEventText.addClass("button-content");
		$prevEventText.append(document.createTextNode("Prev Event"))
		$prevEventButton.append($prevEventText);
		$eventButtonContainer.append($prevEventButton);

		var $nextEventButton = $("<div>", { id: "nextEventButton", class: "button-inline" });
		$nextEventButton.css("horizontal-align", "center");
		$nextEventButton.on("click", next);
		$nextEventText = $(document.createElement("div"));
		$nextEventText.addClass("button-content");
		$nextEventText.append(document.createTextNode("Next Event"))
		$nextEventButton.append($nextEventText);
		$eventButtonContainer.append($nextEventButton);

		computeLineSweep();
		updateButtons();


		// Description Container
		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var redpoint = new desContainer("redpoint.jpeg","current event point.",DesContainer);
		var greenpoint = new desContainer("darkergreenpoint.jpeg","newly dectected point.",DesContainer);
		var graypoint = new desContainer("graypoint.jpeg","visited point.",DesContainer);
		var blackpoint = new desContainer("blackpoint.jpeg","unvisited end point.",DesContainer);
		var purplepoint = new desContainer("purplepoint.jpeg","unvisited intersection point.",DesContainer);
		var greenedge = new desContainer("greenedge.jpeg","current event edge.",DesContainer);
		var lightgrayedge = new desContainer("lightgray.jpeg","visited edge.",DesContainer);
		var blackedge = new desContainer("blackedge.jpeg","undectected edge.",DesContainer);
		var yellowedge = new desContainer("yellowedge.jpeg","edge above the event point.",DesContainer);
		var blueedge = new desContainer("blueedge.jpeg","edge in the sweep status but not evolve in the event.",DesContainer);
        var orangeedge = new desContainer("orangeedge.jpeg","edge below the event point.",DesContainer);
        
		$buttonContainer.append($(DesContainer));
	}

	function prev() {
		if (tree.node.leftSibling == null) return;
		lineSweep.graph.loadData(tree.moveLeft().data);
		updateButtons();
	}

	function next() {
		if (tree.node.rightSibling == null) return;
		lineSweep.graph.loadData(tree.moveRight().data);
		updateButtons();
	}

	function updateButtons() {
		var $button = $("#nextEventButton");
		if (tree.node.rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", next);
		}

		$button = $("#prevEventButton");
		if (tree.node.leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", prev);
		}
	}

	function random($parentElement) {

		var $randomDiv = $(document.createElement('div'));
		var $randTextDiv = $(document.createElement('div'));
		$randTextDiv.css("display", "inline-block");
		$randTextDiv.append(document.createTextNode("Add"));
		$randomDiv.append($randTextDiv)

		var $input = $(document.createElement('input'));
		$input.attr("id", "randomInput");
		$input.css("display", "inline-block");
		$input.css("type", "number");
		$randomDiv.append($input);

		var $moreText = $(document.createElement('div'));
		$moreText.css("display", "inline-block");
		$moreText.append(document.createTextNode("Random Points: "));
		$randomDiv.append($moreText);

		var $randomButton = $(document.createElement('button'));
		$randomButton.css("display", "inline-block");
		$randomButton.append(document.createTextNode("Add Points"));
		$randomDiv.append($randomButton);
		$randomButton.on("click", addRandomPoints);
		$parentElement.append($randomDiv);
	}

	function computeLineSweep() {
		var i;

		eventQueue = [];
		edges = lineSweep.graph.cloneData().edges;

		for (i = 0; i < edges.length; ++i) {
			edges[i].p1.setAttribute({ strokeColor: 'black', fillColor: 'black' });
			edges[i].p2.setAttribute({ strokeColor: 'black', fillColor: 'black' });
			edges[i].setAttribute({ strokeColor: 'black' });
		}

		for (i = 0; i < edges.length; i++) {
			eventQueue.push(new Event(edges[i], edges[i].getLeftPoint(), eventType.leftPoint));
			eventQueue.push(new Event(edges[i], edges[i].getRightPoint(), eventType.rightPoint));
		}

		eventQueue.sort(compareEventX);

		while (eventQueue.length) {
			performEvent(eventQueue.shift());
		}
		lineSweep.graph.loadData(tree.moveDown().data);
	}

	function performEvent(event) {
		var p = event.point;
		event.point.setAttribute({ strokeColor: 'red', fillColor: 'red' });
		var edge = new Edge(event.point, new Point([event.point.x, event.point.y - 1], { visible: false }), { straightFirst: true, straightLast: true, strokeColor:'grey', dash:2 });
		edges.push(edge);
		switch (event.type) {
			case eventType.leftPoint:
				leftEvent(event);
				break;

			case eventType.rightPoint:
				rightEvent(event);
				break;

			case eventType.intersection:
				intersectEvent(event);
		}
		edges.splice(edges.indexOf(edge), 1);
		event.point.setAttribute({ strokeColor: 'gray', fillColor: 'gray' });
		if (p != event.point) debugger;
	}

	function intersectEvent(event) {
		var intersectCoords;
		var point1, point2;
		var p = event.point;
		var index = sweepStatus.findIndex(x => event.edge == x);
		//var index = Toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX(event.point.coords[0]));
		if (event.edge != sweepStatus[index]) {
			index = index - 2;
			debugger;
		}
		var temp = sweepStatus[index];
		sweepStatus[index] = sweepStatus[index + 1]
		sweepStatus[index + 1] = temp;
		if (index == sweepStatus.length - 1) debugger;

		var bot = sweepStatus[index - 1];
		var lo = sweepStatus[index];
		var hi = sweepStatus[index + 1];
		var top = sweepStatus[index + 2];

		lo.setAttribute({ strokeColor: 'green' });
		if (bot) {
			bot.setAttribute({ strokeColor: 'orange' });
			if (intersectCoords = Edge.edgeIntersection(lo, bot)) {
				if (intersectCoords[0] > event.point.coords[0]) {
					var point = new Point(intersectCoords, { strokeColor: 'green', fillColor: 'green' });
					var newEvent = new Event(bot, point, eventType.intersection);
					if (!eventQueueContains(newEvent)) {
						point1 = point;
						insertEvent(new Event(bot, point1, eventType.intersection));
						intersections.push(point1);
					}
				}
			}
		}
		hi.setAttribute({ strokeColor: 'green' });
		if (top) {
			top.setAttribute({ strokeColor: 'yellow' });
			if (intersectCoords = Edge.edgeIntersection(hi, top)) {
				if (intersectCoords[0] > event.point.coords[0]) {
					var point = new Point(intersectCoords, { strokeColor: 'green', fillColor: 'green' });
					var newEvent = new Event(hi, point, eventType.intersection);
					if (!eventQueueContains(newEvent)) {
						point2 = point;
						insertEvent(new Event(hi, point2, eventType.intersection));
						intersections.push(point2);
					}
				}
			}
		}

		var node = new TreeNode();
		node.data = cloneData();
		root.adopt(node);

		lo.setAttribute({ strokeColor: 'blue' });
		hi.setAttribute({ strokeColor: 'blue' });
		if (bot)
			bot.setAttribute({ strokeColor: 'blue' });
		if (top)
			top.setAttribute({ strokeColor: 'blue' });
		if (point1)
			point1.setAttribute({ strokeColor: 'purple', fillColor: 'purple' });
		if (point2)
			point2.setAttribute({ strokeColor: 'purple', fillColor: 'purple' });
		if (event.point != p) debugger;
	}

	function rightEvent(event) {
		var index = Toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX(event.point.coords[0]));
		var intersectCoords;
		var above = sweepStatus[index + 1]
		var below = sweepStatus[index -1]

		if(above) above.setAttribute({strokeColor: 'yellow' });
		if(below) below.setAttribute({strokeColor: 'orange' });
		if(above && below){
			if (intersectCoords = Edge.edgeIntersection(below, above)) {
				if(intersectCoords[0]>event.point.coords[0]){
					point1 = new Point(intersectCoords, { fillColor: 'Green', strokeColor: 'Green' }, 1);
					insertEvent(new Event(below, point1, eventType.intersection));
					intersections.push(point1);
				}

			}
		}

		sweepStatus.splice(index, 1);
		event.edge.setAttribute({ strokeColor: 'green' });
		var node = new TreeNode();
		node.data = cloneData();
		root.adopt(node);

		if(above) above.setAttribute({strokeColor: 'blue' });
		if(below) below.setAttribute({strokeColor: 'blue' });
		event.edge.setAttribute({ strokeColor: 'gray' });
	}

	function leftEvent(event) {
		var intersectCoords;
		var point1;
		var point2;
		var index = Toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX(event.edge.getLeftPoint().coords[0]));
		sweepStatus.splice(index, 0, event.edge);
		var above = sweepStatus[index + 1]
		var below = sweepStatus[index -1]
		if (below) {
			below.setAttribute({ strokeColor: 'orange' });
			if (intersectCoords = Edge.edgeIntersection(below, event.edge)) {
				point1 = new Point(intersectCoords, { fillColor: 'green', strokeColor: 'green' }, 1);
				insertEvent(new Event(below, point1, eventType.intersection));
				intersections.push(point1);
			}
		}

		if (above) {
			above.setAttribute({ strokeColor: 'yellow' });
			if (intersectCoords = Edge.edgeIntersection(above, event.edge)) {
				point2 = new Point(intersectCoords, { fillColor: 'green', strokeColor: 'green' }, 1);
				insertEvent(new Event(event.edge, point2, eventType.intersection));
				intersections.push(point2);
			}
		}

		event.edge.setAttribute({ strokeColor: 'green' });
		/*if (below)
			below.setAttribute({ strokeColor: 'yellow' });
		if (below)
			below.setAttribute({ strokeColor: 'yellow' });*/
			
		var node = new TreeNode();
		node.data = cloneData();
		root.adopt(node);

		if (point1)
			point1.setAttribute({ fillColor: 'purple', strokeColor: 'purple' });
		if (point2)
			point2.setAttribute({ fillColor: 'purple', strokeColor: 'purple' });
		if (above)
			above.setAttribute({ strokeColor: 'blue' });
		if (below)
			below.setAttribute({ strokeColor: 'blue' });

		event.edge.setAttribute({ strokeColor: 'blue' });
	}

	function insertEvent(event) {
		var index = Toolbox.binarySearch(event, eventQueue, 0, eventQueue.length, compareEventX);
		eventQueue.splice(index, 0, event);
	}

	function eventQueueContains(event) {
		var index = Toolbox.binarySearch(event, eventQueue, 0, eventQueue.length, compareEventX);
		if (eventQueue[index] && eventQueue[index].point.isNear(event.point)) return true;
		if (eventQueue[index - 1] && eventQueue[index - 1].point.isNear(event.point)) return true;
		return false;
	}

	function compareEventX(event1, event2) {
		return Point.compareX(event1.point, event2.point);
	}

	function cloneData() {
		var data = {edges: [], points: []};
		var i;
		for (i = 0; i < intersections.length; ++i) {
			data.points.push(intersections[i].clone());
		}

		for (i = 0; i < edges.length; ++i) {
			var p1, p2;
			p1 = edges[i].p1.clone();
			p2 = edges[i].p2.clone();
			data.points.push(p1);
			data.points.push(p2);
			data.edges.push(edges[i].clone(p1,p2));
		}
		return data;
	}
	function addRandomPoints(event) {
		graph.addRandomPoints($("#randomInput").val());
	}
}
