var fcm = require('node-gcm');
var config = require('../config');
var request = require('request');

var adddevice = function(req, res) {
    console.log('device 모듈 안에 있는 adddevice 호출됨.');
    
    var database = req.app.get('database');
    
    console.log("데이터베이스 변수 가져오기 성공");
    
    var paramUserId     = req.body.userId || req.query.userId;
    var paramProjId     = req.body.projId || req.query.projId;
    var paramInstId     = req.body.instId || req.query.instId;
    var paramRegId      = req.body.regId || req.query.regId;
    
    console.log('요청 파라미터 : ' + paramUserId + ', ' + paramProjId + ', ' + paramInstId + ', ' + paramRegId);
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        
        // 관련 정보가 이미 있는지 검색
        database.any('SELECT user_id from public.push_registry where user_id = $1 and proj_id = $2 and inst_id = $3', [paramUserId, paramProjId, paramInstId])
        .then(data => {
            if (data.length > 0) {
                console.log('이미 사용자 정보가 존재합니다 : ' + data);
                
                res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                res.write("{code: '200', 'message':'이미 사용자가 존재합니다.'}");
                res.end();
            } else {
                // Device 정보 저장
                database.one('INSERT into public.push_registry(user_id, proj_id, inst_id, registration_id) values($1, $2, $3, $4) returning user_id', 
                     [paramUserId, paramProjId, paramInstId, paramRegId])
                .then(data => {
                    if (data.user_id) {
                        console.log('다음 단말 데이터 추가함 : ' + data.user_id);

                        res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                        res.write("{code: '200', 'message':'push token 추가 성공'}");
                        res.end();
                    } else {
                        console.log('추가된 단말 데이터가 없음.');

                        res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                        res.write("{code: '200', 'message':'push token 추가 실패'}");
                        res.end();
                    }
                })
                .catch(err => {
                    console.error('단말 정보 추가 중 오류 발생 : ' + err.stack);

                    res.writeHead('500', {'Content-Type': 'application/json;charset=utf8'});
                    res.write("{code: '500', 'message':'단말 데이터 추가 중 오류 발생'}");
                    res.write('<p>' + err.stack + '</p>');
                    res.end();
                });
            }
        })
        .catch(err => {
            console.error('단말 정보 추가 중 오류 발생 : ' + err.stack);

            res.writeHead('500', {'Content-Type': 'application/json;charset=utf8'});
            res.write("{code: '500', 'message':'단말 데이터 추가 중 오류 발생'}");
            res.write('<p>' + err.stack + '</p>');
            res.end();
        });
        
        
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        
        console.error('Database가 초기화되지 않았습니다.');
        
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}	
}

var listdevice = function(req, res) {
    console.log('device 모듈 안에 있는 listdevice 호출됨.');
    
    var database = req.app.get('database');
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        
        // 1. 모든 단말 검색
        database.any('SELECT * from push_registry')
            .then(function(data) {
                if(data.length > 0) {
                    console.dir(data);
                    
                    var context = {
                        title: '푸시 서비스에 등록된 사용자 리스트',
                        devices: data
                    };
                    
                    req.app.render('listdevice', context, function(err, html) {
                        if(err) {
                            console.error(err.stack);
                        }
                        
                        res.end(html);
                    });
                }
            })
            .catch(function(err) {
                console.error('사용자 조회 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            });
    }
}

var sendall = function(req, res) {
    console.log('device 모듈 안에 있는 sendall 호출됨.');
        
    var database = req.app.get('database');
        
    var paramData = req.body.data || req.query.data;
    
    var apikey = 'key=' + config.fcm_api_key;
    
    console.log('요청 파라미터 : ' + paramData);
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        // 1. 모든 단말 검색
        database.any('SELECT * from push_registry')
            .then(function(data) {
                if(data.length > 0) {
                    console.dir(data);    
                    
                    var message = { title : "emoodchart" , content : paramData }
                    
                    var regIds = [];
                    for(var i = 0 ; i < data.length ; i++) {
                        var curId = data[i].registration_id;
                        console.log('등록 ID #' + i + ' : ' + regIds.length);
                        regIds.push(curId);
                    }
                    console.log('전송 대상 단말 수 : ' + regIds.length);
                    
                    request({
                        url : 'https://fcm.googleapis.com/fcm/send',
                        method : 'POST',
                        headers : {
                            'Content-Type' : ' application/json',
                            'Authorization' : apikey
                        },
                        body : JSON.stringify({                            
                            "data" : {
                                // "message" : message
                                "content": paramData
                            },
                            "notification" : {
                                "title": "emoodchart",
                                "body": paramData,                                    
                                "sound": "default"
                            },
                            "android":{
                               "notification":{
                                  "body":"emoodchart",
                                  "title": paramData,
                                  "sound":"default"
                               }
                            },    
                            "to" : "/topics/notice"                                
                        })
                    }, function(error, response, body) {
                        if (error) {
                            console.error(error, response, body);
                        } else if (response.statusCode >= 400) {
                            console.error('HTTP Error: ' + response.statusCode + ' - '
                                                + response.statusMessage + '\n' + body);
                        } else {
                            console.dir(body);
                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>푸시 메시지 전송 성공</h2>');
                            res.end();
                        }
                    });                    
                }
            })
            .catch(function(err) {
                console.error('단말 리스트 조회 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>단말 리스트 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            });
    }
}

module.exports.adddevice = adddevice;
module.exports.listdevice = listdevice;
module.exports.sendall = sendall;
