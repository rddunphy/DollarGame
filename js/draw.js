var StateEnum = Object.freeze({
    "ADD_NODE": 0,
    "ADD_EDGE_A": 1,
    "ADD_EDGE_B": 2,
    "NODE_GIVE": 3,
    "NODE_TAKE": 4,
    "EDIT_NODE": 5,
    "DELETE": 6
});
var ControlHelp = Object.freeze({
    "add_node_btn": "Click anywhere in the graph area to create a node, then type an integer value to assign to the node.",
    "add_edge_btn": "Click on a node to select it, then click on another node to add an edge between the two.",
    "delete_btn": "Click on a node or edge to remove it.",
    "node_give_btn": "Click on a node to make it give one dollar to each connected node.",
    "node_take_btn": "Click on a node to make it take one dollar from each connected node."
});
var graphAreaDiv = document.getElementById("graph_area");
var graph = undefined;
var state = undefined;
var selectedNode = undefined;
var mousedownNode = undefined;

function checkGraphBalanced() {
    if (graph.isBalanced()) {
        graphAreaDiv.classList.add("graph_area_balanced");
    } else {
        graphAreaDiv.classList.remove("graph_area_balanced");
    }
}

function clearGraph() {
    graph = new Graph();
    selectedNode = undefined;
    graphAreaDiv.innerHTML = "";
}

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
        checkGraphBalanced();
    } else if (state == StateEnum.NODE_TAKE) {
        node.take();
        checkGraphBalanced();
    } else if (state == StateEnum.ADD_EDGE_A) {
        selectedNode = nodeId;
        graph.nodes[nodeId].div.classList.add("selected");
        setState(StateEnum.ADD_EDGE_B);
    } else if (state == StateEnum.ADD_EDGE_B) {
        if (selectedNode != nodeId) {
            addEdge(selectedNode, nodeId)
        }
        setState(StateEnum.ADD_EDGE_A);
    } else if (state == StateEnum.DELETE) {
        graphAreaDiv.removeChild(node.div);
        for (var n in graph.nodes[nodeId].connected) {
            var cid = graph.nodes[nodeId].connected[n].id;
            var e = document.getElementById(createEdgeDivId(nodeId, cid));
            graphAreaDiv.removeChild(e);
        }
        graph.removeNode(nodeId);
        checkGraphBalanced();
    }
}

function handleNodeMousedown(id) {
    mousedownNode = id;
}

function handleNodeMouseup(id) {
    if (state == StateEnum.ADD_EDGE_A & mousedownNode != id) {
        addEdge(mousedownNode, id);
    }
    mousedownNode = undefined;
}

function handleEdgeClick(nodeIdA, nodeIdB) {
    if (state == StateEnum.DELETE) {
        graph.removeEdge(nodeIdA, nodeIdB);
        var e = document.getElementById(createEdgeDivId(nodeIdA, nodeIdB));
        graphAreaDiv.removeChild(e);
    }
}

function createEdgeDivId(nodeIdA, nodeIdB) {
    var s = (nodeIdA < nodeIdB) ? nodeIdA : nodeIdB;
    var l = (nodeIdA < nodeIdB) ? nodeIdB : nodeIdA;
    return "edge_" + s + "_" + l;
}

function createEdgeElement(nodeIdA, nodeIdB) {
    var nodeDiv = graph.nodes[nodeIdA].div;
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
    edgeDiv.id = createEdgeDivId(nodeIdA, nodeIdB);
    edgeDiv.style.left = cx + "px";
    edgeDiv.style.top = cy + "px";
    edgeDiv.onclick = function() {
        handleEdgeClick(nodeIdA, nodeIdB);
    };
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
    nodeDiv.onmousedown = function(e) {
        handleNodeMousedown(id);
    };
    nodeDiv.onmouseup = function(e) {
        handleNodeMouseup(id);
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
        checkGraphBalanced();
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

function getButtonName(state) {
    if (state == StateEnum.NODE_TAKE) {
        return "node_take_btn";
    }
    if (state == StateEnum.NODE_GIVE) {
        return "node_give_btn";
    }
    if (state == StateEnum.ADD_EDGE_A |
            state == StateEnum.ADD_EDGE_B) {
        return "add_edge_btn";
    }
    if (state == StateEnum.ADD_NODE |
            state == StateEnum.EDIT_NODE) {
        return "add_node_btn";
    }
    if (state == StateEnum.DELETE) {
        return "delete_btn";
    }
    return undefined;
}

function setState(newState) {
    if (state == StateEnum.EDIT_NODE) {
        finishEdit();
    } else if (state == StateEnum.ADD_EDGE_B) {
        removeSelection();
    }
    var oldBtn = getButtonName(state);
    var newBtn = getButtonName(newState);
    if (oldBtn != newBtn) {
        if (oldBtn) {
            document.getElementById(oldBtn).classList.add("btn-outline-dark");
            document.getElementById(oldBtn).classList.remove("btn-dark");
        }
        document.getElementById(newBtn).classList.add("btn-dark");
        document.getElementById(newBtn).classList.remove("btn-outline-dark");
        document.getElementById("control_help").innerHTML = ControlHelp[newBtn];
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

function loadNode(x, y, val) {
    x += graphAreaDiv.offsetLeft + graphAreaDiv.offsetWidth / 2 - 15;
    y += graphAreaDiv.offsetTop + graphAreaDiv.offsetHeight / 2 - 15;
    var nodeDiv = document.createElement('div');
    nodeDiv.classList.add("node");
    var id = graph.addNode(nodeDiv);
    nodeDiv.onclick = function() {
        handleNodeClick(id);
    };
    nodeDiv.onmousedown = function(e) {
        handleNodeMousedown(id);
    };
    nodeDiv.onmouseup = function(e) {
        handleNodeMouseup(id);
    };
    nodeDiv.id = "node_" + id;
    graphAreaDiv.appendChild(nodeDiv);
    nodeDiv.style.left = x + "px";
    nodeDiv.style.top = y + "px";
    graph.nodes[id].setValue(val);
    return id;
}

function trivialGraph() {
    var a = loadNode(-100, 0, 5);
    var b = loadNode(100, 0, -5);
    addEdge(a, b);
}

function easyGraph() {
    var a = loadNode(-80, -80, 2);
    var b = loadNode(80, -80, -1);
    var c = loadNode(-80, 80, 1);
    var d = loadNode(80, 80, -1);
    addEdge(a, d);
    addEdge(b, c);
    addEdge(c, d);
    addEdge(b, d);
}

function mediumGraph() {
    var a = loadNode(0, -100, 1);
    var b = loadNode(-120, -10, -1);
    var c = loadNode(120, -10, -2);
    var d = loadNode(-60, 100, 2);
    var e = loadNode(60, 100, 3);
    addEdge(a, e);
    addEdge(a, c);
    addEdge(b, c);
    addEdge(c, e);
    addEdge(d, e);
}

function hardGraph() {
    var a = loadNode(-150, -100, 0);
    var b = loadNode(150, -100, 0);
    var c = loadNode(-150, 100, 0);
    var d = loadNode(150, 100, 0);
    var e = loadNode(-50, 0, 5);
    var f = loadNode(50, 0, -5);
    addEdge(a, b);
    addEdge(b, d);
    addEdge(c, d);
    addEdge(c, a);
    addEdge(e, f);
    addEdge(a, e);
    addEdge(c, e);
    addEdge(b, f);
    addEdge(d, f);
}

function unsolvableGraph() {
    var a = loadNode(0, -50, 0);
    var b = loadNode(-80, 50, -1);
    var c = loadNode(80, 50, 1);
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
}

function loadGraph(graphFn) {
    clearGraph();
    setState(StateEnum.NODE_GIVE);
    graphFn();
    checkGraphBalanced();
}

$("#graph_area").click(function(e) {
    if (e.target == this) {
        handleGraphAreaClick(e.pageX, e.pageY);
    }
});

$("#graph_area").keypress(function(e) {
    if (state == StateEnum.EDIT_NODE) {
        if (e.key == "Escape") {
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

$("#delete_btn").click(function(e) {
    setState(StateEnum.DELETE);
});

$("#node_give_btn").click(function(e) {
    setState(StateEnum.NODE_GIVE);
});

$("#node_take_btn").click(function(e) {
    setState(StateEnum.NODE_TAKE);
});

$("#clear_btn").click(function(e) {
    clearGraph();
    setState(StateEnum.ADD_NODE);
});

$("#load_trivial").click(function(e) {
    loadGraph(trivialGraph);
});

$("#load_easy").click(function(e) {
    loadGraph(easyGraph);
});

$("#load_medium").click(function(e) {
    loadGraph(mediumGraph);
});

$("#load_hard").click(function(e) {
    loadGraph(hardGraph);
});

$("#load_unsolvable").click(function(e) {
    loadGraph(unsolvableGraph);
});

loadGraph(mediumGraph);
