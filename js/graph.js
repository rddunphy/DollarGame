
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
}

function Node(id, div) {
    this.id = id;
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
            return true;
        }
        return false;
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
