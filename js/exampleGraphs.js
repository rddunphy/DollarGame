
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
