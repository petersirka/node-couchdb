var db = require('../index').init('http://petersirka:123456@127.0.0.1:5984/eshop/');

/*
db.all({ limit: 11 }, function(err, docs) {
	console.log(docs);
});
*/
/*
db.find('jeans-11df25bbf84f', function(err, doc) {
	console.log(doc);
	db.upload(doc, '/users/petersirka/desktop/function.jpg', 'skuska.jpg', function(err, data) {
		console.log(data);
	});
});
*/


/*
db.uuids(10, function(err, data) {
	console.log(data);
});
*/
/*
db.query('function(doc){ emit(doc.id, doc); }', { limit: 11 }, function(err, docs) {
	console.log(err, docs);	
});
*/

/*
db.insert({ type: 'test' }, function(error, data) {
	console.log(data);
});*/
