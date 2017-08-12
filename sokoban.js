'use strict';

function Sokoban(options) {
    this.options = options;
    this.element = this.options.element;
    this.field = [];
    this.man = { 'top': 0, 'left': 0 };
    this.init();
}

Sokoban.prototype.init = function() {
    this.loadField();
    this.listen();
}

Sokoban.assignData = function(id, my_char, my_class) {
    Sokoban.stateChar[id] = my_char;
    Sokoban.stateClass[id] = my_class;
}

Sokoban.getType = function(my_char) {
    for (var key in Sokoban.stateChar) {
        if (Sokoban.stateChar[key] == my_char) {
            return key;
        }
    }
}

Sokoban.ITEM_EMPTY = 0;
Sokoban.ITEM_MAN = 1;
Sokoban.ITEM_TARGET = 2;
Sokoban.ITEM_BOX = 3;
Sokoban.ITEM_SOLVED = 4;
Sokoban.ITEM_WALL = 5;
Sokoban.stateChar = {};
Sokoban.stateClass = {};

Sokoban.MOVE_TOP = 0;
Sokoban.MOVE_BOTTOM = 1;
Sokoban.MOVE_LEFT = 2;
Sokoban.MOVE_RIGHT = 3;

Sokoban.assignData(Sokoban.ITEM_WALL, '#', 'sokoban__item-wall');
Sokoban.assignData(Sokoban.ITEM_MAN, '@', 'sokoban__item-man');
Sokoban.assignData(Sokoban.ITEM_TARGET, '.', 'sokoban__item-target');
Sokoban.assignData(Sokoban.ITEM_BOX, '$', 'sokoban__item-box');
Sokoban.assignData(Sokoban.ITEM_SOLVED, '+', 'sokoban__item-solved');
Sokoban.assignData(Sokoban.ITEM_EMPTY, ' ', 'sokoban__item-empty');

Sokoban.prototype.loadField = function() {
    this.element.style.width = (this.options.level.Width * this.options.cellSize) + 'px';
    this.element.style.height = (this.options.level.Height * this.options.cellSize) + 'px';
    for (var i = 0; i < this.options.level.Height; i++) {
        this.field[i] = [];
        for (var j = 0; j < this.options.level.Width; j++) {
            if (this.options.level.L[i].length > j) {
                this.field[i][j] = Sokoban.getType(this.options.level.L[i].charAt(j));
            } else {
                this.field[i][j] = Sokoban.getType(' ');
            }
            if (this.field[i][j] == Sokoban.ITEM_MAN) {
                this.man.top = i;
                this.man.left = j;
            }
            var sokobanItem = document.createElement('div');
            sokobanItem.className = Sokoban.stateClass[this.field[i][j]];
            sokobanItem.id = 'item' + i + '_' + j;
            sokobanItem.style.width =
                sokobanItem.style.height = this.options.cellSize + 'px';

            sokobanItem.style.top = (i * this.options.cellSize) + 'px';
            sokobanItem.style.left = (j * this.options.cellSize) + 'px';
            this.element.appendChild(sokobanItem);
        }
    }
    console.log(this.field);
}

Sokoban.prototype.changeClass = function(top, left, type) {
    var itemName = 'item' + top + '_' + left;
    document.getElementById(itemName).className = Sokoban.stateClass[type];
};

Sokoban.prototype.updateClass = function(top, left) {
    var itemName = 'item' + top + '_' + left;
    document.getElementById(itemName).className = Sokoban.stateClass[this.field[top][left]];
};

Sokoban.prototype.doStep = function(direction) {
    var ofs = [];
    ofs[Sokoban.MOVE_TOP] = { 'dx': -1, 'dy': 0 };
    ofs[Sokoban.MOVE_BOTTOM] = { 'dx': 1, 'dy': 0 };
    ofs[Sokoban.MOVE_LEFT] = { 'dx': 0, 'dy': -1 };
    ofs[Sokoban.MOVE_RIGHT] = { 'dx': 0, 'dy': 1 };

    var newman = JSON.parse(JSON.stringify(this.man));
    newman.left += ofs[direction].dy;
    newman.top += ofs[direction].dx;
    //console.log(this.man, newman, this.field[newman.top][newman.left]);

    var action = [];
    action[Sokoban.ITEM_MAN] = [];
    //console.dir(Sokoban.ITEM_MAN, action);
    action[Sokoban.ITEM_MAN][Sokoban.ITEM_EMPTY] = { 'changeOld': Sokoban.ITEM_EMPTY, 'changeNew': Sokoban.ITEM_MAN };

    var oldState = this.field[this.man.top][this.man.left];
    var newState = this.field[newman.top][newman.left];
    console.dir(action[oldState]);
    if (action[oldState] != undefined) {
        var doAction = action[oldState][newState];
        if (doAction != 'undefined') {
            this.field[this.man.top][this.man.left] = doAction['changeOld'];
            this.field[newman.top][newman.left] = doAction['changeNew'];
            this.updateClass(this.man.top, this.man.left);
            this.updateClass(newman.top, newman.left);
            console.log(this.man, newman);
            this.man.left = newman.left;
            this.man.top = newman.top;
        }
    }
}

Sokoban.prototype.listen = function() {
    var _this = this,
        directions = {
            38: Sokoban.MOVE_TOP,
            40: Sokoban.MOVE_BOTTOM,
            37: Sokoban.MOVE_LEFT,
            39: Sokoban.MOVE_RIGHT
        }
    window.addEventListener('keydown', function(e) {

        if (e.keyCode in directions) {
            _this.doStep(directions[e.keyCode]);
        }
    })
}

new Sokoban({
    element: document.getElementById('sokoban'),
    cellSize: 30,
    level: {
        Id: "#1",
        Width: 19,
        Height: 11,
        L: [
            "    #####",
            "    #   #",
            "    #   #",
            "  ###   ##",
            "  #      #",
            "### # ## #   ######",
            "#   # ## #####    #",
            "# $  $           .#",
            "#####$### #@##  ..#",
            "    #     #########",
            "    #######"
        ]

    }
});