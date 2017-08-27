(() => {
    levelId = 3;
})();

window.loadLevel = function(id) {
    levelId = id;
    let xhr = false;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
        if (xhr.overrideMimeType)
            xhr.overrideMimeType('text/xml');
        else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }
    }

    if (!xhr) {
        alert('Ошибка : невозможно создать запрос');
    }

    xhr.onreadystatechange = function() {
        if ((xhr.readyState != 4) || (xhr.status != 200)) {
            return;
        }
        let items = JSON.parse(xhr.responseText);
        console.dir(items);
        if (items.level[id]!= undefined){
	        console.dir(window.aSokoban);
	        if (window.aSokoban == undefined) {
	            window.aSokoban = new Sokoban({
	                element: document.getElementById('sokoban'),
	                elementdone: document.getElementById('done'),
	                cellSize: 30,
	                levelId: 0,
	                level: [items.level[id]]
	            });
	        }else{
	        	window.aSokoban.options.level=[items.level[id]];
	        	window.aSokoban.loadField();
	        }
        }
    };
    xhr.ontimeout = function() {
        alert('Превышено время ожидания запроса');
    };
    xhr.open('GET', 'levels.json', true);
    xhr.send(null);
};

loadLevel(levelId);
