
function newNodeId(nodes) {
    for (var i = 0; i < Object.entries(nodes).length + 1; i++) {
        if (!(i in nodes)) {
            return i;
        }
    }
}

function Graph() {
    this.nodes = new Object();
    this.addNode = function(div) {
        var id = newNodeId(this.nodes);
        this.nodes[id] = new Node(div);
        return id;
    };
}

function Node(div) {
    this.div = div;
    this.connected = [];
    this.setValue = function(value) {
        this.value = value;
        this.div.innerHTML = "<span>" + value + "</span>";
    };
    this.addEdge = function(node) {
        if (!this.connected.includes(node)) {
            this.connected.push(node);
            node.connected.push(this);
        }
    };
    this.give = function() {
        for (var i=0; i < this.connected.length; i++) {
            this.connected[i].setValue(this.connected[i].value + 1);
        }
        this.setValue(this.value - this.connected.length);
    };
    this.take = function() {
        for (var i=0; i < this.connected.length; i++) {
            this.connected[i].setValue(this.connected[i].value - 1);
        }
        this.setValue(this.value + this.connected.length);
    };
}
