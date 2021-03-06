const NODE_RADIUS = 15;
var StateEnum = Object.freeze({
    "ADD_NODE": 0,
    "ADD_EDGE_A": 1,
    "ADD_EDGE_B": 2,
    "MOVE_NODE": 3,
    "EDIT_NODE_VAL": 4,
    "NODE_GIVE": 5,
    "NODE_TAKE": 6,
    "EDIT_NODE": 7,
    "DELETE": 8
});
var ControlHelp = Object.freeze({
    "add_node_btn": "Click anywhere in the graph area to create a node, then type an integer value to assign to the node.",
    "add_edge_btn": "Drag from one node to another to add an edge.",
    "move_node_btn": "Drag a node to move it.",
    "edit_node_btn": "Click on a node to edit its value (values in range " + MIN_NODE_VAL + " to " + MAX_NODE_VAL + ").",
    "delete_btn": "Click on a node or edge to remove it.",
    "node_give_btn": "Click on a node to make it give one dollar to each connected node.",
    "node_take_btn": "Click on a node to make it take one dollar from each connected node."
});
var graphAreaDiv = document.getElementById("graph_area");
var graph = undefined;
var state = undefined;
var prevState = undefined;
var selectedNode = undefined;
var mousedownNode = undefined;
var tempEdge = undefined;

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
    } else if (state == StateEnum.EDIT_NODE_VAL) {
        editNodeVal(nodeId);
    } else if (state == StateEnum.MOVE_NODE) {
        // TODO
    } else if (state == StateEnum.DELETE) {
        graphAreaDiv.removeChild(node.div);
        for (var n in graph.nodes[nodeId].connected) {
            var cid = graph.nodes[nodeId].connected[n].id;
            var e = document.getElementById(createEdgeDivId(nodeId, cid));
            graphAreaDiv.removeChild(e);
        }
        graph.removeNode(nodeId);
        checkGraphBalanced();
    } else if (state == StateEnum.EDIT_NODE) {
        if (nodeId != selectedNode) {
            setState(prevState);
            if (state == StateEnum.EDIT_NODE_VAL) {
                handleNodeClick(nodeId);
            }
        }
    }
}

function drawTempEdge(id, xb, yb) {
    var nodeDiv = graph.nodes[id].div;
    var xa = parseInt(nodeDiv.style.left) + NODE_RADIUS;
    var ya = parseInt(nodeDiv.style.top) + NODE_RADIUS;
    if (!tempEdge) {
        tempEdge = document.createElement('div');
        tempEdge.classList.add("edge");
        graphAreaDiv.appendChild(tempEdge);
        tempEdge.id = "temp_edge";
    }
    moveEdge(tempEdge, xa, ya, xb, yb);
}

function removeTempEdge() {
    tempEdge = null;
    graphAreaDiv.onmousemove = null;
    $("#temp_edge").remove();
}

function moveEdge(edgeDiv, xa, ya, xb, yb) {
    var length = Math.sqrt(((xa - xb) * (xa - xb)) + ((ya - yb) * (ya -yb)));
    // Centre of edge
    var cx = ((xa + xb) / 2) - length / 2;
    var cy = ((ya + yb) / 2) - 1;
    var angle = Math.atan2((ya - yb), (xa - xb)) * (180 / Math.PI);
    edgeDiv.style.left = cx + "px";
    edgeDiv.style.top = cy + "px";
    edgeDiv.style.width = length + "px";
    edgeDiv.style.transform = "rotate(" + angle + "deg)";
}

function getNodeDivPos(x, y) {
    var minX = graphAreaDiv.offsetLeft + NODE_RADIUS;
    var maxX = graphAreaDiv.offsetLeft + graphAreaDiv.offsetWidth - NODE_RADIUS;
    var minY = graphAreaDiv.offsetTop + NODE_RADIUS;
    var maxY = graphAreaDiv.offsetTop + graphAreaDiv.offsetHeight - NODE_RADIUS;
    x = Math.max(Math.min(maxX, x), minX);
    y = Math.max(Math.min(maxY, y), minY);
    return [x-NODE_RADIUS, y-NODE_RADIUS];
}

function moveNode(x, y) {
    var nodeDiv = graph.nodes[selectedNode].div;
    [x, y] = getNodeDivPos(x, y);
    nodeDiv.style.left = x + "px";
    nodeDiv.style.top = y + "px";
    for (var n in graph.nodes[selectedNode].connected) {
        var cid = graph.nodes[selectedNode].connected[n].id;
        var div = document.getElementById(createEdgeDivId(selectedNode, cid));
        var nodeDiv = graph.nodes[cid].div;
        var xb = parseInt(nodeDiv.style.left) + NODE_RADIUS;
        var yb = parseInt(nodeDiv.style.top) + NODE_RADIUS;
        moveEdge(div, x + NODE_RADIUS, y + NODE_RADIUS, xb, yb);
    }
}

function handleNodeMousedown(id) {
    mousedownNode = id;
    if (state == StateEnum.ADD_EDGE_A) {
        graphAreaDiv.onmousemove = function(e) {
            drawTempEdge(id, e.pageX, e.pageY);
        };
        window.onmouseup = function(e) {
            removeTempEdge();
        };
    } else if (state == StateEnum.MOVE_NODE) {
        selectedNode = id;
        graphAreaDiv.onmousemove = function(e) {
            moveNode(e.pageX, e.pageY);
        };
        window.onmouseup = function(e) {
            graphAreaDiv.onmousemove = null;
        };
    }
}

function handleNodeMouseup(id) {
    if (state == StateEnum.ADD_EDGE_A && mousedownNode != id) {
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
    var xa = parseInt(nodeDiv.style.left) + NODE_RADIUS;
    var ya = parseInt(nodeDiv.style.top) + NODE_RADIUS;
    nodeDiv = graph.nodes[nodeIdB].div;
    var xb = parseInt(nodeDiv.style.left) + NODE_RADIUS;
    var yb = parseInt(nodeDiv.style.top) + NODE_RADIUS;
    var edgeDiv = document.createElement('div');
    edgeDiv.classList.add("edge");
    edgeDiv.id = createEdgeDivId(nodeIdA, nodeIdB);
    edgeDiv.onclick = function() {
        handleEdgeClick(nodeIdA, nodeIdB);
    };
    moveEdge(edgeDiv, xa, ya, xb, yb);
    return edgeDiv;
}

function editNodeVal(nodeId) {
    var textbox = document.createElement('input');
    textbox.value = graph.nodes[nodeId].value;
    textbox.id = "node_input_" + nodeId;
    textbox.classList.add("node_input");
    var nodeDiv = graph.nodes[nodeId].div;
    nodeDiv.innerHTML = "";
    nodeDiv.appendChild(textbox);
    graphAreaDiv.appendChild(nodeDiv);
    textbox.select();
    selectedNode = nodeId;
    setState(StateEnum.EDIT_NODE);
}

function createNode(x, y) {
    [x, y] = getNodeDivPos(x, y);
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
        var val = parseInt(textbox.value) || 0;
        val = Math.max(Math.min(val, MAX_NODE_VAL), MIN_NODE_VAL);
        graph.nodes[selectedNode].setValue(val);
        checkGraphBalanced();
        selectedNode = undefined;
    }
    if (prevState == StateEnum.EDIT_NODE_VAL) {
        setState(StateEnum.EDIT_NODE_VAL);
    }
}

function abortEdit() {
    if (selectedNode != null) {
        var val = graph.nodes[selectedNode].value || 0;
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
    if (state == StateEnum.ADD_EDGE_A ||
            state == StateEnum.ADD_EDGE_B) {
        return "add_edge_btn";
    }
    if (state == StateEnum.ADD_NODE) {
        return "add_node_btn";
    }
    if (state == StateEnum.EDIT_NODE) {
        if (prevState == StateEnum.EDIT_NODE_VAL) {
            return "edit_node_btn";
        }
        return "add_node_btn";
    }
    if (state == StateEnum.DELETE) {
        return "delete_btn";
    }
    if (state == StateEnum.EDIT_NODE_VAL) {
        return "edit_node_btn";
    }
    if (state == StateEnum.MOVE_NODE) {
        return "move_node_btn";
    }
    return undefined;
}

function setState(newState) {
    prevState = state;
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
        setState(prevState);
    }
    if (state == StateEnum.ADD_NODE) {
        createNode(x, y);
    }
}

function loadNode(x, y, val) {
    x += graphAreaDiv.offsetLeft + graphAreaDiv.offsetWidth / 2 - NODE_RADIUS;
    y += graphAreaDiv.offsetTop + graphAreaDiv.offsetHeight / 2 - NODE_RADIUS;
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

$("#graph_area").keyup(function(e) {
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

$("#move_node_btn").click(function(e) {
    setState(StateEnum.MOVE_NODE);
});

$("#edit_node_btn").click(function(e) {
    setState(StateEnum.EDIT_NODE_VAL);
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
