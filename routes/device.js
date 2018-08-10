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
    
    console.log('요청 파라미터 : ' + paramUserId + ', ' + paramProjId + ', ' + paramInstId + ', ' + regId);
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        
        // Device 정보 저장
        database.one('INSERT into public.push_registry(user_id, proj_id, inst_id, registration_id) values($1, $2, $3, $4) returning user_id', 
                     [paramUserId, paramProjId, paramInstId, paramRegId])
            .then(data => {
                if (data.user_id) {
                    console.log('다음 단말 데이터 추가함 : ' + data.user_id);
                    
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write("<h2>단말 데이터 추가 성공<h2>");
                    res.end();
                } else {
                    console.log('추가된 단말 데이터가 없음.');
                    
                    res.writeHead('404', {'Content-Type':'text/html;charset=utf8'});
                    res.write("<h2>단말 데이터 추가 실패<h2>");
                    res.end();
                }
            })
            .catch(err => {
                console.error('단말 정보 추가 중 오류 발생 : ' + err.stack);
            
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>단말 정보 추가 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
            
                return;
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
        database.any('SELECT * from device')
            .then(function(data) {
                if(data.length > 0) {
                    console.dir(data);
                    
                    var context = {
                        title: '단말 목록',
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
                console.error('단말 리스트 조회 중 오류 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>단말 리스트 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            });
    }
}

var register = function(req, res) {
    console.log('device 모듈 안에 있는 register 호출됨.');
    
    var database = req.app.get('database');
    
    var paramMobile = req.body.mobile || req.query.mobile;
    var paramRegistrationId = req.body.registrationId || req.query.registrationId;
    
    console.log('요청 파라미터 : ' + paramMobile + ', ' + paramRegistrationId);
    
    // 데이터 베이스 객체가 초기화된 경우
    if(database) {
        database.none('UPDATE public.device set "registrationId" = $1 where mobile = $2', [paramRegistrationId, paramMobile])
        .then(data => {
            console.log("등록 ID 업데이트함.");
            console.dir(result);
            
            res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
            res.write("{code: '200', 'message':'등록 ID 업데이트 성공'}");
            res.end();
        })
        .catch(error => {
            console.error('당말 등록 중 오류 발생 : ' + error);
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write("<h2>단말 등록 중 오류 발생</h2>");
            res.write('<p>' + error + '</p>');
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
        database.any('SELECT * from device')
            .then(function(data) {
                if(data.length > 0) {
                    console.dir(data);    
                    
                    var message = { title : "emoodchart" , content : paramData }
                    
                    var regIds = [];
                    for(var i = 0 ; i < data.length ; i++) {
                        var curId = data[i].registrationId;
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
module.exports.register = register;
module.exports.sendall = sendall;
