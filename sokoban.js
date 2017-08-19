'use strict';

function Sokoban(options) {
    this.options = options;
    this.element = this.options.element;
    this.elementdone = this.options.elementdone;
    this.field = [];
    this.man = { 'top': 0, 'left': 0 };
    this.targets = [];
    this.mouse = { 'top': 0, 'left': 0 };
    this.moves = [];
    this.automoves = [];
    this.done = false;
    this.element.innerHTML = '';
    this.element.style.display = "block";
    this.timeToSolved = 0;
    this.init();
    this.timer;
    this.timerAutoMove;
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
Sokoban.MOVE_PUSH_TOP = 4;
Sokoban.MOVE_PUSH_BOTTOM = 5;
Sokoban.MOVE_PUSH_LEFT = 6;
Sokoban.MOVE_PUSH_RIGHT = 7;


Sokoban.stateChar = {};
Sokoban.stateClass = {};
Sokoban.descDirection = [];

Sokoban.simple = [];

Sokoban.action = [];
Sokoban.reverseAction = [];

Sokoban.descDirection[Sokoban.MOVE_TOP] = {
    'dx': -1,
    'dy': 0,
    'short': 'U',
    'push': Sokoban.MOVE_PUSH_BOTTOM,
    'shortReverse': 'D',
    'reverse': Sokoban.MOVE_BOTTOM
};

Sokoban.descDirection[Sokoban.MOVE_BOTTOM] = {
    'dx': 1,
    'dy': 0,
    'short': 'D',
    'push': Sokoban.MOVE_PUSH_TOP,
    'shortReverse': 'U',
    'reverse': Sokoban.MOVE_TOP
};

Sokoban.descDirection[Sokoban.MOVE_LEFT] = {
    'dx': 0,
    'dy': -1,
    'short': 'L',
    'push': Sokoban.MOVE_PUSH_RIGHT,
    'shortReverse': 'R',
    'reverse': Sokoban.MOVE_RIGHT
};

Sokoban.descDirection[Sokoban.MOVE_RIGHT] = {
    'dx': 0,
    'dy': 1,
    'short': 'R',
    'push': Sokoban.MOVE_PUSH_LEFT,
    'shortReverse': 'L',
    'reverse': Sokoban.MOVE_LEFT
};

Sokoban.descDirection[Sokoban.MOVE_PUSH_TOP] = {
    'dx': -1,
    'dy': 0,
    'short': 'T',
    'reverse': Sokoban.MOVE_BOTTOM
};

Sokoban.descDirection[Sokoban.MOVE_PUSH_BOTTOM] = {
    'dx': 1,
    'dy': 0,
    'short': 'B',
    'reverse': Sokoban.MOVE_TOP
};

Sokoban.descDirection[Sokoban.MOVE_PUSH_LEFT] = {
    'dx': 0,
    'dy': -1,
    'short': 'A',
    'reverse': Sokoban.MOVE_RIGHT
};

Sokoban.descDirection[Sokoban.MOVE_PUSH_RIGHT] = {
    'dx': 0,
    'dy': 1,
    'short': 'S',
    'reverse': Sokoban.MOVE_LEFT
};

Sokoban.assignSimple = function(action, a1, b1, a2, b2) {
    if (action == undefined)
        action = [];
    if (action[a1] == undefined)
        action[a1] = [];
    action[a1][b1] = {
        'changeOld': a2,
        'changeNew': b2
    }
}

Sokoban.assignWithPush = function(action, reverseAction, a1, b1, c1, a2, b2, c2) {
    if (action == undefined)
        action = [];
    if (action[a1] == undefined)
        action[a1] = [];
    if (action[a1][b1] == undefined)
        action[a1][b1] = [];

    action[a1][b1][c1] = {
        'changeOld': a2,
        'changeNew': b2,
        'changeBefore': c2
    }
    if (reverseAction == undefined)
        reverseAction = [];
    if (reverseAction[a2] == undefined)
        reverseAction[a2] = [];
    if (reverseAction[a2][b2] == undefined)
        reverseAction[a2][b2] = [];

    reverseAction[a2][b2][c2] = {
        'changeOld': a1,
        'changeNew': b1,
        'changeBefore': c1
    }
}

//---------------------------------------------------------------

//@_ _@
Sokoban.assignSimple(Sokoban.simple,
    Sokoban.ITEM_MAN, Sokoban.ITEM_EMPTY, Sokoban.ITEM_EMPTY, Sokoban.ITEM_MAN);

//@. _+
Sokoban.assignSimple(Sokoban.simple,
    Sokoban.ITEM_MAN, Sokoban.ITEM_TARGET, Sokoban.ITEM_EMPTY, Sokoban.ITEM_MAN_TARGET);

//+_ .@
Sokoban.assignSimple(Sokoban.simple,
    Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_EMPTY, Sokoban.ITEM_TARGET, Sokoban.ITEM_MAN);
//+@ @+
Sokoban.assignSimple(Sokoban.simple,
    Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_TARGET, Sokoban.ITEM_TARGET, Sokoban.ITEM_MAN_TARGET);

//---------------------------------------------------------------

//@$_ _@$

Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN, Sokoban.ITEM_BOX, Sokoban.ITEM_EMPTY,
    Sokoban.ITEM_EMPTY, Sokoban.ITEM_MAN, Sokoban.ITEM_BOX);

//@$. _+*
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN, Sokoban.ITEM_BOX, Sokoban.ITEM_TARGET,
    Sokoban.ITEM_EMPTY, Sokoban.ITEM_MAN, Sokoban.ITEM_SOLVED);

//@*. _+*
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN, Sokoban.ITEM_SOLVED, Sokoban.ITEM_TARGET,
    Sokoban.ITEM_EMPTY, Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_SOLVED);

//@*_ _+$
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN, Sokoban.ITEM_SOLVED, Sokoban.ITEM_EMPTY,
    Sokoban.ITEM_EMPTY, Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_BOX);
//+$_ .@$
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_BOX, Sokoban.ITEM_EMPTY,
    Sokoban.ITEM_TARGET, Sokoban.ITEM_MAN, Sokoban.ITEM_BOX);
//+*. .+*
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_SOLVED, Sokoban.ITEM_TARGET,
    Sokoban.ITEM_TARGET, Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_SOLVED);
//+$. .@*
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_BOX, Sokoban.ITEM_TARGET,
    Sokoban.ITEM_TARGET, Sokoban.ITEM_MAN, Sokoban.ITEM_SOLVED);

//+*_ .+$
Sokoban.assignWithPush(Sokoban.action, Sokoban.reverseAction,
    Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_SOLVED, Sokoban.ITEM_EMPTY,
    Sokoban.ITEM_TARGET, Sokoban.ITEM_MAN_TARGET, Sokoban.ITEM_BOX);

//---------------------------------------------------------------

Sokoban.assignData(Sokoban.ITEM_WALL, '#', 'sokoban__item-wall');
Sokoban.assignData(Sokoban.ITEM_MAN, '@', 'sokoban__item-man');
Sokoban.assignData(Sokoban.ITEM_TARGET, '.', 'sokoban__item-target');
Sokoban.assignData(Sokoban.ITEM_BOX, '$', 'sokoban__item-box');
Sokoban.assignData(Sokoban.ITEM_SOLVED, '*', 'sokoban__item-solved');
Sokoban.assignData(Sokoban.ITEM_EMPTY, ' ', 'sokoban__item-empty');
Sokoban.assignData(Sokoban.ITEM_MAN_TARGET, '+', 'sokoban__item-man-target');

//---------------------------------------------------------------

Sokoban.prototype.removeField = function() {}

Sokoban.prototype.onTime = function() {
    if (!this.done) {
        if (this.moves.length > 0) {
            this.timeToSolved++;
            this.elementdone.innerHTML = 'Ходов : ' + this.moves.length +
                ' Время: ' + this.timeToSolved;
        }
    }
}

Sokoban.prototype.onAutoMove = function() {
    if (this.automoves.length > 0) {
        console.log(this.automoves);
        var dir = this.automoves.shift();
        this.doStep(dir);
    }
}

Sokoban.prototype.loadField = function() {
    var _this = this;
    this.timeToSolved = 0;
    this.done = false;
    this.moves = [];
    this.automoves = [];
    if (this.timer == undefined) {
        this.timer = setInterval((function(self) {
            return function() {
                self.onTime();
            }
        })(this), 1000);
    }
    if (this.timerAutoMove == undefined) {
        this.timerAutoMove = setInterval((function(self) {
            return function() {
                self.onAutoMove();
            }
        })(this), 50);
    }

    this.field = [];
    this.targets = [];
    this.elementdone.innerHTML = 'Ходов: 0 Время: 0'; // style.display = "none";
    this.element.style.display = "block";

    this.element.innerText = '';
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

Sokoban.prototype.goto = function(top, left) {
    var lpath = [];
    var dleft = left - this.man.left;
    var dtop = top - this.man.top;
    var twodirect = [{
            'one': { 'dir1': Sokoban.MOVE_BOTTOM, 'dir2': Sokoban.MOVE_RIGHT },
            'two': { 'dir1': Sokoban.MOVE_RIGHT, 'dir2': Sokoban.MOVE_BOTTOM }
        }, //00
        {
            'one': { 'dir1': Sokoban.MOVE_TOP, 'dir2': Sokoban.MOVE_RIGHT },
            'two': { 'dir1': Sokoban.MOVE_RIGHT, 'dir2': Sokoban.MOVE_TOP }
        }, //01
        {
            'one': { 'dir1': Sokoban.MOVE_BOTTOM, 'dir2': Sokoban.MOVE_LEFT },
            'two': { 'dir1': Sokoban.MOVE_LEFT, 'dir2': Sokoban.MOVE_BOTTOM }
        }, //10
        {
            'one': { 'dir1': Sokoban.MOVE_TOP, 'dir2': Sokoban.MOVE_LEFT },
            'two': { 'dir1': Sokoban.MOVE_LEFT, 'dir2': Sokoban.MOVE_TOP }
        }, //11
    ];
    var pattern = (dtop < 0 ? 1 : 0);
    pattern |= (dleft < 0 ? 1 << 1 : 0);
    console.log(pattern, twodirect[pattern], dtop, dleft);
    console.log('Step one');
    var tmppath = [];
    var find = 1;
    if (dtop != 0) {
        for (var i = 0; i < Math.abs(dtop); i++) {
            tmppath.push(twodirect[pattern]['one']['dir1']);
            console.log(twodirect[pattern]['one']['dir1']);
        };
    }
    if (dleft != 0) {
        for (var i = 0; i < Math.abs(dleft); i++) {
            tmppath.push(twodirect[pattern]['one']['dir2']);
            console.log(twodirect[pattern]['one']['dir2']);
        };
    }
    var man_left = this.man.left;
    var man_top = this.man.top;
    for (var i = 0; i < tmppath.length; i++) {
        var dir = tmppath[i];
        if (!this.allowedStep(dir, man_left, man_top)) {
            find = 0;
            console.log('Stop ', i);
            break;
        }
        man_left += Sokoban.descDirection[dir].dy;
        man_top += Sokoban.descDirection[dir].dx;

    }
    if (find == 1) {
        return tmppath;
    }
    var tmppath = [];
    var find = 1;
    if (dleft != 0) {
        for (var i = 0; i < Math.abs(dleft); i++) {
            tmppath.push(twodirect[pattern]['two']['dir1']);
            console.log(twodirect[pattern]['two']['dir1']);
        };
    }
    if (dtop != 0) {
        for (var i = 0; i < Math.abs(dtop); i++) {
            tmppath.push(twodirect[pattern]['two']['dir2']);
            console.log(twodirect[pattern]['two']['dir2']);
        };
    }
    var man_left = this.man.left;
    var man_top = this.man.top;
    for (var i = 0; i < tmppath.length; i++) {
        var dir = tmppath[i];
        if (!this.allowedStep(dir, man_left, man_top)) {
            find = 0;
            console.log('Stop ', i);
            break;
        }
        man_left += Sokoban.descDirection[dir].dy;
        man_top += Sokoban.descDirection[dir].dx;

    }
    if (find == 1) {
        return tmppath;
    }

    return [];
}

Sokoban.prototype.selectFromMouse = function(top, left) {
    if (top < 0) return;
    if (left < 0) return;
    if (top >= this.Width) return;
    if (left >= this.Height) return;
    if (this.field[top][left] == Sokoban.ITEM_EMPTY) {
        var path = this.goto(top, left);
        console.dir(path);
        if (path != []) {
            this.automoves = path;
        }
        return;
    }
    if (this.field[top][left] == Sokoban.ITEM_TARGET) {
        if (this.field[this.mouse.top][this.mouse.left] == Sokoban.ITEM_BOX) {
            alert('go target');
        } else {
            var path = this.goto(top, left);
            console.dir(path);
            if (path != []) {
                this.automoves = path;
            }
            return;
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
            this.elementdone.innerHTML = "<h1>Уровень завершен<h1><p>Количество ходов: " + this.moves.length +
                "</p><p>Время на прохождение: " + this.timeToSolved +
                " с </p><a href='javascript:loadLevel(levelId);'>Начать сначало</a><BR><a href='javascript:loadLevel(levelId+1);' >Следующий уровень</a>";
            this.elementdone.style.display = "block";
            this.element.style.display = "none";
            //alert('Solved ' + this.moves);
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
        return;
    }
        var direction = this.moves.pop();
        this.moves.push(direction);
        switch (direction) {
            case Sokoban.MOVE_TOP:
            case Sokoban.MOVE_BOTTOM:
            case Sokoban.MOVE_LEFT:
            case Sokoban.MOVE_RIGHT:
                this.doReturnSimple(direction);
                break;

            case Sokoban.MOVE_PUSH_TOP:
            case Sokoban.MOVE_PUSH_BOTTOM:
            case Sokoban.MOVE_PUSH_LEFT:
            case Sokoban.MOVE_PUSH_RIGHT:
                this.doReturnPush(direction);
                break;
            default:
                {
                    console.log('Error')
                }
        }
}

Sokoban.prototype.doReturnSimple = function(direction) {
    //console.log('Simple ' + direction);
    var newman = JSON.parse(JSON.stringify(this.man));
    newman.left += Sokoban.descDirection[Sokoban.descDirection[direction]['reverse']].dy;
    newman.top += Sokoban.descDirection[Sokoban.descDirection[direction]['reverse']].dx;

    var oldManState = this.field[this.man.top][this.man.left];

    var newManState = this.field[newman.top][newman.left];
    if (Sokoban.simple[oldManState] != undefined) {
        var doAction = Sokoban.simple[oldManState][newManState];
        if (doAction != undefined) {
            this.field[this.man.top][this.man.left] = doAction['changeOld'];
            this.field[newman.top][newman.left] = doAction['changeNew'];
            this.updateClass(this.man.top, this.man.left);
            this.updateClass(newman.top, newman.left);
            this.man.left = newman.left;
            this.man.top = newman.top;
            this.moves.pop();
            this.viewMoves();
            var _this = this;
            setTimeout(function() { _this.isSolved() }, 500);
        }
    }
}

Sokoban.prototype.doReturnPush = function(direction) {
    //console.log('Push ' + direction);
    var newman = JSON.parse(JSON.stringify(this.man));
    newman.left += Sokoban.descDirection[direction].dy;
    newman.top += Sokoban.descDirection[direction].dx;

    var newbox = JSON.parse(JSON.stringify(this.man));
    newbox.left += Sokoban.descDirection[Sokoban.descDirection[direction]['reverse']].dy;
    newbox.top += Sokoban.descDirection[Sokoban.descDirection[direction]['reverse']].dx;

    var newManState = this.field[this.man.top][this.man.left];

    var oldManState = this.field[newman.top][newman.left];

    var newBoxState = this.field[newbox.top][newbox.left];
    //console.log(this.man, newman, newbox);
    //console.log(oldManState, newManState, newBoxState);
    //console.log(Sokoban.reverseAction);
    if (Sokoban.reverseAction[oldManState] != undefined) {
        var doAction = Sokoban.reverseAction[oldManState][newManState];
        if (doAction != undefined) {
            if (doAction[newBoxState] != undefined) {
                this.field[this.man.top][this.man.left] =
                    doAction[newBoxState]['changeNew'];
                this.field[newman.top][newman.left] =
                    doAction[newBoxState]['changeOld'];
                this.field[newbox.top][newbox.left] =
                    doAction[newBoxState]['changeBefore'];
                this.updateClass(this.man.top, this.man.left);
                this.updateClass(newman.top, newman.left);
                this.updateClass(newbox.top, newbox.left);
                this.man.left = newman.left;
                this.man.top = newman.top;
                this.moves.pop();
                this.viewMoves();
                var _this = this;
                setTimeout(function() { _this.isSolved() }, 500); //                 done = true;
            }
        }
    }

}

Sokoban.prototype.allowedStep = function(direction, man_left, man_top) {
    man_left += Sokoban.descDirection[direction].dy;
    man_top += Sokoban.descDirection[direction].dx;
    var newManState = this.field[man_top][man_left];
    return ((newManState == Sokoban.ITEM_EMPTY) || (newManState == Sokoban.ITEM_TARGET));
}

Sokoban.prototype.doStep = function(direction) {

    var newman = JSON.parse(JSON.stringify(this.man));
    newman.left += Sokoban.descDirection[direction].dy;
    newman.top += Sokoban.descDirection[direction].dx;

    var oldManState = this.field[this.man.top][this.man.left];

    var newManState = this.field[newman.top][newman.left];

    if ((newManState == Sokoban.ITEM_BOX) || (newManState == Sokoban.ITEM_SOLVED)) {
        var newbox = JSON.parse(JSON.stringify(this.man));
        newbox.left += Sokoban.descDirection[direction].dy * 2;
        newbox.top += Sokoban.descDirection[direction].dx * 2;
        var newBoxState = this.field[newbox.top][newbox.left];
        if (Sokoban.action[oldManState] != undefined) {
            var doAction = Sokoban.action[oldManState][newManState];
            if (doAction != undefined) {
                if (doAction[newBoxState] != undefined) {
                    this.field[this.man.top][this.man.left] =
                        doAction[newBoxState]['changeOld'];
                    this.field[newman.top][newman.left] =
                        doAction[newBoxState]['changeNew'];
                    this.field[newbox.top][newbox.left] =
                        doAction[newBoxState]['changeBefore'];
                    this.updateClass(this.man.top, this.man.left);
                    this.updateClass(newman.top, newman.left);
                    this.updateClass(newbox.top, newbox.left);
                    this.man.left = newman.left;
                    this.man.top = newman.top;
                    this.moves.push(Sokoban.descDirection[direction]['push']);
                    this.viewMoves();
                    var _this = this;
                    setTimeout(function() { _this.isSolved() }, 500); //                 done = true;
                }
            }
        }
    } else {
        if (Sokoban.simple[oldManState] != undefined) {
            var doAction = Sokoban.simple[oldManState][newManState];
            if (doAction != undefined) {
                this.field[this.man.top][this.man.left] = doAction['changeOld'];
                this.field[newman.top][newman.left] = doAction['changeNew'];
                this.updateClass(this.man.top, this.man.left);
                this.updateClass(newman.top, newman.left);
                this.man.left = newman.left;
                this.man.top = newman.top;
                this.moves.push(direction);
                this.viewMoves();
                var _this = this;
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
