var graphAreaDiv = document.getElementById("graph_area");

var StateEnum = Object.freeze({
    "ADD_NODE": 0,
    "ADD_EDGE_A": 1,
    "ADD_EDGE_B": 2,
    "NODE_GIVE": 3,
    "NODE_TAKE": 4
});
var graph = new Graph();
var state = StateEnum.ADD_NODE;
var edgeNodeA = undefined;

function handleNodeClick(nodeId) {
    var node = graph.nodes[nodeId];
    if (state == StateEnum.NODE_GIVE) {
        node.give();
    } else if (state == StateEnum.NODE_TAKE) {
        node.take();
    } else if (state == StateEnum.ADD_EDGE_A) {
        edgeNodeA = nodeId;
        state = StateEnum.ADD_EDGE_B;
    } else if (state == StateEnum.ADD_EDGE_B) {
        if (edgeNodeA != nodeId) {
            var nodeA = graph.nodes[edgeNodeA];
            var nodeB = graph.nodes[nodeId];
            nodeA.addEdge(nodeB);
            state = StateEnum.ADD_EDGE_A;
        }
    }
}

function createNode(x, y) {
    x -= 15;
    y -= 15;
    var nodeDiv = document.createElement('div');
    nodeDiv.classList.add("node");
    nodeDiv.style.position = "absolute";
    nodeDiv.style.left = x + "px";
    nodeDiv.style.top = y + "px";
    var id = graph.addNode(nodeDiv);
    nodeDiv.onclick = function() {
        handleNodeClick(id);
    };
    graphAreaDiv.appendChild(nodeDiv);
}

function handleGraphAreaClick(x, y) {
    if (state == StateEnum.ADD_NODE) {
        createNode(x, y);
    }
}

$("#graph_area").click(function(e) {
    if (e.target == this) {
        handleGraphAreaClick(e.pageX, e.pageY);
    }
});

$("#add_node_btn").click(function(e) {
    state = StateEnum.ADD_NODE;
});

$("#add_edge_btn").click(function(e) {
    state = StateEnum.ADD_EDGE_A;
});

$("#node_give_btn").click(function(e) {
    state = StateEnum.NODE_GIVE;
});

$("#node_take_btn").click(function(e) {
    state = StateEnum.NODE_TAKE;
});
