var ctrl = {};
var sirest;

var Controller = function() {
	this._users = {};
	this._current_user = undefined;
	this._templates = {};
	this._auto_save = true;
	
	var ctxt = this;
	
	$('[id]').each(function() {
		var $this = $(this);
		ctxt['$' + $this.attr('id')] = $this;
		if ($this.get(0).tagName === 'SCRIPT') {
			ctxt.addTemplate($this.attr('id'), $this.html());
		}
	});
	
};

Controller.prototype.getCurrentUser = function() {
	return this._current_user;
};

Controller.prototype.getCurrentList = function() {
	var ctxt = this;
	
	var releases = [];
	ctxt.$aoty_picks.find('li').each(function(i, e) {
		releases.push($(e).data('url'));
	});
	
	return releases;
};

Controller.prototype.userListKey = function(username) {
	return `user-${username}-2016-list`;
};

Controller.prototype.getListForUser = function(username, cb) {
	var ctxt = this;
	
	sirest.retrieve(ctxt.userListKey(username), {
		callback: function(resp) {
			if (resp.success) {
				cb(JSON.parse(resp.payload));
			} else {
				cb([]);
			}
		}
	});
};

Controller.prototype.saveUserList = function(username, list, cb) {
	var ctxt = this;
	ctxt.block("Saving changes...");
	sirest.store(ctxt.userListKey(username), JSON.stringify(list), {
		callback: function(resp) {
			ctxt.unblock();
			if (resp.success) {
				cb(null, resp.payload);
			} else {
				cb('Storage failed!');
			}
		}
	});
};

Controller.prototype.loadUser = function(username, url, cb) {
	var ctxt = this;
	
	ctxt.log(`Loading user ${username}...`);
	ctxt.block(`Loading user ${username}...`);
	$.getJSON('data/' + url, {}, function(d, s, x) {
		ctxt.log('loaded.');
		ctxt.block('loaded.');
		var $opt = $('<option></option>');
		$opt
			.attr('value', username)
			.data('releases', d)
			.html(username)
			.appendTo(ctxt.$user_picker);
			
		ctxt._users[username] = d.collection.map(function(o) {
			o.list = 'collection';
			return o;
		}).concat(d.wishlist.map(function(o) {
			o.list = 'wishlist';
			return o;
		})).sort(function(a, b) {
			var an = (a.band_name + '-' + a.item_title)
				.toLowerCase()
				.trim()
				.replace(/[^A-Za-z0-9]+/, '');
			var bn = (b.band_name + '-' + b.item_title)
				.toLowerCase()
				.trim()
				.replace(/[^A-Za-z0-9]+/, '');
			if (an < bn) {
				return -1;
			}
			if (an > bn) {
				return 1;
			}
			return 0;
		});
		
		if (ctxt.$user_picker.find('option').length === 1) {
			ctxt.displayUserAlbums(username);
		}
		
		cb();
	});
};

Controller.prototype.autoSave = function() {
	var ctxt = this;
	
	if (!ctxt._auto_save) {
		return;
	}
	ctxt.saveUserList(ctxt.getCurrentUser(), ctxt.getCurrentList(), function(err, resp) {
		if (err) {
			alert(err);
		} else {
			ctxt.log("user list saved");
		}
	});
};

Controller.prototype.addReleaseToPicksList = function(release) {
	var ctxt = this;
	var $rel = $('<li></li>');
	$rel
		.addClass('release')
		.html(ctxt.render('pick-entry', release))
		.data('release', release)
		.attr('data-url', release.item_url);
		
	$rel.on('click', '.remove-arrow', function(e) {
		$rel.remove();
		ctxt.addReleaseToAllList(release);
		ctxt.autoSave();
	}).on('click', function(e) {
		ctxt.$all_releases.find('li').removeClass('selected');
		ctxt.$aoty_picks.find('li').removeClass('selected');
		$(this).addClass('selected');
		ctxt.$focus_release.html(ctxt.render('album-display', release));
	});
	
	ctxt.$aoty_picks.append($rel);
	ctxt.autoSave();
};

Controller.prototype.addReleaseToAllList = function(release) {
	var ctxt = this;
	var $rel = $('<li></li>');
	$rel
		.addClass('release')
		.html(ctxt.render('album-entry', release))
		.data('release', release)
		.attr('data-url', release.item_url);
		
	$rel.on('click', '.add-arrow', function(e) {
		$rel.remove();
		ctxt.addReleaseToPicksList(release);
	}).on('click', function(e) {
		ctxt.$all_releases.find('li').removeClass('selected');
		ctxt.$aoty_picks.find('li').removeClass('selected');
		$(this).addClass('selected');
		
		ctxt.$focus_release.html(ctxt.render('album-display', release));
	});
	
	ctxt.$all_releases.append($rel);
};

Controller.prototype.displayUserAlbums = function(username) {
	var ctxt = this;
	ctxt._current_user = username;
	ctxt._auto_save = false;
	
	ctxt.block(`Loading picks for ${username}`);
	ctxt.getListForUser(username, function(list) {
		ctxt.$all_releases.empty();
		ctxt.$aoty_picks.empty();
		
		var albums = ctxt._users[username];
		$.each(albums, function(idx, release) {
			if (/^2016-/.test(release.released)) {
				ctxt.addReleaseToAllList(release);
			}
		});
		
		$.each(list, function(idx, rel_url) {
			var $list_item = ctxt.$all_releases.find('[data-url="' + rel_url + '"]');
			if ($list_item.length > 0) {
				var release = $list_item.data('release');
				$list_item.remove();
				ctxt.addReleaseToPicksList(release);
			}
		});
		ctxt.unblock();
		ctxt._auto_save = true;
	});
};

Controller.prototype.addTemplate = function(name, source) {
	var ctxt = this;
	ctxt._templates[name] = Handlebars.compile(source);
};

Controller.prototype.render = function(name, data) {
	var ctxt = this;
	return ctxt._templates[name](data);
};

Controller.prototype.eventHandlers = function() {
	var ctxt = this;
	
	ctxt.$user_picker.on('change', function(e) {
		var sel = ctxt.$user_picker.val();
		ctxt.displayUserAlbums(sel);
	});
};

Controller.prototype.block = function(msg, cb) {
	var ctxt = this;
	ctxt.$overlay_message.html(msg);
	ctxt.$modal_overlay
		.stop()
		.fadeTo(250, 0.5, function(e) {
			if (typeof cb === 'function') {
				cb();
			}
		});
	
};

Controller.prototype.unblock = function(cb) {
	var ctxt = this;
	ctxt.$modal_overlay
		.stop()
		.fadeTo(25, 0, function(e) {
			ctxt.$modal_overlay.hide();
			if (typeof cb === 'function') {
				cb();
			}
		});
};

Controller.prototype.loadAllUsers = function(users, cb) {
	var ctxt = this;
	
	var u = users.shift();
	ctxt.loadUser(u.user, u.data, function() {
		if (users.length > 0) {
			ctxt.loadAllUsers(users, cb);
		} else {
			ctxt.unblock();
			cb();
		}
	});	
};

Controller.prototype.init = function(cb) {
	var ctxt = this;
	
	ctxt.eventHandlers();
	
	ctxt.$aoty_picks.sortable({
		containment: 'parent',
		handle: '.handle',
		stop: function(event, ui) {
			ctxt.autoSave();
		}
	});
	
	ctxt.log("Loading user index...");
	ctxt.block("Loading user index...");
	$.getJSON('data/index.json', {}, function(d, s, x) {
		ctxt.block("index loaded.");
		ctxt._users = {};
		ctxt.$all_releases.empty();
		ctxt.$user_picker.empty();
		ctxt.loadAllUsers(d, cb);
	});
};

Controller.prototype.log = function() {
	if (console && console.log) {
		console.log(arguments)
	}
};

$(function() {
	
	ctrl = new Controller();
	
	sirest = new Sirest({
		app: 'AOTY',
		encrypt: false,
		password: false
	});
	
	ctrl.log("Authenticating with Sirest...");
	ctrl.block("Accessing storage...");
	sirest.authenticate('AOTY', 'password!', {
		callback: function(d) {
			if (d.success) {
				ctrl.log("Success.");
				ctrl.block("Initializing...");
				ctrl.init(function() {
					ctrl.unblock();
					ctrl.log('done.');
				});
			} else {
				ctrl.log("Failure!");
			}
		}
	});
});