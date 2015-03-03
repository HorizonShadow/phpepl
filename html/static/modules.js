function setDefaults (on, def) {

	Object.keys(def).forEach(function(key){
		if (typeof on[key] === "undefined") {
			on[key] = def[key];
		}
	}, on);

}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, 'endsWith', {
    value: function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }
  });
}

/**
 * dommy.js - a simple abstraction over DOM to create and select elements
 * Author - Awal Garg aka Rash
 * https://github.com/awalGarg/dommy/
 * Use at your own risk
 * Licensed under WTFPL
 */

(function (window, document) {

	'use strict';

	var els = function (selector, parent) {
		parent = parent || document;
		return parent.querySelectorAll(selector);
	};
	els.cl = function(klass, parent) {
		parent = parent || document;
		return parent.getElementsByClassName(klass);
	};
	els.byName = function (name) {
		return document.getElementsByName(name);
	};
	els.tag = els.tagName = function (tag, parent) {
		parent = parent || document;
		return parent.getElementsByTagName(tag);
	};

	var el = function (selector, parent) {
		parent = parent || document;
		return parent.querySelector(selector);
	};
	el.id = function (id, parent) {
		parent = parent || document; // document fragments now have getElementById
		return parent.getElementById(id);
	};
	el.cl = function (klass, parent) {
		return els.cl(klass, parent)[0];
	};
	el.byName = function (name) {
		return els.byName(name)[0];
	};
	el.tag = function (tag, parent) {
		return els.tag(tag, parent)[0];
	};

	el.make = function (type, props) {
		
		var elem;
		props = props || {};
		
		var addStyle = function (rule) {
			try {
				elem.style[rule] = props.style[rule];
			}
			catch (err) {
				throw new Error('Unable to assign style ' + rule + err);
			}
		};
		var addDataset = function (name) {
			try {
				elem.dataset[name] = props.dataset[name];
			}
			catch (err) {
				throw new Error('Unable to set dataset ' + name + err);
			}
		};

		if (typeof type === "string") {
			elem = document.createElement(type);
		}
		else if (type.nodeName) {
			try {
				elem = type.cloneNode(props.deep);
			}
			catch (err) {
				throw new Error ('Failed to clone passed node. ' + err);
			}
		}
		else {
			throw new TypeError('Expected String or DOM Node. Passed ' + typeof type);
		}

		// preparation of element over, now assigning the passed properties to it

		var assignProps = function (key) {
			if (['deep'].indexOf(key) !== -1) {/*do nothin, more config to come in this array*/}

			else if (key === 'style') {
        		Object.keys(props.style).forEach(addStyle);
			}
			else if (key === 'dataset') {
				Object.keys(props.dataset).forEach(addDataset);
			}
			else {
				try {
					elem[key] = props[key];
				}
				catch (err) {
					throw new Error('Unable to assign property ' + key + err);
				}
			}
		};
		
		Object.keys(props).forEach(assignProps);

		// element is constructed, now append with el.add if required

		return elem;

	};

	el.add = function (elem, refElem, position) {
		
		position = position || "bottom";	position = position.toLowerCase();
		
		if (position === "top") {
			if (!refElem.childNodes.length) return refElem.appendChild(elem);
			return refElem.insertBefore(elem, refElem.firstChild);
		}
		else if (position === "bottom") {
			return refElem.appendChild(elem);
		}
		else if (position === "before") {
			return refElem.parentNode.insertBefore(elem, refElem);
		}
		else if (position === "after") {
			if (!refElem.nextElementSibling) return refElem.parentNode.appendChild(elem);
			return refElem.parentNode.insertBefore(elem, refElem.nextElementSibling);
		}
		else if (position === "replace") {
			return refElem.parentNode.replaceChild(elem, refElem);
		}
		else {
			throw new Error('Unknown position specified. Expected "top", "bottom", "before", "after" or "replace".');
		}

	};

	el.remove = function (node) {
		if (typeof node === 'string') node = el(node);
		if (node) node.parentNode.removeChild(node);
	};

	window.el = el;
	window.els = els;

})(window, document);
try {
	window.localStorage.setItem('STOOAGE_TEST', 'EXISTS!');
	window.sessionStorage.setItem('STOOAGE_TEST', 'EXISTS!');
	window.localStorage.removeItem('STOOAGE_TEST', 'EXISTS!');
	window.sessionStorage.removeItem('STOOAGE_TEST', 'EXISTS!');
}
catch (err) {
	window.localStorage = {};
	window.sessionStorage = {};
	// FINE! YOU DON'T HAVE A GOOD BROWSER???
	// yeah just fuck you off, your browser is bad, and you should feel bad
	// I don't really give a FUCK, ok?
	// ... _sobs in the corner_
}
function Store (name, type, cont) {

	// name is the name of storage base
	// type is a string, it is either session, or local.

	type = type || 'local';
	cont = cont || {};

	if (type === 'session')
		this.factory = 'sessionStorage';
	else this.factory = 'localStorage';

	this.storeName = name;

	if (!(name in window[this.factory])) {
		this.store = cont;
		this.save();
	}
	else {
		this.store = JSON.parse(window[this.factory][name]);
	}

}

Store.prototype.exec = function (cmd) {
	var args = [].slice.call(arguments, 1), ret = this.store[cmd].apply(this.store, args);
	this.save();
	return ret;
};

Store.prototype.add = function (prop, value) {
	this.store[prop] = value;
	this.save();
	return value;
};

Store.prototype.remove = function (prop) {
	var ret = delete this.store[prop];
	this.save();
	return ret;
};

Store.prototype.contains = function (prop) {
	return this.store.hasOwnProperty(prop);
};

Store.prototype.get = function (prop) {
	return this.store[prop];
};

Store.prototype.save = function () {
	window[this.factory][this.storeName] = JSON.stringify(this.store);
};
window.XHR = (function (window, document) {

	'use strict';

	var cache = new Store('XHRCache', 'session');

	function createRequest (xhr) {
		// create stuff
		var req = new window.XMLHttpRequest(), method = xhr.method.toUpperCase(), url = xhr.url, data;

		if (xhr.data && method !== "HEAD") {
			var fields = Object.keys(xhr.data); data = '';
			if (method === "GET" || !window.FormData) {
				for (var i = 0; i < fields.length; i++) {
					data += fields[i] + '=' + encodeURIComponent(xhr.data[fields[i]]) + '&';
				}
				data = data.slice(0, -1);
				url += method === "GET" ? '?' + data : '';
			}
			else {
				if (xhr.data instanceof window.HTMLFormElement) data = new window.FormData(xhr.data); // and now cache breaks :/
				else {
					data = new window.FormData();
					fields.forEach(function(field) {
						data.append(field, xhr.data[field]); 
					});
				}
			}
		}

		req.open(method, url, true);

		xhr.headers = xhr.headers || {};
		xhr.headers['X-Requested-With'] = xhr.headers['X-Requested-With'] || 'XMLHttpRequest';
		if (method === "POST" && !window.FormData) {
			xhr.headers['Content-Type'] = xhr.headers['Content-Type'] || 'application/x-www-form-urlencoded';
		}

		Object.keys(xhr.headers).forEach(function(header) {
			req.setRequestHeader(header, xhr.headers[header]);
		});

		req.responseType = 'text';
		req.send(data);

		return req;
	}

	function dispatch (xhr, req, status, responseText, responseType) {
		// call the event handlers
		var response, firstChild = null, hasErrored = false;
		if (status < 200 || status >= 300) { // server errored out :/
			hasErrored = true;
		}
		if (['application/json', 'text/json'].indexOf(responseType) !== -1) {
			response = JSON.parse(responseText);
			if (response.error || hasErrored) {
				return xhr.onerror.call(req, response); // we can still add an on(*) event to the request object this way
			} // else
			if (response.ok) {
				return xhr.onload.call(req, response);
			}
		}
		else if (['text/html', 'text/xml'].indexOf(responseType) !== -1) {
			var body = document.createElement('body'), doc = document.createDocumentFragment();
			body.innerHTML = responseText;
			while(body.childNodes.length) {
				doc.appendChild(body.firstChild);
			}
			response = doc;
			firstChild = doc.firstElementChild; // so onload can deal with the firstChild directly
		}
		else {
			response = responseText;
		}
		if (hasErrored) return xhr.onerror.call(req, response, firstChild);
		/*else*/ return xhr.onload.call(req, response, firstChild);
	}

	return function (xhr) {
		// do stuff
		setDefaults(xhr, {
			method: 'POST',
			onload: function (res) {
				console.info('AJAX request called without onload function. Response:');
				console.dir(res);
			},
			onerror: function (res) {
				console.error('Unhandled error in AJAX request!');
				console.dir(res);
			},
			cache: false,
			fromCache: true
		});

		var reqId = JSON.stringify({
			url: xhr.url,
			method: xhr.method.toUpperCase(),
			headers: xhr.headers,
			data: xhr.data
		});

		if (xhr.fromCache && cache.contains(reqId)) {
			return dispatch.apply(undefined, [xhr, null].concat(cache.get(reqId)));
		} // else

		var req = createRequest(xhr);

		req.onreadystatechange = function () {
			if (req.readyState === 4) {
				var reqData = [req.status, req.responseText, req.getResponseHeader('Content-Type')];
				if (xhr.cache) {
					cache.add(reqId, reqData);
				}
				dispatch.apply(undefined, [xhr, req].concat(reqData));
			}
		};

		return req;

	};

})(window, document);

/*
  A wrapper over XHR for shimming some xhr2 things for older browsers
  and a slightly nicer interface
  no support for file uploads without FormData though
  
  response depends on the content type header set by server
  so server cooperation is required

  POST vars without form data will work as well (the magic content-type header)

  works for ie5.5 to all new browsers except opera mini... ofcourse.
  file uploads not allowed without native FormData support. GTH.

  awalGarg aka Rash
  the guy who doesn't care
*/

/*
	server co-operation movement

	this abstraction needs a bit of server co-operation.
	if server sends json response, the response must be escorted with the header
	content-type with the correct json content type
	if json response contains the property 'error', the onerror handler will be called
	if it contains the property 'ok', the onload handler will be called

	if server sends text/html or xml response, the xml tree will be parsed
	and onload handler will be called with the parsed tree as the first parameter,
	and the firstChild to handle directly.

	If server sends an http status of less than 200 or >300, onerror is called...

	server is assumed to be holy and miraculous. It never sends invalid json or xml.

	no blob/file upload/download/progress events. I don't really need them :/
*/

/*
	cache:

	implements sessionStorage based cache from Store constructor
	so yeah, no old IE/opera mini support ;)

	request object will not be passed on cached requests as `this` value
	to onload/onerror handlers. use 'fromCache: false' to override
*/