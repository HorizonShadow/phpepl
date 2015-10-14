var Snip = {};
Snip.UI = {};
Snip.DB = new Store('Snippets');

if (!Snip.DB.contains('snips') || !Snip.DB.get('snips').length) {
	Snip.DB.add('snips', [{
		name: 'Snippet #0',
		code: 'echo \'foo bar\'',
		created: new Date()
	}]);
	Snip.DB.add('config', Snip.DB.get('config') || {});
	Snip.DB.add('lastActive', 0);
	Snip.DB.add('count', 1);
}

Snip.create = function (code) {
	var snip = {
		name: 'Snippet #' + Snip.DB.store.count++,
		code: code,
		created: new Date()
	};
	Snip.DB.store.snips.push(snip);
	Snip.DB.save();
	return snip;
};

Snip.rename = function () {
	var newName = this.textContent.trim(),
		index = Number(this.dataset.snipindex);
	Snip.DB.store.snips[index].name = newName;
	Snip.DB.save();
	this.contentEditable = false;
	this.classList.remove('editing');
	Snip.UI.listing(index).textContent = newName;
};

Snip.save = function (index, code) {
	Snip.DB.store.snips[index].code = code;
	Snip.DB.save();
};

Snip.getSnip = function (index) {
	return Snip.DB.store.snips[index];
};

Snip.getSnipByName = function (name, all) {
	var snips = Snip.DB.store.snips.filter(function (snip) {
		return snip.name === name;
	});
	if (all) return snips;
	return snips[0];
};

Snip.markToRemove = function (index) {
	this.DB.store.snips[index].removeAtUnload = true;
	this.DB.save();
	if (Number(this.UI.currSnip.dataset.snipindex) === index) {
		window.editor.setValue('');
		this.UI.currSnip.textContent = 'Select snippet to open!';
		this.DB.store.lastActive = null;
	}
};

Snip.remove = function (index) {
	this.DB.store.snips.splice(index, 1);
	this.DB.save();
};

Snip.UI.init = function () {
	this.createUI();
	Snip.DB.get('snips').forEach(this.list.bind(Snip.UI));
	this.open(Snip.DB.get('lastActive'), 'fresh');
};
Snip.UI.open = function (index, fresh) {
	if (index === null) return;
	if (!fresh) {
		if (!Snip.DB.get('lastActive')) {
			Snip.DB.add('lastActive', index);
		}
		else {
			Snip.save(Snip.DB.get('lastActive'), window.editor.getValue());
		}
	}
	var snip = Snip.DB.store.snips[index];
	this.currSnip.textContent = snip.name;
	this.currSnip.dataset.snipindex = index;
	window.editor.setValue(snip.code);
	Snip.DB.add('lastActive', index);
	if (this.active) this.active.classList.remove('active');
	this.active = this.listing(index);
	this.active.classList.add('active');
};
Snip.UI.list = function (snip, index) {
	if (this.listing(index)) return;
	var snipEl = el.make('li', {});
	el.add(el.make('a', {
		href: '#',
		textContent: snip.name,
		title: 'Created on: ' + snip.created,
		dataset: {snipindex: index},
		className: 'snippet-link'
	}), snipEl);
	el.add(el.make('a', {
		className: 'delete-btn',
		textContent: '✕',
		href: '#'
	}), snipEl);
	el.add(snipEl, this.snipList);
};
Snip.UI.listing = function (index) {
	// get the li element which represents the snip for given index
	return el('[data-snipindex="' + index + '"]', this.snipList);
};

Snip.UI.onEnter = function (e) {
	if (e.keyCode === 13) {
		Snip.rename.bind(this);
		e.preventDefault();
	}
};

Snip.UI.onSnipListClick = function (e) {
	if (e.target.classList.contains('delete-btn')) {
		var link = e.target.previousElementSibling;
		Snip.markToRemove(Number(link.dataset.snipindex));
		return link.parentNode.classList.add('hidden');
	}
	try {
		Snip.UI.open(Number(e.target.dataset.snipindex));
	}
	catch (err) {
		console.log("Error opening snippet.")
	}
}

Snip.UI.onNewSnipClick = function (e) {
	var snip = Snip.create('/* enter some code here! */'),
		index = Snip.DB.get('snips').length-1;

		Snip.UI.list(snip, index);
		Snip.UI.open(index);
}

Snip.UI.onSearchKeyUp = function (e) {
	[].forEach.call(els.tag('li', Snip.UI.snipList), function (li) {
		if (!this.value.length) return li.classList.remove('hidden');

		if (li.textContent.trim().toLowerCase().indexOf(this.value) !== -1) {
			li.classList.remove('hidden');
		}
		else {
			li.classList.add('hidden');
		}
	}, this);
}

Snip.UI.createUI = function () {
	this.currSnip = el.cl('current-snippet');
	this.currSnip.addEventListener('dblclick', this.letUserRename);
	this.currSnip.addEventListener('blur', Snip.rename);
	this.currSnip.addEventListener('keydown', this.onEnter);
	this.snipList = el.cl('snippet-list');
	this.snipList.addEventListener('click', this.onSnipListClick);
	el.id('new-snip-btn').addEventListener('click', this.onNewSnipClick);
	el.id('snip-search').addEventListener('keyup', this.onSearchKeyUp);
};

Snip.UI.letUserRename = function (e) {
	this.contentEditable = true;
	this.classList.add('editing');
};