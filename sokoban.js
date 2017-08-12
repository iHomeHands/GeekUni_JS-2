function Sokoban(options) {
    this.options = options;
    this.element = this.options.element;
    this.field = [];
    this.man = { 'top': 0, 'left': 0 };
    this.init();
}

Sokoban.prototype.init = function() {
    this.loadField();
}

Sokoban.assignData = function(id, my_char, my_class) {
    Sokoban.stateChar[id] = my_char;
    Sokoban.stateClass[id] = my_class;
}

Sokoban.getType = function(my_char) {
    for (key in Sokoban.stateChar) {
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
            var sokobanItem = document.createElement('div');
            sokobanItem.className = Sokoban.stateClass[this.field[i][j]];
            sokobanItem.style.width =
                sokobanItem.style.height = this.options.cellSize + 'px';

            sokobanItem.style.top = (i * this.options.cellSize) + 'px';
            sokobanItem.style.left = (j * this.options.cellSize) + 'px';
            this.element.appendChild(sokobanItem);
        }
    }
    console.log(this.field);
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