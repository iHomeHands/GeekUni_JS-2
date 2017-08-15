(()=> {
	levelId = 3;
})();	

window.loadLevel = function (id) {
	levelId = id;
	var xhr = false;
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

	xhr.onreadystatechange = function () {
		if ((xhr.readyState != 4) || (xhr.status != 200)) {
			return;
		}
		var items = JSON.parse(xhr.responseText);
		console.dir(items);						
		new Sokoban({
			element: document.getElementById('sokoban'),
			elementdone: document.getElementById('done'),
			cellSize: 30,
			levelId: 0,
			level: [items]
		});
	}
	xhr.ontimeout = function () {
		alert('Превышено время ожидания запроса');
	};
	xhr.open('GET', 'level' + id + '.json', true);
	xhr.send(null);
};

loadLevel(levelId);
