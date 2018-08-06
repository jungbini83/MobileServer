var login = function(req, res) {
    console.log('/process/login 호출됨.');
    
    // database 속성 불러오기
    var db = req.app.get("database");

    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
    
    // 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (db) {
		authUser(db, paramId, paramPassword, function(err, docs) {
			if (err) {throw err;}
			
            // 조회된 레코드가 있으면 성공 응답 전송
			if (docs) {
				console.dir(docs);

                // 조회 결과에서 사용자 이름 확인
				var username = docs[0].name;
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인 성공</h1>');
				res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
				res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
				res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
				res.end();
			
			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인  실패</h1>');
				res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
				res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}	
};

var adduser = function(req, res) {
    console.log('/process/adduser 호출됨');
    
    // database 속성 불러오기
    var db = req.app.get("database");
    
    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    var paramAge = req.body.age || req.query.age;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramAge);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 인증
	if (db) {
        addUser(db, paramId, paramPassword, paramName, paramAge, function(err, result) {
            if (err) { throw err;}
            
            // 결과 객체 확인하여 추가된 데이터가 있으면 성공 응답 전송
            if(result) {
                console.dir(result);
                
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else {    // 객체 결과가 없으면 실패 응답 전송
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}	
};

var listuser = function(req, res) {
    console.log('/process/listuser 모듈 호출함');
    
    // database 속성 불러오기
    var db = req.app.get("database");
    
    if (db) {
        // 1. 모든 사용자 검색
        listUser(db, function(err, result) {
            
            // 오류 발생 시 클라이언트로 오류 전송
            if(err) {
                console.error('사용자 리스트 조회 중 오류 발생: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                
                return;
            }
            
            // 결과 객체가 있으면 리스트 전송
            if(result) {
                console.dir(result);
                
                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write(JSON.stringify(result));
                res.end();
                
            } else {        // 결과 객체가 없으면 실패 응답 전송
                res.writeHead('200', {'Content-type': 'text/html;charset=utf8'});
                res.write('<h2>사용자 리스트 조회 실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패<h2>');
        res.end();
    }
};

var createtable = function(req, res) {
    console.log('/process/createtable 호출함');
    
    // database 속성 불러오기
    var db = req.app.get('database');
    
    if (db) {
        createTable(db, function(err, result) {
            if(err) {
                console.error('테이블 생성 중 오류 발생: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>테이블 생성 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                
                return;
            }
            
            if(result) {
                // console.dir(result);
                console.log('테이블 생성 성공.')
                
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>테이블 생성 성공</h2>');
                res.end();
                
            } else {    // 객체 결과가 없으면 실패 응답 전송
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>테이블 생성 실패</h2>');
                res.end();
            }
        });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}	
};

// 사용자를 인증하는 함수
var authUser = function(db, id, password, callback) {
    console.log('authUser 호출됨.');
    
    // user 테이블 참조    
    db.any('SELECT * from users where id = $1 and password = $2', [id, password])
        .then(function (docs) {
            if(docs.length > 0) {
                console.log('아이디 [%s], 비밀번호[%s]가 일치하는 사용자 찾음', id, password);
                callback(null, docs);
            } else {
                console.log("일치하는 사용자를 찾지 못함.");
                callback(null, null);
            }
        })
        .catch(function(err) {
            callback(err, null);
            return;    
        });
}

var addUser = function(db, id, password, name, age, callback) {
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name + ', ' + age);
    
    // users 테이블 참조
    db.one('INSERT into public.users(id, password, name, age) values($1, $2, $3, $4) returning id', [id, password, name, age])
        .then(data => {
            if (data.id) {
                console.log('다음 사용자가 추가됨 : ' + data.id);
            } else {
                console.log('추가된 레코드가 없음.');
            }
            
            callback(null, data.id);
        })
        .catch(err => {
            callback(null, null);
            return;
        });
}

var listUser = function(db, callback) {
    console.log('listUser 호출됨');
    
    db.any('SELECT * from users')
        .then(function(data) {
            if(data.length > 0) {
                console.log('사용자 리스트 조회 성공: ' + data.length + '명' );
                callback(null, data);
            } else {
                console.log('사용자 리스트 조회 실패: ')
                callback(null, null);
            }
        })
        .catch(function(err) {
            callback(err, null);
            return;
        });
}

// 사용자 데이터베이스 테이블 생성
var createTable = function (db, callback) {
    console.log('createTable 호출됨');
    
    db.none("CREATE TABLE public.users (id character varying NOT NULL, password character varying NOT NULL, name character varying NOT NULL DEFAULT '', age integer NOT NULL DEFAULT -1, created_at timestamp with time zone DEFAULT Now(), updated_at timestamp with time zone DEFAULT Now(), PRIMARY KEY (id))")
        .then(function(data) {
            if(data) {
                console.log('테이블 생성 성공');
                callback(null, 'success');
            } else {
                console.log('테이블 생성 실패');
                callback(null, null);
            }
        })
        .catch(function(err) {
            callback(err, null);
            return;
        });
}

// 디바이스 정보 데이터베이스 테이블 생성
//CREATE TABLE public.device
//(
//    mobile character varying NOT NULL DEFAULT '',
//    "osVersion" character varying NOT NULL DEFAULT '',
//    model character varying NOT NULL DEFAULT '',
//    display character varying NOT NULL DEFAULT '',
//    manufacturer character varying NOT NULL DEFAULT '',
//    "macAddress" character varying NOT NULL DEFAULT '',
//    "registrationId" character varying NOT NULL DEFAULT '',
//    created_at timestamp with time zone NOT NULL DEFAULT Now(),
//    updated_at timestamp with time zone NOT NULL DEFAULT Now(),
//    PRIMARY KEY (mobile)
//)

module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;
module.exports.createtable = createtable;