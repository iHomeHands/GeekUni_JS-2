'use strict';

function Sokoban(options) {
    this.options = options;
    this.element = this.options.element;
    this.field = [];
    this.man = { 'top': 0, 'left': 0 };
    this.targets = [];
    this.mouse = { 'top': 0, 'left': 0 };
    this.moves = [];
    this.done = false;
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
Sokoban.ITEM_MAN_TARGET = 6;
Sokoban.ITEM_NONE = 7;

Sokoban.MOVE_TOP = 0;
Sokoban.MOVE_BOTTOM = 1;
Sokoban.MOVE_LEFT = 2;
Sokoban.MOVE_RIGHT = 3;

Sokoban.stateChar = {};
Sokoban.stateClass = {};
// Sokoban.descDirection = {};
Sokoban.descDirection = [];
Sokoban.action = [];

Sokoban.descDirection[Sokoban.MOVE_TOP] = {
    'dx': -1,
    'dy': 0,
    'short': 'U',
    'shortReverse' : 'D',
    'reverse' : Sokoban.MOVE_BOTTOM
};

Sokoban.descDirection[Sokoban.MOVE_BOTTOM] = {
    'dx': 1,
    'dy': 0,
    'short': 'D',
    'shortReverse' : 'U',
    'reverse' : Sokoban.MOVE_TOP
};

Sokoban.descDirection[Sokoban.MOVE_LEFT] = {
    'dx': 0,
    'dy': -1,
    'short': 'L',
    'shortReverse' : 'R',
    'reverse' : Sokoban.MOVE_RIGHT
};

Sokoban.descDirection[Sokoban.MOVE_RIGHT] = {
    'dx': 0,
    'dy': 1,
    'short': 'R',
    'shortReverse' : 'L',
    'reverse' : Sokoban.MOVE_LEFT
};

Sokoban.action[Sokoban.ITEM_MAN] = [];
Sokoban.action[Sokoban.ITEM_MAN_TARGET] = [];
Sokoban.action[Sokoban.ITEM_BOX] = [];
Sokoban.action[Sokoban.ITEM_SOLVED] = [];

Sokoban.action[Sokoban.ITEM_MAN][Sokoban.ITEM_EMPTY] = {
    'before': '',
    'changeOld': Sokoban.ITEM_EMPTY,
    'changeNew': Sokoban.ITEM_MAN
};

Sokoban.action[Sokoban.ITEM_MAN][Sokoban.ITEM_TARGET] = {
    'before': '',
    'changeOld': Sokoban.ITEM_EMPTY,
    'changeNew': Sokoban.ITEM_MAN_TARGET
};

Sokoban.action[Sokoban.ITEM_MAN][Sokoban.ITEM_BOX] = {
    'before': '1',
};

Sokoban.action[Sokoban.ITEM_MAN][Sokoban.ITEM_SOLVED] = {
    'before': '1',
};

Sokoban.action[Sokoban.ITEM_MAN_TARGET][Sokoban.ITEM_EMPTY] = {
    'before': '',
    'changeOld': Sokoban.ITEM_TARGET,
    'changeNew': Sokoban.ITEM_MAN
};

Sokoban.action[Sokoban.ITEM_MAN_TARGET][Sokoban.ITEM_BOX] = {
    'before': '1',
};

Sokoban.action[Sokoban.ITEM_MAN_TARGET][Sokoban.ITEM_SOLVED] = {
    'before': '1',
};

Sokoban.action[Sokoban.ITEM_MAN_TARGET][Sokoban.ITEM_TARGET] = {
    'before': '',
    'changeOld': Sokoban.ITEM_TARGET,
    'changeNew': Sokoban.ITEM_MAN_TARGET
};

Sokoban.action[Sokoban.ITEM_BOX][Sokoban.ITEM_EMPTY] = {
    'before': '',
    'changeOld': Sokoban.ITEM_EMPTY,
    'changeNew': Sokoban.ITEM_BOX
};

Sokoban.action[Sokoban.ITEM_BOX][Sokoban.ITEM_TARGET] = {
    'before': '',
    'changeOld': Sokoban.ITEM_EMPTY,
    'changeNew': Sokoban.ITEM_SOLVED
};

Sokoban.action[Sokoban.ITEM_SOLVED][Sokoban.ITEM_TARGET] = {
    'before': '',
    'changeOld': Sokoban.ITEM_TARGET,
    'changeNew': Sokoban.ITEM_SOLVED
};

Sokoban.action[Sokoban.ITEM_SOLVED][Sokoban.ITEM_EMPTY] = {
    'before': '',
    'changeOld': Sokoban.ITEM_TARGET,
    'changeNew': Sokoban.ITEM_BOX
};


Sokoban.assignData(Sokoban.ITEM_WALL, '#', 'sokoban__item-wall');
Sokoban.assignData(Sokoban.ITEM_MAN, '@', 'sokoban__item-man');
Sokoban.assignData(Sokoban.ITEM_TARGET, '.', 'sokoban__item-target');
Sokoban.assignData(Sokoban.ITEM_BOX, '$', 'sokoban__item-box');
Sokoban.assignData(Sokoban.ITEM_SOLVED, '*', 'sokoban__item-solved');
Sokoban.assignData(Sokoban.ITEM_EMPTY, ' ', 'sokoban__item-empty');
Sokoban.assignData(Sokoban.ITEM_MAN_TARGET, '+', 'sokoban__item-man-target');

Sokoban.prototype.loadField = function() {
    this.element.style.width = (this.options.level[this.options.levelId].Width * this.options.cellSize) + 'px';
    this.element.style.height = (this.options.level[this.options.levelId].Height * this.options.cellSize) + 'px';
    for (var i = 0; i < this.options.level[this.options.levelId].Height; i++) {
        this.field[i] = [];
        for (var j = 0; j < this.options.level[this.options.levelId].Width; j++) {
            if (this.options.level[this.options.levelId].L[i].length > j) {
                this.field[i][j] = Sokoban.getType(this.options.level[this.options.levelId].L[i].charAt(j));
            } else {
                this.field[i][j] = Sokoban.getType(' ');
            }
            if ((this.field[i][j] == Sokoban.ITEM_MAN) ||
                (this.field[i][j] == Sokoban.ITEM_MAN_TARGET)) {
                this.man.top = i;
                this.man.left = j;
            }
            if ((this.field[i][j] == Sokoban.ITEM_TARGET) ||
                (this.field[i][j] == Sokoban.ITEM_MAN_TARGET) ||
                (this.field[i][j] == Sokoban.ITEM_SOLVED)) {
                this.targets.push({ 'top': i, 'left': j });
            }

            var sokobanItem = document.createElement('div');
            sokobanItem.className = Sokoban.stateClass[this.field[i][j]];
            sokobanItem.id = 'item' + i + '_' + j;
            sokobanItem.dataset.top = i;
            sokobanItem.dataset.left = j;
            sokobanItem.style.width =
                sokobanItem.style.height = this.options.cellSize + 'px';

            sokobanItem.style.top = (i * this.options.cellSize) + 'px';
            sokobanItem.style.left = (j * this.options.cellSize) + 'px';
            var _this = this;
            sokobanItem.addEventListener("click", function() {
                _this.selectFromMouse(this.dataset.top, this.dataset.left);
            });
            this.element.appendChild(sokobanItem);
        }
    }
    console.log(this.field);
}

Sokoban.prototype.selectFromMouse = function(top, left) {
    if (top < 0) return;
    if (left < 0) return;
    if (top >= this.Width) return;
    if (left >= this.Height) return;
    if (this.field[top][left] == Sokoban.ITEM_EMPTY) {
        alert('goto');
        return;
    }
    if (this.field[top][left] == Sokoban.ITEM_TARGET) {
        if (this.field[this.mouse.top][this.mouse.left] == Sokoban.ITEM_BOX) {
            alert('go target');
        } else {
            alert('no target');
        }
    } else if ((this.field[top][left] == Sokoban.ITEM_BOX) ||
        (this.field[top][left] == Sokoban.ITEM_SOLVED)) {
        this.mouse.top = top;
        this.mouse.left = left;
    }
}

Sokoban.prototype.changeClass = function(top, left, type) {
    var itemName = 'item' + top + '_' + left;
    document.getElementById(itemName).className = Sokoban.stateClass[type];
};

Sokoban.prototype.updateClass = function(top, left) {
    var itemName = 'item' + top + '_' + left;
    document.getElementById(itemName).className = Sokoban.stateClass[this.field[top][left]];
};

Sokoban.prototype.isSolved = function() {
    var count = 0;
    for (var ArrKey in this.targets) {
        var type = this.field[this.targets[ArrKey]['top']]
            [this.targets[ArrKey]['left']];
        if (type != Sokoban.ITEM_SOLVED) {
            count++;
        }
    };
    if (count == 0) {
        if (this.done == false) {
            this.done = true;
            alert('Solved ' + this.moves);
        }
    }
}

Sokoban.prototype.viewMoves = function() {
    var path = ''
    for (var ArrKey in this.moves) {
        path += Sokoban.descDirection[this.moves[ArrKey]]['short'];
    }
    console.log(path);
}

Sokoban.prototype.checkReturn = function() {
    if (this.done) {
        return;
    }
    if (this.moves.length == 0) {
        console.log('empty return');
    } else {
        var direction = this.moves.pop();
        this.doReturn(direction);
    }
}

Sokoban.prototype.doReturn = function(direction) {
    console.log('Return ' + Sokoban.descDirection[direction]['short']);
}


Sokoban.prototype.doStep = function(direction) {

    var newman = JSON.parse(JSON.stringify(this.man));
    newman.left += Sokoban.descDirection[direction].dy;
    newman.top += Sokoban.descDirection[direction].dx;

    var newbox = JSON.parse(JSON.stringify(this.man));
    newbox.left += Sokoban.descDirection[direction].dy * 2;
    newbox.top += Sokoban.descDirection[direction].dx * 2;

    var oldManState = this.field[this.man.top][this.man.left];

    var newManState = this.field[newman.top][newman.left];

    var newBoxState = this.field[newbox.top][newbox.left];

    //console.dir(action[oldManState]);
    if (Sokoban.action[oldManState] != undefined) {
        var doAction = Sokoban.action[oldManState][newManState];
        if (doAction != undefined) {
            if (doAction['before'] == 1) {
                if (Sokoban.action[newManState] != undefined) {
                    var doTwoAction = Sokoban.action[newManState][newBoxState];
                    if (doTwoAction != undefined) {
                        this.field[newman.top][newman.left] = doTwoAction['changeOld'];
                        this.field[newbox.top][newbox.left] = doTwoAction['changeNew'];
                        this.updateClass(newman.top, newman.left);
                        this.updateClass(newbox.top, newbox.left);
                        //console.log(this.man, newman, newbox);
                        this.doStep(direction);
                        return;
                        //this.man.left = newman.left;
                        //this.man.top = newman.top;
                    }
                }
            } else {
                this.field[this.man.top][this.man.left] = doAction['changeOld'];
                this.field[newman.top][newman.left] = doAction['changeNew'];
                this.updateClass(this.man.top, this.man.left);
                this.updateClass(newman.top, newman.left);
                //console.log(this.man, newman, newbox);
                this.man.left = newman.left;
                this.man.top = newman.top;
                var _this = this;
                this.moves.push(direction);
                this.viewMoves();
                setTimeout(function() { _this.isSolved() }, 500);
            }
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
        } else if (e.keyCode == 8) {
            _this.checkReturn();
        }
    })
}

new Sokoban({
    element: document.getElementById('sokoban'),
    cellSize: 30,
    levelId: 0,
    level: [{
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

        },
        {
            Id: 2,
            Width: 7,
            Height: 11,
            L: [
                "#######",
                "#     #",
                "#$$ $ #",
                "# $ #.#",
                "# #.#.#",
                "#.#+#.#",
                "#.#.# #",
                "# # $ #",
                "# $$$ #",
                "#     #",
                "#######"
            ]
        }
    ]
});