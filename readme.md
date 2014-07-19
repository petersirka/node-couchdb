Simple node CouchDB client - Coucher
====================================

- Best use with [www.totaljs.com](http://www.totaljs.com)
- Easy use with [Iris Couch](http://www.iriscouch.com) or [Couch Happy](https://www.couchappy.com/)

***

## NPM coucher

- create on your desktop empty directory with name: website
- open terminal and find this directory: cd /Desktop/website/
- write and run on terminal:

```text
$ npm install coucher
```

## Methods

```js
/*
    Constructor
    @connectionString {String} :: url address (http://petersirka:123456@127.0.0.1:5984/yourdatabase/)
*/
CouchDB(connectionString);

/*
    Usage / Constructor
    @connectionString {String} :: url address
    return {CouchDB};
*/
var couchdb = require('coucher').init('http://petersirka:123456@127.0.0.1:5984/eshop/');

// or

var couchdb = require('coucher').load('http://petersirka:123456@127.0.0.1:5984/eshop/');

/*
	Compact database
    @fnCallback {Function} :: function(error, object) {}
    return {CouchDB}
*/
couchdb.compact([fnCallback]);

/*
	Get a document
    @id {String}
    @revs {String} :: optional, default false
    @fnCallback {Function} :: function(error, doc) {}
    return {CouchDB}
*/
CouchDB.one(id, revs, fnCallback);

/*
	Get all documents
    @params {Object} :: optioanl
    @fnCallback {Function} :: function(error, rows, total, offset) {}
	@without {String Array} :: optional, without properties
    return {CouchDB}
*/
couchdb.all([params], fnCallback, [without]);
couchdb.changes([params], fnCallback, [without]);

// PARAMS?
// http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
couchdb.all({ limit: 11 }, function(err, rows, total, offset) {});

/*
	Insert a document
	@doc {Object}
	@fnCallback {Function} :: optional, function(error, doc)
	return {CouchDB}
*/
couchdb.insert(doc, [fnCallback]);

/*
	Update a document
	@doc {Object}
	@fnCallback {Function} :: optional, function(error, object)
	return {CouchDB}
*/
couchdb.update(doc, [fnCallback]);

/*
	Remove a document
	@doc {Object or String} :: doc or document ID
	@fnCallback {Function} :: function(error, object)
	return {CouchDB}
*/
couchdb.remove(doc, [fnCallback]);

/*
	Bulk instert documents
	@arr {Object array}
	@fnCallback {Function} :: optional, function(error, rows, total, offset)
	return {CouchDB}
*/
couchdb.bulk(arr, [fnCallback]);

/*
    CouchDB command
    @max {Number}
    @cb {Function} :: optional function(error, object)
    return {CouchDB}
*/
couchdb.uuids(max, cb);

/*
	Read all documents from view
	@namespace {String}
	@name {String}
	@params {Object} :: optional
	@fnCallback {Function} :: function(error, array, total, offset) {}
	@without {String Array} :: optional, without properties
	return {CouchDB}
*/
couchdb.view.all(namespace, name, [params], fnCallback, [without])

/*
	Read one document from view
	@namespace {String}
	@name {String}
	@key {String or Object}
	@fnCallback {Function} :: function(error, array, total, offset) {}
	@without {String Array} :: optional, without properties
	@includeDocs {Boolean} :: optional, default false
	return {CouchDB}
*/
couchdb.view.one(namespace, name, key, fnCallback, [without], [includeDocs]);

/*
	Compact views
	[fnCallback] {Function} :: optional
	return {CouchDB}
*/
couchdb.view.compact([fnCallback]);

/*
	Cleanup views
	[fnCallback] {Function} :: optional
	return {CouchDB}
*/
couchdb.view.cleanup([fnCallback]);

 /*
	CouchDB command
	@doc {Object} :: object with properties: _id and _rev
	@filename {String}
	@filesave {String} :: optional
	@fnCallback {Function} :: optional function(error, object)
	return {CouchDB}
*/
couchdb.attachment.insert(doc, filename, [filesave], [fnCallback]);

/*
	Remove an attachment from document
	@doc {Object} :: valid CouchDB document with _id and _rev
	@filename {String}
	@fnCallback {Function} :: optional
*/
couchdb.attachment.remove(doc, filename, fnCallback);

/*
	Download ant attachment
	@doc {Object or String} :: doc or document ID
	@filename {String}
	@response {HttpResponse or Function} :: if function(res, contentType)
	return {CouchDB}
*/
couchdb.attachment.download(doc, filename, response);

```

***

## The MIT License

Copyright (c) 2012-2013 Peter Širka <petersirka@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contact

[www.petersirka.sk](http://www.petersirka.sk)
