var ctrl = {};
var sirest;

var Controller = function() {
	this._users = {};
	this._current_user = undefined;
	this._templates = {};
	this._auto_save = true;
	this._timeout= undefined;
	this._keep_alive_interval = 1000 * 60 * 5;
	this._id = [(new Date()).getTime(), Math.round(Math.random() * 1000000)].join('-');
	
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
		
		//if (ctxt.$user_picker.find('option').length === 1) {
		//	ctxt.displayUserAlbums(username);
		//}
		
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
		e.preventDefault();
		e.stopPropagation();
	}).on('click', '.listen-button', function(e) {
		ctxt.$aoty_picks.find('li').removeClass('selected');
		$(this).closest('li').addClass('selected');
		ctxt.$focus_release.html(ctxt.render('album-display', release));
		e.preventDefault();
		e.stopPropagation();
	});
	
	ctxt.$aoty_picks.append($rel);
	ctxt.autoSave();
};

Controller.prototype.getUserPickByURL = function(username, url) {
	var ctxt = this;
	var alt_url = url.replace('https://', 'http://');
	for (var i = 0, l = ctxt._users[username].length; i < l; i++) {
		if (ctxt._users[username][i].item_url == url || ctxt._users[username][i].item_url == alt_url) {
			return ctxt._users[username][i];
		}
	}
	return false;
};

Controller.prototype.displayUserAlbums = function(username) {
	var ctxt = this;
	ctxt._current_user = username;
	this.remember('viewing-user', username);
	ctxt._auto_save = false;
	
	ctxt.block(`Loading picks for ${username}`);
	ctxt.getListForUser(username, function(list) {
		$.each(list, function(idx, rel_url) {
			var release = ctxt.getUserPickByURL(username, rel_url);
			if (release === false) {
				throw new Error(`Couldn't find ${rel_url}  for ${username}`);
			}
			ctxt.addReleaseToPicksList(release);
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
		ctxt.$aoty_picks.empty();
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
			
			var user = ctxt.recall('viewing-user');
			if (user && typeof ctxt._users[user] !== 'undefined') {
				ctxt.$user_picker.val(user);
				ctxt.displayUserAlbums(user);
			}
			cb();
		}
	});
};

Controller.prototype.remember = function(k, v) {
	if (localStorage && typeof localStorage !== 'undefined') {
		localStorage.setItem(k, v);
		return true;
	}
	return false;
};


Controller.prototype.recall = function(k) {
	if (localStorage && typeof localStorage !== 'undefined') {
		return localStorage.getItem(k);
	}
}

Controller.prototype.init = function(cb) {
	var ctxt = this;
	
	ctxt.eventHandlers();
	
	ctxt.log("Loading user index...");
	ctxt.block("Loading user index...");
	$.getJSON('data/index.json?_cache_buster=' + (new Date()).getTime(), {}, function(d, s, x) {
		ctxt.block("index loaded.");
		ctxt._users = {};
		ctxt.$user_picker.empty();
		ctxt.loadAllUsers(d, cb);
	});
	
	var keepAlive = function() {
		sirest.store(ctxt._id + '.aoty-keep-alive', (new Date()).getTime(), {
			callback: function(resp) {
				if (resp.success) {
					ctxt.log("Keep alive succeeded");
				} else {
					ctxt.log("Keep alive FAILED!");
				}
				ctxt._timeout = setTimeout(keepAlive, ctxt._keep_alive_interval);
			}
		});
	};
	
	keepAlive();
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
	
	if (document.location.hash.length > 2) {
		console.log(document.location.hash);
		var user = document.location.hash.substring(1);
		ctrl.remember('viewing-user', user);
	}
	
	
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