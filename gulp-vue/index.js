var through = require('through2');
var gutil = require('gulp-util');

var parse5 = require('parse5');
var deindent = require('de-indent');
var validateTemplate = require('vue-template-validator');
var jade = require('jade');

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

var getHTML = {//暂时只做了jade模版的支持，需要别的模版对该对象进行扩展
	'jade' : function (content) {
		return jade.compile(content, {})({})
	},
	'default': function (content) {
		return content;
	}
};
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
		var lang = (getAttribute(node, 'lang') || 'default').toLowerCase();
		
		var warnings = null
		if (!output[type]) {
			return
		}
		// node count check
		if ((type === 'script' || type === 'template') && output[type].length > 0) {
			throw new Error(
				'[glup-vue] Only one <script> or <template> tag is allowed inside a Vue component.'
			)
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
			//将非script的内容进行当行注释，保持原文件行数，方便js错误查看
			result = commentScript(content.slice(0, start), lang) +
				deindent(content.slice(start, end)) +
				commentScript(content.slice(end), lang)
		} else {
			result = deindent(content.slice(start, end))
		}
		output[type] = {
			lang: lang,
			content: result,
			warnings: warnings
		}
	})
	var lang = output.template.lang;
	if (!getHTML[lang]) {
		throw new Error(
			'[glup-vue] ' + lang + ' html engine not support'
		)
	}
	/*
		return output.script.content 
			+ "\n;exports.default.template = '" + getHTML[lang](output.template.content, {}).replace(/(\\*)'/g, function (a, b) {
			return (b||"").replace('\\', '\\\\') + "\\'"
		}).replace(/\n/g, '\\\n') + "'";
		*/
	//try { 
		/*return output.script.content 
			+ "\n;exports.default.template = '" + getHTML[lang](output.template.content, {}).replace(/(\\*)'/g, function (a, b) {
			return (b||"").replace('\\', '\\\\') + "\\'"
		}).replace(/\n/g, '\\\n') + "'";*/
		//对生成的html,'号进行替换，没有做多测试案例，可能有点小bug
		return output.script.content 
			+ "\n;exports.default.template = '" + getHTML[lang](output.template.content, {}).replace(/(\\*)'/g, function (a, b) {
			return (b||"").replace('\\', '\\\\') + "\\'"
		}).replace(/\n/g, '\\\n') + "';";
	//} catch (e) { 
		//console.log('message', e.message); 
	//} 

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