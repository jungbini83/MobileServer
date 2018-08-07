var adddevice = function(req, res) {
    console.log('device 모듈 안에 있는 adddevice 호출됨.');
    
    var database = req.app.get('database');
    
    var paramMobile     = req.body.mobile || req.query.mobile;
    var paramOsVersion  = req.body.osVersion || req.query.osVersion;
    var paramModel      = req.body.model || req.query.model;
    var paramDisplay    = req.body.display || req.query.display;
    var paramManufacturer = req.body.manufacturer || req.query.manufacturer;
    var paramMacAddress = req.body.macAddress || req.query.macAddress;
    
    console.log('요청 파라미터 : ' + paramMobile + ', ' + paramOsVersion + ', ' +
               paramModel + ', ' + paramDisplay + ', ' +
               paramManufacturer + ', ' + paramMacAddress);
    
    // 데이터베이스 객체가 초기화된 경우
    if(database) {
        
        // Device 정보 저장
        database.one('INSERT into public.device(mobile, "osVersion", model, display, manufacturer, "macAddress") values($1, $2, $3, $4, $5, $6) returning mobile', 
                     [paramMobile, paramOsVersion, paramModel, paramDisplay, paramManufacturer, paramMacAddress])
            .then(data => {
                if (data.mobile) {
                    console.log('다음 단말 데이터 추가함 : ' + data.mobile);
                    
                    res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                    res.write("{code:'200', 'message':'단말 데이터 추가 성공'}");
                    res.end();
                } else {
                    console.log('추가된 단말 데이터가 없음.');
                    
                    res.writeHead('404', {'Content-Type':'application/json;charset=utf8'});
                    res.write("{code:'404', 'message':'단말 데이터 추가 실패'}");
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
        database.none('UPDATE public.device set "registrationId" = $1 where id = $2', [paramRegistrationId, paramMobile])
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

module.exports.adddevice = adddevice;
module.exports.listdevice = listdevice;
module.exports.register = register;