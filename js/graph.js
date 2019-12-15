const MAX_NODE_VAL = 99;
const MIN_NODE_VAL = -MAX_NODE_VAL;

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
        this.nodes[id] = new Node(id, div);
        return id;
    };
    this.removeNode = function(nodeId) {
        var node = this.nodes[nodeId];
        for (var n in this.nodes) {
            var i = this.nodes[n].connected.indexOf(node);
            if (i > -1) {
                this.nodes[n].connected.splice(i, 1);
            }
        }
        delete this.nodes[nodeId];
    };
    this.removeEdge = function(nodeIdA, nodeIdB) {
        var na = this.nodes[nodeIdA];
        var nb = this.nodes[nodeIdB];
        var i = na.connected.indexOf(nb);
        if (i > -1) {
            na.connected.splice(i, 1);
        }
        i = nb.connected.indexOf(na);
        if (i > -1) {
            nb.connected.splice(i, 1);
        }
    };
    this.isBalanced = function() {
        return Object.entries(this.nodes).every(e => e[1].value >= 0);
    };
}

function Node(id, div) {
    this.id = id;
    this.div = div;
    this.connected = [];
    this.setValue = function(value) {
        this.value = value;
        var node_class = (value < 0) ? "node_val_negative" : "node_val_positive";
        this.div.innerHTML = "<span class=\"" + node_class + "\">" + value + "</span>";
    };
    this.addEdge = function(node) {
        if (!this.connected.includes(node)) {
            this.connected.push(node);
            node.connected.push(this);
            return true;
        }
        return false;
    };
    this.give = function() {
        if (this.value - this.connected.length < MIN_NODE_VAL) {
            return;
        }
        for (var i=0; i < this.connected.length; i++) {
            if (this.connected[i].value + 1 > MAX_NODE_VAL) {
                return;
            }
        }
        for (var i=0; i < this.connected.length; i++) {
            this.connected[i].setValue(this.connected[i].value + 1);
        }
        this.setValue(this.value - this.connected.length);
    };
    this.take = function() {
        if (this.value + this.connected.length > MAX_NODE_VAL) {
            return;
        }
        for (var i=0; i < this.connected.length; i++) {
            if (this.connected[i].value - 1 < MIN_NODE_VAL) {
                return;
            }
        }
        for (var i=0; i < this.connected.length; i++) {
            this.connected[i].setValue(this.connected[i].value - 1);
        }
        this.setValue(this.value + this.connected.length);
    };
}
