var graphAreaDiv = document.getElementById("graph_area");

var StateEnum = Object.freeze({
    "ADD_NODE": 0,
    "ADD_EDGE_A": 1,
    "ADD_EDGE_B": 2,
    "NODE_GIVE": 3,
    "NODE_TAKE": 4,
    "EDIT_NODE": 5
});
var graph = new Graph();
var state = StateEnum.ADD_NODE;
var selectedNode = undefined;

function addEdge(nodeIdA, nodeIdB) {
    var nodeA = graph.nodes[nodeIdA];
    var nodeB = graph.nodes[nodeIdB];
    if (nodeA.addEdge(nodeB)) {
        graphAreaDiv.appendChild(createEdgeElement(nodeIdA, nodeIdB));
    }
}

function handleNodeClick(nodeId) {
    var node = graph.nodes[nodeId];
    if (state == StateEnum.NODE_GIVE) {
        node.give();
    } else if (state == StateEnum.NODE_TAKE) {
        node.take();
    } else if (state == StateEnum.ADD_EDGE_A) {
        selectedNode = nodeId;
        graph.nodes[nodeId].div.classList.add("selected");
        setState(StateEnum.ADD_EDGE_B);
    } else if (state == StateEnum.ADD_EDGE_B) {
        if (selectedNode != nodeId) {
            addEdge(selectedNode, nodeId)
        }
        setState(StateEnum.ADD_EDGE_A);
    }
}

function createEdgeElement(nodeIdA, nodeIdB) {
    var nodeDiv = graph.nodes[nodeIdA].div;
    var rect = nodeDiv.getBoundingClientRect();
    var xa = parseInt(nodeDiv.style.left) + 15;
    var ya = parseInt(nodeDiv.style.top) + 15;
    nodeDiv = graph.nodes[nodeIdB].div;
    var xb = parseInt(nodeDiv.style.left) + 15;
    var yb = parseInt(nodeDiv.style.top) + 15;
    var length = Math.sqrt(((xa - xb) * (xa - xb)) + ((ya - yb) * (ya -yb)));
    // Centre of edge
    var cx = ((xa + xb) / 2) - length / 2;
    var cy = ((ya + yb) / 2) - (2 / 2);
    var angle = Math.atan2((ya - yb), (xa - xb)) * (180 / Math.PI);
    var edgeDiv = document.createElement('div');
    edgeDiv.classList.add("edge");
    edgeDiv.style.left = cx + "px";
    edgeDiv.style.top = cy + "px";
    edgeDiv.style.width = length + "px";
    edgeDiv.style.transform = "rotate(" + angle + "deg)";
    return edgeDiv;
}

function createNode(x, y) {
    x -= 15;
    y -= 15;
    var nodeDiv = document.createElement('div');
    nodeDiv.classList.add("node");
    nodeDiv.style.left = x + "px";
    nodeDiv.style.top = y + "px";
    var id = graph.addNode(nodeDiv);
    nodeDiv.onclick = function() {
        handleNodeClick(id);
    };
    nodeDiv.id = "node_" + id;
    var textbox = document.createElement('input');
    textbox.value = 0;
    textbox.id = "node_input_" + id;
    textbox.classList.add("node_input");
    nodeDiv.appendChild(textbox);
    graphAreaDiv.appendChild(nodeDiv);
    textbox.select();
    selectedNode = id;
    setState(StateEnum.EDIT_NODE);
}

function removeSelection() {
    if (selectedNode != null) {
        graph.nodes[selectedNode].div.classList.remove("selected");
        selectedNode = undefined;
    }
}

function finishEdit() {
    if (selectedNode != null) {
        var textbox = document.getElementById("node_input_" + selectedNode);
        var val = parseInt(textbox.value) | 0;
        graph.nodes[selectedNode].setValue(val);
        selectedNode = undefined;
    }
}

function abortEdit() {
    if (selectedNode != null) {
        var val = graph.nodes[selectedNode].value | 0;
        graph.nodes[selectedNode].setValue(val);
        selectedNode = undefined;
    }
}

function setState(newState) {
    if (state == StateEnum.EDIT_NODE) {
        finishEdit();
    } else if (state == StateEnum.ADD_EDGE_B) {
        removeSelection();
    }
    state = newState;
}

function handleGraphAreaClick(x, y) {
    if (state == StateEnum.EDIT_NODE) {
        setState(StateEnum.ADD_NODE);
    }
    if (state == StateEnum.ADD_NODE) {
        createNode(x, y);
    }
}

$("#graph_area").click(function(e) {
    if (e.target == this) {
        handleGraphAreaClick(e.pageX, e.pageY);
    }
});

$("#graph_area").keypress(function(e) {
    if (state == StateEnum.EDIT_NODE) {
        if (e.key == "Escape") {  // Esc
            abortEdit();
        } else if (e.key == "Enter" | e.key == "Tab") {
            finishEdit();
        }
    }
});

$("#add_node_btn").click(function(e) {
    setState(StateEnum.ADD_NODE);
});

$("#add_edge_btn").click(function(e) {
    setState(StateEnum.ADD_EDGE_A);
});

$("#node_give_btn").click(function(e) {
    setState(StateEnum.NODE_GIVE);
});

$("#node_take_btn").click(function(e) {
    setState(StateEnum.NODE_TAKE);
});
