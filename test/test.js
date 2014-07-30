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
/*
db.view.one('search', 'email', 'petersirka@gmail.com', function(err, doc) {
	console.log(doc);
});

*/
/*
db.get_alive('_changes', 'GET', '', { feed: 'continuous', since: '3' }, function(data, res) {
    console.log(data);
    console.log('');
    console.log('--------------------------------------------------------');
    console.log('');
});

setTimeout(function() {
    db.insert({ type: 'delete' });
}, 5000);
*/

db.changes({ 'feed': 'continuous' }, function(err, data, end) {
    console.log(JSON.stringify(data));
    setTimeout(function() {
        end();
    }, 300);
});