const path = require('path');
const url = require('url');
const fs = require('fs');
const protocolMap = {
    'http:': 1,
    'https:': 1
};
const bookSpacePath = __dirname + '/bookSpace/';
const dbFilePath = bookSpacePath + '/bookdb.json';
const localFilePath = bookSpacePath + '/files';
const localhtmlPath = bookSpacePath + '/html';

var mkdirsSync = function (dirTab) { 
	if (!fs.existsSync(localhtmlPath + '/' + dirTab.join('/') + '/')) {
		var pathtmp = localhtmlPath;
		dirTab.forEach(function(dirname) {
			pathtmp += "/" + dirname;
			if (!fs.existsSync(pathtmp)) {
				fs.mkdirSync(pathtmp)
			}	
		});
	}
};

var url2File = function (u) {
    var urlObject = url.parse(u);
    if (!protocolMap[urlObject.protocol]) return false;
	
    var pathname = urlObject.pathname;
    if (pathname == '') {
        pathname += '/index.html';  
	} else if (pathname[pathname.length-1] == '/') {
		pathname += 'index.html';
	}
	var t = (urlObject.hostname + pathname).split('/');
	t.length--;
	mkdirsSync(t);
    return localhtmlPath + '/' + urlObject.hostname + pathname;
};

module.exports = {
	shouldUseLocalResponse : function(req, reqBody){
		var path = url2File(req.url);
		console.log('shouldUseLocalResponse', path)
		if (fs.existsSync(path)) {
			console.log(true);
			return true;
		}
        return false;
	},
	dealLocalResponse : function(req, reqBody, callback){
		var path = url2File(req.url);
		console.log('dealLocalResponse', path)
        callback(200, {} ,fs.readFileSync(path))
	},
	replaceRequestOption : function(req, option){
	    var newOption = option;
	    delete newOption.headers['if-none-match'];
	    delete newOption.headers['if-modified-since'];
	    return newOption;
	},
    replaceResponseHeader: function(req, res, header){
        header = header || {};
        header["Cache-Control"]                    = "no-cache, no-store, must-revalidate";
        header["Pragma"]                           = "no-cache";
        header["Expires"]                          = 0;
        return header;
    },
	delServerResData: function(req, res){
		var path = url2File(req.url);
		var writable = fs.createWriteStream(path);
		res.pipe(writable);
    }
};