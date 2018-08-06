// PostgresSQL 모듈 사용
var pgp = require('pg-promise')({});

var database = {};

database.init = function(app, config) {
    console.log('init() 호출 됨');
    connect(app, config);
}

function connect(app, config) {
	console.log('connect() 호출됨.')
    
    database = pgp(config.db_url);
    
    // db 객체를 속성으로 설정
    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가됨.');
}

module.exports = database;