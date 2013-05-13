// Copyright Peter Širka, Web Site Design s.r.o. (www.petersirka.sk)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var urlParser = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var notvalid = 'Document hasn\'t id or _rev attribute.';

/*
	CouchDB class
	@connectionString {String} :: url address
*/
function CouchDB(connectionString) {
	if (connectionString[connectionString.length - 1] !== '/')
		connectionString += '/';

	this.uri = urlParser.parse(connectionString);
};

// ======================================================
// FUNCTIONS
// ======================================================

/*
	Check if string is JSON object
	@value {String}
	return {Object}
*/
function parseJSON(value) {
	if (isJSON(value))
		return JSON.parse(value);
	return {};
};

function isJSON(value) {
	if (value.length === 1)
		return false;
	var a = value[0];
	var b = value[value.length - 1];
	return (a === '"' && b === '"') || (a === '[' && b === ']') || (a === '{' && b === '}');
};

function getID(doc) {

	if (typeof(doc) === 'string')
		return doc;

	if (typeof(doc._id) !== 'undefined') 
		return doc._id;

	if (doc.id !== 'undefined')
		return doc.id;

	return null;
}

function getREV(doc) {

	if (typeof(doc) === 'string')
		return doc;

	if (typeof(doc._rev) !== 'undefined') 
		return doc._rev;

	if (doc.rev !== 'undefined')
		return doc.rev;

	return null;
}

/*
	Object to URL params
	@obj {Object}
	return {String}
*/
function toParams(obj) {

	if (typeof(obj) === 'undefined' || obj === null)
		return '';

	var buffer = [];
	var arr = Object.keys(obj);

	if (typeof(obj.group) !== 'undefined')
		obj.reduce = obj.group;

	if (typeof(obj.reduce) === 'undefined')
		obj.reduce = false;
	
	arr.forEach(function(o) {

		var value = obj[o];
		var name = o.toLowerCase();

		switch (name) {
			case 'skip':
			case 'limit':
			case 'descending':
			case 'reduce':
			case 'group':
			case 'stale':
				buffer.push(name + '=' + value.toString().toLowerCase());
				break;
			case 'group_level':
			case 'grouplevel':
				buffer.push('group_level=' + value);
				break;
			case 'update_seq':
			case 'updateseq':
				buffer.push('update_seq=' + value.toString().toLowerCase());
				break;
			case 'include_docs':
			case 'includedocs':
				buffer.push('include_docs=' + value.toString().toLowerCase());
				break;
			case 'inclusive_end':
			case 'inclusiveend':
				buffer.push('inclusive_end=' + value.toString().toLowerCase());
				break;
			case 'key':
			case 'keys':
			case 'startkey':
			case 'endkey':
				buffer.push(name + '=' + encodeURIComponent(JSON.stringify(value)));
				break;
			default:
				buffer.push(name + '=' + encodeURIComponent(value));
				break;
		};
	});

	return '?' + buffer.join('&');
};

// ======================================================
// PROTOTYPES
// ======================================================

/*
	Internal function
	@path {String}
	@method {String}
	@data {String or Object or Array}
	@params {Object}
	@callback {Function} :: function(error, object)
	return {self}
*/
CouchDB.prototype.connect = function(path, method, data, params, callback) {

	var self = this;

	if (path[0] === '/')
		path = path.substring(1);

	var uri = self.uri;
	var type = typeof(data);
	var isObject = type === 'object' || type === 'array';

	var headers = {};

	headers['Content-Type'] = isObject ? 'application/json' : 'text/plain';

	var location = '';

	if (path[0] === '#')
		location = path.substring(1);
	else
		location = uri.pathname + path;

	var options = { protocol: uri.protocol, auth: uri.auth, method: method || 'GET', hostname: uri.hostname, port: uri.port, path: location + toParams(params), agent:false, headers: headers };

	var response = function (res) {
		var buffer = '';

		res.on('data', function(chunk) {
			buffer += chunk.toString('utf8');
		})

		req.setTimeout(exports.timeout, function() {
			callback(new Error('timeout'), null);
		});

		res.on('end', function() {
			var data = parseJSON(buffer.trim());
			var error = null;

			if (res.statusCode >= 400) {
				error = new Error(res.statusCode + ' (' + (data.error || '') + ') ' + (data.reason || ''));
				data = null;
			}

			callback(error, data);
			data  = null;
			res = null;
			req = null;
		});
	};

	var con = options.protocol === 'https:' ? https : http;
	var req = callback ? con.request(options, response) : con.request(options);

	req.on('error', function(err) {
		callback(err, null);
	});

	if (isObject)
		req.end(JSON.stringify(data));
	else
		req.end();

	return self;
};

/*
	CouchDB command
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.compactDatabase = function(cb) {
	return this.connect('_compact', 'POST', null, null, cb);
};

/*
	CouchDB command
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.compactViews = function(cb) {
	return this.connect('_compact/views', 'POST', null, null, cb);
};

/*
	CouchDB command
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.cleanupViews = function(cb) {
	return this.connect('_view_cleanup', 'POST', null, null, cb);
};	

/*
	CouchDB command
	@namespace {String}
	@name {String}
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.view = function(namespace, name, params, cb) {
	return this.connect('_design/' + namespace + '/_view/' + name, 'GET', null, params, cb);
};

/*
	CouchDB command
	@namespace {String}
	@name {String}
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.list = function(namespace, name, params, cb) {
	return this.connect('_design/' + namespace + '/_list/' + name, 'GET', null, params, cb);
};

/*
	CouchDB command
	@namespace {String}
	@name {String}
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.show = function(namespace, name, params, cb) {
	return this.connect('_design/' + namespace + '/_show/' + name, 'GET', null, params, cb);
};

/*
	CouchDB command
	@id {String}
	@revs {String} :: optional
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.find = function(id, revs, cb) {

	if (typeof(revs) === 'function') {
		cb = revs;
		revs = false;
	}

	return this.connect(id, 'GET', null, { revs_info: revs }, cb);
};

/*
	CouchDB command
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.all = function(params, cb) {
	return this.connect('_all_docs', 'GET', null, params, cb);
};

/*
	CouchDB command
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.documents = function(params, cb) {
	return this.all(params, cb);
};

/*
	CouchDB command
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.changes = function(params, cb) {
	return this.connect('_changes', 'GET', null, params, cb);
};

/*
	CouchDB command
	@funcMap {Function}
	@funcMfuncReduceap {Function}
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.query = function(funcMap, funcReduce, params, cb) {

	var obj = {
		language: 'javascript',
		map: funcMap.toString()
	};

	if (typeof(cb) === 'undefined') {
		cb = params;
		params = funcReduce;
		funcReduce = null;
	};

	if (funcReduce !== null)
		obj.reduce = funcReduce.toString();

	return this.connect('_temp_view', 'POST', obj, params, cb);
};

/*
	CouchDB command
	@doc {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.insert = function(doc, cb) {
	return this.connect('', 'POST', doc, null, cb);
};

/*
	CouchDB command
	@doc {Object}
	@cb {Function} :: function(error, object)
	@auto {Boolean} :: optional, default true - auto append revision
	return {CouchDB}
*/
CouchDB.prototype.update = function(doc, cb, auto) {

	var id = getID(doc);

	if (!id && cb) {
		cb(new Error(notvalid), null);
		return this;
	}

	if (auto || true)
		delete doc._rev;

	return this.connect(id, 'PUT', doc, null, cb);
};

/*
	CouchDB command
	@namespace {String}
	@view {Object} :: example { price: { map: 'function...', reduct: 'function..' }}
	@cb {Function} :: function(error, object)
	@rev {String} :: optional, for updating view
	return {CouchDB}
*/
CouchDB.prototype.insertView = function(namespace, view, cb) {

	var doc = {
		_id: '_design/' + namespace,
		language: 'javascript',
		views: view
	};

	this.connect('_design/' + namespace, 'PUT', doc, null, cb);
};

/*
	CouchDB command
	@rev {String} :: optional, for updating view
	@namespace {String}
	@view {Object} :: example { price: { map: 'function...', reduct: 'function..' }}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.updateView = function(rev, namespace, view, cb) {

	var doc = {
		_id: '_design/' + namespace,
		_rev: rev,
		language: 'javascript',
		views: view
	};

	this.connect('_design/' + namespace, 'PUT', doc, null, cb);
};

/*
	CouchDB command
	@path {String}
	@method {String}
	@obj {Object}
	@params {Object}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.request = function(path, method, obj, params, cb) {
	if (path[0] === '/')
		path = path.substring(1);
	
	return this.connect(path, method, obj, params, cb);
};

/*
	CouchDB command
	@doc {Object or String}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.delete = function(doc, cb) {
	var id = getID(doc);

	if (!id && cb) {
		cb(new Error(notvalid), null);
		return this;
	}

	return this.connect(id, 'DELETE', doc, null, cb);
};

/*
	CouchDB command
	@doc {Object}
	@fileName {String}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.deleteAttachment = function(doc, fileName, cb) {

	var id = getID(doc);
	var rev = getREV(doc);

	if (!id || !rev) {
		cb && cb(new Error(notvalid), null);
		return this;
	}

	return this.connect(doc._id + '/' + fileName, 'DELETE', null, { rev: doc._rev }, cb);
};

/*
	CouchDB command
	@arr {Object array}
	@cb {Function} :: function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.bulk = function(arr, cb) {
	return this.connect('_bulk_docs', 'POST', { docs: arr }, null, cb);
};

/*
	CouchDB command
	@docOrId {String or Object}
	@fileName {String}
	@response {Function or ServerResponse} :: function(data)
	return {CouchDB}
*/
CouchDB.prototype.attachment = function(docOrId, fileName, response) {

	var self = this;
	var uri = self.uri;
	var id = getID(docOrId);
	var options = { protocol: uri.protocol, auth: uri.auth, hostname: uri.hostname, port: uri.port, path: location = uri.pathname + id + '/' + fileName, agent:false };

    http.get(options, function(res) {
		res.setEncoding('binary');
        var data = '';

        res.on('data', function(chunk){
            data += chunk.toString();
        });
        
        res.on('end', function() {
        	
        	if (typeof(response) !== 'function') {
    	    	response.success = true;
				response.writeHead(200, { 'Content-Type': res.headers['content-type'] });
				response.end(data, 'binary');
				response = null;
			} else
        		response(new Buffer(data, 'binary'));

			data = null;
        });
    });

    return self;
};

/*
	CouchDB command
	@doc {Object} :: object with _id and _rev
	@fileName {String}
	@fileSave {String}
	@cb {Function} :: optional function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.upload = function(doc, fileName, fileSave, cb) {

	var id = getID(doc);
	var rev = getREV(doc);

	if (!id || !rev) {
		cb && cb(new Error(notvalid), null);
		return this;
	}

	var self = this;
	var uri = self.uri;
	var name = path.basename(fileSave);
	var extension = path.extname(fileName);
	var headers = {};

	headers['Cache-Control'] = 'max-age=0';
	headers['Content-Type'] = getContentType(extension);
	headers['Host'] = uri.host;
	headers['Referer'] = uri.protocol + '//' + uri.host + uri.pathname + id;

	var options = { protocol: uri.protocol, auth: uri.auth, method: 'PUT', hostname: uri.hostname, port: uri.port, path: location = uri.pathname + id + '/' + name + '?rev=' + rev, agent:false, headers: headers };

	var response = function (res) {
		var buffer = [];

		res.on('data', function(chunk) {
			buffer.push(chunk.toString('utf8'));
		})

		res.on('end', function() {
			var data = parseJSON(buffer.join('').trim());
			var error = null;

			if (res.statusCode >= 400) {
				error = new Error(res.statusCode + ' (' + (data.error || '') + ') ' + (data.reason || ''));
				data = null;
			}

			cb(error, data);
		});
	};

	var req = cb ? http.request(options, response) : http.request(options);
	fs.createReadStream(fileName).pipe(req);

	return self;
};

/*
	CouchDB command
	@max {Number}
	@cb {Function} :: optional function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.uuids = function(max, cb) {
	
	if (typeof(max) === 'function') {
		cb = max;
		max = 10;
	}

	return this.connect('#/_uuids?count=' + (max || 10), 'GET', null, null, cb);
};

/*
	@ext {String}
	return {String}
*/
function getContentType(ext) {
	
	if (ext[0] === '.')
		ext = ext.substring(1);

	var extension = {
		'ai': 'application/postscript',
		'aif': 'audio/x-aiff',
		'aifc': 'audio/x-aiff',
		'aiff': 'audio/x-aiff',
		'asc': 'text/plain',
		'atom': 'application/atom+xml',
		'au': 'audio/basic',
		'avi': 'video/x-msvideo',
		'bcpio': 'application/x-bcpio',
		'bin': 'application/octet-stream',
		'bmp': 'image/bmp',
		'cdf': 'application/x-netcdf',
		'cgm': 'image/cgm',
		'class': 'application/octet-stream',
		'cpio': 'application/x-cpio',
		'cpt': 'application/mac-compactpro',
		'csh': 'application/x-csh',
		'css': 'text/css',
		'dcr': 'application/x-director',
		'dif': 'video/x-dv',
		'dir': 'application/x-director',
		'djv': 'image/vnd.djvu',
		'djvu': 'image/vnd.djvu',
		'dll': 'application/octet-stream',
		'dmg': 'application/octet-stream',
		'dms': 'application/octet-stream',
		'doc': 'application/msword',
		'dtd': 'application/xml-dtd',
		'dv': 'video/x-dv',
		'dvi': 'application/x-dvi',
		'dxr': 'application/x-director',
		'eps': 'application/postscript',
		'etx': 'text/x-setext',
		'exe': 'application/octet-stream',
		'ez': 'application/andrew-inset',
		'gif': 'image/gif',
		'gram': 'application/srgs',
		'grxml': 'application/srgs+xml',
		'gtar': 'application/x-gtar',
		'hdf': 'application/x-hdf',
		'hqx': 'application/mac-binhex40',
		'htm': 'text/html',
		'html': 'text/html',
		'ice': 'x-conference/x-cooltalk',
		'ico': 'image/x-icon',
		'ics': 'text/calendar',
		'ief': 'image/ief',
		'ifb': 'text/calendar',
		'iges': 'model/iges',
		'igs': 'model/iges',
		'jnlp': 'application/x-java-jnlp-file',
		'jp2': 'image/jp2',
		'jpe': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'jpg': 'image/jpeg',
		'js': 'application/x-javascript',
		'kar': 'audio/midi',
		'latex': 'application/x-latex',
		'lha': 'application/octet-stream',
		'lzh': 'application/octet-stream',
		'm3u': 'audio/x-mpegurl',
		'm4a': 'audio/mp4a-latm',
		'm4b': 'audio/mp4a-latm',
		'm4p': 'audio/mp4a-latm',
		'm4u': 'video/vnd.mpegurl',
		'm4v': 'video/x-m4v',
		'mac': 'image/x-macpaint',
		'man': 'application/x-troff-man',
		'mathml': 'application/mathml+xml',
		'me': 'application/x-troff-me',
		'mesh': 'model/mesh',
		'mid': 'audio/midi',
		'midi': 'audio/midi',
		'mif': 'application/vnd.mif',
		'mov': 'video/quicktime',
		'movie': 'video/x-sgi-movie',
		'mp2': 'audio/mpeg',
		'mp3': 'audio/mpeg',
		'mp4': 'video/mp4',
		'mpe': 'video/mpeg',
		'mpeg': 'video/mpeg',
		'mpg': 'video/mpeg',
		'mpga': 'audio/mpeg',
		'ms': 'application/x-troff-ms',
		'msh': 'model/mesh',
		'mv4': 'video/mv4',
		'mxu': 'video/vnd.mpegurl',
		'nc': 'application/x-netcdf',
		'oda': 'application/oda',
		'ogg': 'application/ogg',
		'pbm': 'image/x-portable-bitmap',
		'pct': 'image/pict',
		'pdb': 'chemical/x-pdb',
		'pdf': 'application/pdf',
		'pgm': 'image/x-portable-graymap',
		'pgn': 'application/x-chess-pgn',
		'pic': 'image/pict',
		'pict': 'image/pict',
		'png': 'image/png',
		'pnm': 'image/x-portable-anymap',
		'pnt': 'image/x-macpaint',
		'pntg': 'image/x-macpaint',
		'ppm': 'image/x-portable-pixmap',
		'ppt': 'application/vnd.ms-powerpoint',
		'ps': 'application/postscript',
		'qt': 'video/quicktime',
		'qti': 'image/x-quicktime',
		'qtif': 'image/x-quicktime',
		'ra': 'audio/x-pn-realaudio',
		'ram': 'audio/x-pn-realaudio',
		'ras': 'image/x-cmu-raster',
		'rdf': 'application/rdf+xml',
		'rgb': 'image/x-rgb',
		'rm': 'application/vnd.rn-realmedia',
		'roff': 'application/x-troff',
		'rtf': 'text/rtf',
		'rtx': 'text/richtext',
		'sgm': 'text/sgml',
		'sgml': 'text/sgml',
		'sh': 'application/x-sh',
		'shar': 'application/x-shar',
		'silo': 'model/mesh',
		'sit': 'application/x-stuffit',
		'skd': 'application/x-koan',
		'skm': 'application/x-koan',
		'skp': 'application/x-koan',
		'skt': 'application/x-koan',
		'smi': 'application/smil',
		'smil': 'application/smil',
		'snd': 'audio/basic',
		'so': 'application/octet-stream',
		'spl': 'application/x-futuresplash',
		'src': 'application/x-wais-source',
		'sv4cpio': 'application/x-sv4cpio',
		'sv4crc': 'application/x-sv4crc',
		'svg': 'image/svg+xml',
		'swf': 'application/x-shockwave-flash',
		't': 'application/x-troff',
		'tar': 'application/x-tar',
		'tcl': 'application/x-tcl',
		'tex': 'application/x-tex',
		'texi': 'application/x-texinfo',
		'texinfo': 'application/x-texinfo',
		'tif': 'image/tiff',
		'tiff': 'image/tiff',
		'tr': 'application/x-troff',
		'tsv': 'text/tab-separated-values',
		'txt': 'text/plain',
		'ustar': 'application/x-ustar',
		'vcd': 'application/x-cdlink',
		'vrml': 'model/vrml',
		'vxml': 'application/voicexml+xml',
		'wav': 'audio/x-wav',
		'wbmp': 'image/vnd.wap.wbmp',
		'wbmxl': 'application/vnd.wap.wbxml',
		'wml': 'text/vnd.wap.wml',
		'wmlc': 'application/vnd.wap.wmlc',
		'woff': 'font/woff',
		'wmls': 'text/vnd.wap.wmlscript',
		'wmlsc': 'application/vnd.wap.wmlscriptc',
		'wrl': 'model/vrml',
		'xbm': 'image/x-xbitmap',
		'xht': 'application/xhtml+xml',
		'xhtml': 'application/xhtml+xml',
		'xls': 'application/vnd.ms-excel',
		'xml': 'application/xml',
		'xpm': 'image/x-xpixmap',
		'xsl': 'application/xml',
		'xslt': 'application/xslt+xml',
		'xul': 'application/vnd.mozilla.xul+xml',
		'xwd': 'image/x-xwindowdump',
		'xyz': 'chemical/x-xyz',
		'zip': 'application/zip'
	};

	return extension[ext.toLowerCase()] || 'application/octet-stream';
};

// ======================================================
// EXPORTS
// ======================================================

exports.timeout = 10000;
exports.CouchDB = CouchDB;

/*
	CouchDB class
	@connectionString {String} :: url address
*/
exports.init = function(connectionString) {
	return new CouchDB(connectionString);
};

exports.load = function(connectionString) {
	return new CouchDB(connectionString);
};

