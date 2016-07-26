var parse5 = require('parse5')
var deindent = require('de-indent')
var validateTemplate = require('vue-template-validator')
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
		style: [],
		script: []
	}
	var fragment = parse5.parseFragment(content, {
		locationInfo: true
	});
	fragment.childNodes.forEach(function (node) {
		var type = node.tagName
		var lang = getAttribute(node, 'lang')
		var src = getAttribute(node, 'src')
		var scoped = getAttribute(node, 'scoped') != null
		
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
			console.log(type, start, end);
			// preserve other parts as commenets so that linters
			// and babel can output correct line numbers in warnings
			result = commentScript(content.slice(0, start), lang) +
				deindent(content.slice(start, end)) +
				commentScript(content.slice(end), lang)
			console.log(result);
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

var fs = require('fs');
var str = fs.readFileSync("./Hello.vue" , 'utf8');
vueWrite('', str)
console.log(res);

