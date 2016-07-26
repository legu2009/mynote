var through = require('through2');
var gutil = require('gulp-util');

/*
var regTpl = /<template>([\s\S]+?)<\/template>/;
var regStyle = /<style>([\s\S]+?)<\/style>/; 
var regJs = /<script>([\s\S]+?)<\/script>/; 
var reg = [/'/g, /\n/g, /([^\\]+)\.vue$/];

var vueWrite = function (file, str) {
	var match = file.path.match(reg[2]);
	var id = "vue-tpl-" + match[1];
	var appendJs = "";
	var res = "";
	str = str.replace(regTpl, function (t, h) {
		appendJs += "\tVue.appendHTML(\n'<template id=\"" + id + "\">" +  h.replace(reg[0], "\\'").replace(reg[1], "\\\n") + "<\/template>');\n";
		return "";
	}).replace(regStyle, function (t, h) {
		appendJs += "\tVue.appendCSS(\n'" + h.replace(reg[0], "\\'").trim().replace(reg[1], "\\\n") + "');\n"
		return "";
	}).replace(regJs, function (t, h) {
		res = "define(function (require) {\
require('VueCommon');\
var Vue = require('Vue');\
var exports;\n" + appendJs + h + ";\n\texports.template = '#" + id + "';\n\texports = Vue.extend(exports);\n\tVue.component('" + match[1] + "', exports);\n\treturn exports;\n});"
		return ;
	})
	return res;
};*/

module.exports = function(opt){
	function run (file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(new gutil.PluginError('gulp-vue', 'doesn\'t support Streams'));
		}
		file.contents = new Buffer(vueWrite(file, file.contents.toString()));
		file.path = file.path + '.js';
		callback(null, file);
	}
	return through.obj(run);
}

var parse5 = require('parse5')
var deindent = require('de-indent')
var splitRE = /\r?\n/g
var emptyRE = /^\s*$/
var commentSymbols = {
	'iced': '#',
	'iced-jsx': '#',
	'iced-redux': '#',
	'coffee': '#',
	'coffee-jsx': '#',
	'coffee-redux': '#',
	'purs': '--',
	'ulmus': '--'
}

var vueWrite = function (file, content) {
	var output = {
		template: [],
		script: []
	}
	var fragment = parse5.parseFragment(content, {
		locationInfo: true
	});
	fragment.childNodes.forEach(function (node) {
		var type = node.tagName
		var lang = getAttribute(node, 'lang')
		var src = getAttribute(node, 'src')

		var warnings = null
		var map = null

		if (!output[type]) {
			return
		}

		// node count check
		if ((type === 'script' || type === 'template') && output[type].length > 0) {
			throw new Error(
				'[vue-loader] Only one <script> or <template> tag is allowed inside a Vue component.'
			)
		}
		// handle src imports
		if (src) {
			if (type === 'style') {
				output.styleImports.push({
					src: src,
					lang: lang,
					scoped: scoped
				})
			} else if (type === 'template') {
				output.template.push({
					src: src,
					lang: lang
				})
			} else if (type === 'script') {
				output.script.push({
					src: src,
					lang: lang
				})
			}
			return
		}

		// skip empty script/style tags
		if (type !== 'template' && (!node.childNodes || !node.childNodes.length)) {
			return
		}

		// template content is nested inside the content fragment
		if (type === 'template') {
			node = node.content
			if (!lang) {
				warnings = validateTemplate(node, content)
			}
		}

		// extract part
		var start = node.childNodes[0].__location.startOffset
		var end = node.childNodes[node.childNodes.length - 1].__location.endOffset
		var result
		if (type === 'script') {
			// preserve other parts as commenets so that linters
			// and babel can output correct line numbers in warnings
			result =
			commentScript(content.slice(0, start), lang) +
			deindent(content.slice(start, end)) +
			commentScript(content.slice(end), lang)
		} else {
			var lineOffset = content.slice(0, start).split(splitRE).length - 1
			result = deindent(content.slice(start, end))

			// pad whith whitespace so that error messages are correct
			result = Array(lineOffset + 1).join('\n') + result
		}

		output[type].push({
			lang: lang,
			scoped: scoped,
			content: result,
			map: map && map.toJSON(),
			warnings: warnings
		})
	})

	cache.set(cacheKey, output)
	return output
}

function commentScript (content, lang) {
  var symbol = getCommentSymbol(lang)
  var lines = content.split(splitRE)
  return lines.map(function (line, index) {
    // preserve EOL
    if (index === lines.length - 1 && emptyRE.test(line)) {
      return ''
    } else {
      return symbol + (emptyRE.test(line) ? '' : ' ' + line)
    }
  })
  .join('\n')
}

function getCommentSymbol (lang) {
  return commentSymbols[lang] || '//'
}

function getAttribute (node, name) {
  if (node.attrs) {
    var i = node.attrs.length
    var attr
    while (i--) {
      attr = node.attrs[i]
      if (attr.name === name) {
        return attr.value
      }
    }
  }
}
