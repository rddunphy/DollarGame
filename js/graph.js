
function Node(id, value) {
    this.id = id;
    this.value = value;
    this.connected = [];
    this.add_edge = function(node) {
        if (!this.connected.includes(node)) {
            this.connected.push(node);
            node.connected.push(this);
        }
    }
    this.give = function() {
        for (var i=0; i < this.connected.length; i++) {
            this.value -= 1;
            this.connected[i].value += 1;
        }
    }
    this.take = function() {
        for (var i=0; i < this.connected.length; i++) {
            this.connected[i].value -= 1;
            this.value += 1;
        }
    }
}
