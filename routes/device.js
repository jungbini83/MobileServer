var fcm = require('node-gcm');
var config = require('../config');
var request = require('request');
var pgp = require('pg-promise')({});

var queryPatId = function(req, res) {
    console.log('device 모듈 안에 있는 queryPatId 호출됨.');

    var paramUserId     = req.body.userId || req.query.userId;
    var paramProjId     = req.body.projId || req.query.projId;
    var paramInstId     = req.body.instId || req.query.instId;

    var database = req.app.get('database');

    console.log("조회할 피험자 정보(User ID: " + paramUserId + ", Project ID: " + paramProjId + ", Institution ID: " + paramInstId + ")");

    // 데이터베이스 객체가 초기화된 경우
    if(database) {

        // 관련 정보가 이미 있는지 검색
        database.any('SELECT id from public.patient where identifier = $1 and proj_id = $2 and inst_id = $3', [paramUserId, paramProjId, paramInstId])
        .then(data => {            
            if (data.length > 0) {
                console.log('피험자 ID : ' + data[0].id);
                res.writeHead('200', {'Content-Type': 'application/json;chartset=utf8'});
                res.write("{code: '200', 'message':" + data[0].id + "}");
                res.end();
            } else {                
                console.log('조회된 피험자가 없습니다.');
                res.writeHead('200', {'Content-Type': 'application/json;chartset=utf8'});
                res.write("{code: '200', 'message':'조회된 피험자가 없습니다.'}");
                res.end();
            }
        })
        .catch(err => {
	    console.error('DB 조회 중 오류 발생: ' + err.stack);
	    res.writeHead('500', {'Content-Type': 'application/json;charset=utf8'});
            res.write("{code: '500', 'message':'DB 조회  중 오류 발생'}");
            res.write('<p>' + err.stack + '</p>');
            res.end(); 
        });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        console.error('Database가 초기화되지 않았습니다.');   
        res.writeHead('500', {'Content-Type': 'application/json;charset=utf8'});
        res.write("{code: '500', 'message':'DB가 초기화되지 않았습니다.'}");
        res.write('<p>' + err.stack + '</p>');
        res.end();
    }
}    

var adddevice = function(req, res) {
    console.log('device 모듈 안에 있는 adddevice 호출됨.');

    var paramRegId	= req.body.regId || req.query.regId;
    var paramPatId	= req.body.patId || req.query.patId;

    console.log('요청 파라미터 : ' + paramPatId + ', ' + paramRegId);

    var database = req.app.get('database');
    console.log("데이터베이스 변수 가져오기 성공");
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        
        // 관련 정보가 이미 있는지 검색
        database.any('SELECT pat_id from public.user_device where pat_id = $1', [paramPatId])
        .then(data => {
            if (data.length > 0) {

                console.log('이미 사용자 정보가 존재합니다 : ' + data);
                
                res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                res.write("{code: '200', 'message':'이미 사용자가 존재합니다.'}");
                res.end();

            } else {
                // Device 정보 저장
                database.one('INSERT into public.user_device(pat_id, registration_id) values($1, $2) returning pat_id', 
                     [paramPatId, paramRegId])
                .then(data => {
                    if (data.pat_id) {
                        console.log('다음 피험자의 단말 데이터 추가함 : ' + data.pat_id);

                        res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                        res.write("{code: '200', 'message': 'Push notification을 위한 token 추가 성공'}");
                        res.end();
                    } else {
                        console.log('추가된 단말 데이터가 없음.');

                        res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                        res.write("{code: '200', 'message':'Push notification을 위한 token 추가 실패'}");
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
        database.any('SELECT * from user_device')
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

var groupingPushUser = function(db, callback) {
    console.log('groupingPushUser 함수 호출됨.');
    
    db.any('SELECT * from user_device')
    .then(function(data) {
        if(data.length > 0) {
            console.dir(data);    

            var regIds = [];
            for(var i = 0 ; i < data.length ; i++) {
                var curId = data[i].registration_id;
                console.log('등록 ID #' + i + ' : ' + regIds.length);
                regIds.push(curId);
            }            
            
            console.log('전송 대상 단말 수 : ' + regIds.length);
            callback(null, regIds);            
            
        } else {
            callback(null, null);
        }
    })
    .catch(function(err) {
        callback(err, null);
        return;
    });
}
    

var sendall = function(req, res) {
    console.log('device 모듈 안에 있는 sendall 호출됨.');
        
    var database = req.app.get('database');
        
    var paramData = req.body.data || req.query.data;    
    var message = { title : "emoodchart 공지" , content : paramData }
    
    var apikey = 'key=' + config.fcm_api_key;
    var projectId = '' + config.project_id;
    
    console.log('요청 파라미터 : ' + paramData);
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        
        var noti_key = '';
        groupingPushUser(database, function(err, result) {
            if (err) {
                console.log('Push user 불러오는 중에 오류 발생 : ' + err.stack);
                res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                res.write("{code: '200', 'message':'Push user 불러오기 실패'}");
                res.end();
            } 
            
            if (result) {
                
                console.log('Push user 그룹 만들기');
                
                request({
                    url : 'https://iid.googleapis.com/notification',
                    method : 'POST',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Authorization': apikey,
                        'project_id': projectId
                    },
                    body : JSON.stringify({                        
                        "operation": "add",
                        "notification_key_name": "survey",
                        "notification_key": config.notification_key,
                        "registration_ids": result
                    })
                }, function (error, response, body) {
                    if (error) {
                        console.error(error, response, body);
                    } else if (response.statusCode >= 400) {
                        console.error('HTTP Error: ' + response.statusCode + ' - '
                                            + response.statusMessage + '\n' + body);
                    } else {
                        
                        // 그룹 구성에 성공했을 때, notification_key를 받음
                        console.dir(body);
                        var obj = JSON.parse(body);                        
                        noti_key = obj.notification_key;    // notification key
                        
                        console.log('성공적으로 그룹에 추가하였습니다.');
                        
                        request({
                            url : 'https://fcm.googleapis.com/fcm/send',
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                                'Authorization' : apikey
                            },
                            body : JSON.stringify({                            
                                "data" : {
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
                                // "to" : "/topics/notice"
                                "to" : noti_key
                            })
                        }, function(error2, response2, body2) {
                            if (error2) {
                                console.error(error2, response2, body2);
                            } else if (response2.statusCode >= 400) {
                                console.error('HTTP Error: ' + response2.statusCode + ' - '
                                                    + response2.statusMessage + '\n' + body2);
                            } else {
                                console.dir(body2);                                
                                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                                res.write('<h2>푸시 메시지 전송 성공</h2>');
                                res.end();
                            }
                        });     
                    }
                });   
                
            } else {                
                console.log('Push user가 검색되지 않았습니다.');
                res.writeHead('200', {'Content-Type': 'application/json;charset=utf8'});
                res.write("{code: '200', 'message':'Push user가 검색되지 않았습니다.'}");
                res.end();
            }
        });
        
        console.log("notification key: " + noti_key);
        
        
    } 
};

module.exports.adddevice = adddevice;
module.exports.listdevice = listdevice;
module.exports.sendall = sendall;
module.exports.queryPatId = queryPatId;
