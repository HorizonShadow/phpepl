;(function (window, document) {
	window.editor = window.CodeMirror.fromTextArea(document.getElementById("editor"), {
		lineNumbers: true,
		scrollbarStyle: 'overlay',
		matchBrackets: true,
		mode: 'text/x-php',
		indentUnit: 2,
		tabSize: 3,
		autofocus: true,
		autoCloseBrackets: true,
		theme: 'monokai'
	});

	function processCode () {
		var err = el.cl('error-gutter'); if(err) err.classList.remove('error-gutter');
		XHR({
			url: 'eval.php',
			method: 'POST',
			data: {code: getNicerValue()},
			onload: processResponse,
			onerror: processFatalError
		});
	}

	function getNicerValue () {
		return parseCode(window.editor.getValue());
	}

	function parseCode (code, includeStack) {
		// it will wrap lastLine in var_dump if it startsWith `>` followed by any space
		// AND does not end with a semicolon
		// also removes <?php and ?>
		// if you use <? (short open tags), you suck anyways
		// and manage some pesky includes
		if (!Array.isArray(includeStack)) includeStack = [];
		var fileName = el.cl('current-snippet').textContent,
			lines = code.trim().replace(/^<\?php\s/, '').replace(/\?>$/, '').trim().split('\n'),
			num = lines.length,
			lastLine = lines[num - 1].trim();
		
		if (lastLine.startsWith('>') && !lastLine.endsWith(';')) {
			// let us add var_dump!
			lines[num - 1] = lastLine.replace(/^>\s*/, 'var_dump(') + ');';
		}

		code = lines.join('\n');

		includeStack.push(fileName);
		return code.replace(/^\/\*!include\s+(.+)\*\/$/m, function (match, include) {
			if (includeStack.indexOf(include) !== -1) {
				editorHelpers.setOutput('Detected Include-ception! Include stack: ' + JSON.stringify(includeStack.concat(include)), true);
				throw Error ('Include ception!');
			}
			var snip = Snip.getSnipByName(include);
			if (snip) {
				includeStack.push(include);
				return parseCode(snip.code, includeStack);
			}
			return '';
		});
	}

	var editorHelpers = {
		getPrettyFatalErrorMessage: function(error) {
			return ['Line ' + error.line + ': ' + error.message, error.line];
		},
		showLineError: function(line) {
			// Find the dom element in the gutter
			var lineElement = ([].filter.call(els.cl('CodeMirror-linenumber CodeMirror-gutter-elt'), function (node) {
				return Number(node.textContent) === line;
			}))[0];
			lineElement.classList.add('error-gutter');
		},
		setOutput: function(text) {
			var isError = !!arguments[1],
				output = el('.output span');

			// Remove error classes if any
			output.innerHTML = text;
			output.classList.remove('error');

			if (isError) output.classList.add('error');

			// Turn off the spinner
			// el.remove(el.cl('spinner'));
			// Set the timestamp
			// var time = new Date;
			// $('.timestamp').find('span').html(time);
		}
	};

	function processResponse(res) {
		if (!res) return;

		var result = res.result,
			error = res.error,
			errorMsg = '';

		if (!error) {
			editorHelpers.setOutput(result);
		}
		else {
			if (error.line && error.message) {
				// Show the line in red
				editorHelpers.showLineError(error.line);

				// Show the error message
				errorMsg = 'Line ' + error.line + ': ';
			}

			errorMsg += error.message;

			editorHelpers.setOutput(errorMsg, true);
		}
	}

	function processFatalError(resp) {
		if (!resp) return;

		var textLine = editorHelpers.getPrettyFatalErrorMessage(resp.error);

		editorHelpers.setOutput(textLine[0], true);
		editorHelpers.showLineError(textLine[1]);
	}

	function checkForShortcuts(e) {
		// CMD + Enter or CTRL + Enter to run code
		if (e.which === 13 && (e.ctrlKey || e.metaKey)) {
			processCode();
			e.preventDefault();
		}

		// // CMD + S or CTRL + S to save code
		// if (e.which === 83 && (e.ctrlKey || e.metaKey)) {
		// 	storageHelpers.saveCode();
		// 	e.preventDefault();
		// }
	}

	window.addEventListener('keydown', checkForShortcuts);

	el.id('info-btn').addEventListener('click', function () {
		this.textContent = (this.textContent === '?') ? '✕' : '?';
		el.cl('footer').classList.toggle('hidden');
	});

	
	window.addEventListener('load', Snip.UI.init.bind(Snip.UI));
	window.addEventListener('beforeunload', function () {
		Snip.save(Number(Snip.UI.currSnip.dataset.snipindex), window.editor.getValue());
		Snip.DB.store.snips.forEach(function (snip, index) {
			if (snip.removeAtUnload) Snip.remove(index);
		});
	});
})(window, document);