
var fs = require('fs');
var regTpl = /<template>([\s\S]+?)<\/template>/;
var regStyle = /<style>([\s\S]+?)<\/style>/; 
var regJs = /<script>([\s\S]+?)<\/script>/; 

var str = fs.readFileSync("./Hello.vue" , 'utf8');
var appendJs = "var Vue = require('Vue');";
var res = "";
str = str.replace(regTpl, function (t, h) {
	appendJs += "Vue.appendHTML('<template >" +  h.replace(/'/g, "\\'").replace(/\n/g, "/\n") + "<\/template>');\n";
	return "";
}).replace(regStyle, function (t, h) {
	appendJs += "Vue.appendCSS('" + h.replace(/'/g, "\\'").replace(/\n/g, "/\n") + "');"
	return "";
}).replace(regJs, function (t, h) {
	res = "define(function () {require('VueCommon');" + appendJs + h + "; return export;});"
	return ;
})

console.log(res);

