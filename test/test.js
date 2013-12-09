var db = require('../index').init('http://petersirka:123456@127.0.0.1:5984/db_to_users/');

/*
db.all({ limit: 11 }, function(err, docs) {
	console.log(docs);
});
*/
/*
db.one('5e50afd957235844c094552cd30043dc', function(err, doc) {
	console.log(doc);
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

db.view.one('search', 'email', 'petersirka@gmail.com', function(err, doc) {
	console.log(doc);
});