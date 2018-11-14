var request = require('request');
var config = require('../config');
var fcm = require('node-gcm');
var schedule = require('node-schedule');

var groupingPushDevice = function(db, callback) {
        console.log('groupingPushDevice 함수 호출 됨.');

        db.any('SELECT * from user_device').then(function(data) {
                if(data.length > 0) {
                        console.dir(data);

                        var regIds = [];
                        for(var i = 0 ; i < data.length ; i++) {
                                var curId = data[i].registration_id;
                                console.log('등록 ID #' + i + ':' + regIds.length);
                                regIds.push(curId);
                        }
                        console.log('전송 대상 Device 수 : ' + regIds.length);
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


var surveyNotifier = function(app) {

	var database = app.get('database');

	if (database) {

		console.log('설문조사를 요청하는 push message를 전송합니다.');

		var notifier = schedule.scheduleJob('00 00 20 * * *', function() {
			
			var message = {title: "설문지 작성  요청", content: "설문지를 작성해주세요."}

			var apikey = 'key=' + config.fcm_api_key;
			var projectId = '' + config.project_id;

			// 데이터베이스 객체가 초기화 된 경우
			if (database) {
				var noti_key = '';
				groupingPushDevice(database, function(err, result) {
					if(err) {
						console.log('Push device를 불러오는 중에 오류가 발생했습니다: ' + err.stack);
					}

					if(result) {
						console.log('Push device 그룹 만들기 시작');
				
						request({
							url : 'https://iid.googleapis.com/notification',
							method : 'POST',
							headers : {
								'Content-Type': 'application/json',
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
							if(error) {
								console.log(error, response, body);
							} else if (response.statusCode >= 400) {
								console.error('HTTP Error: ' + response.statusCode + '-'
										+ response.statusMessage + '\n' + body);
							} else {
								// 그룹 구성에 성공 했을 경우, notification_key를 받음
								console.dir(body);
								
								var obj = JSON.parse(body);
								noti_key = obj.notification_key;
				
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
											"content": "설문지를 작성해주세요."
										},
										"notification" : {
											"title": "설문지 작성 요청",
											"body": "설문지를 작성해주세요.",
											"sound": "default"
										},
										"android": {
											"notification" : {
												"body": "설문지를 작성해주세요.",
												"title": "설문지 작성 요청",
												"sound": "default"
											}
										},
										"to" : noti_key
									})
								}, function(error2, response2, body2) {
									if(error2) {
										console.error(error2, response2, body2);
									} else if(response2.statusCode >= 400) {
										console.error('HTTP Error: ' + response2.statusCode + '-'
												+ response2.statusMessage + '\n' + body2);
									} else {
										console.log('메시지 전송 성공!');
										console.dir(body2);
									}
								});
							}
						});
					} else {
						console.log('Push device가 검색되지 않았습니다.');
					}
				});
			
				console.log("notification key: " + noti_key);
			}
		});
	}
}										
											
module.exports.surveyNotifier = surveyNotifier
