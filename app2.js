// Express 기본 모듈 불러오기
var express =require('express'), http=require('http'), path=require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser'), cookieParser = require('cookie-parser'), static = require('serve-static'), errorHandler = require('errorhandler');

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
// var expressSession = require('express-session');

// 사용자 정의 모듈 불러오기
// var user = require('./routes/user')

// 설정 파일 불러오기
var config = require('./config');

// 데이터베이스 파일 불러오기
var database = require('./database/database');

// 라우터 파일 불러오기
var route_loader = require('./routes/route_loader');

// 주기적으로 Push Notification 보내기
var pushservice = require('./push-service/notifier');

// 익스프레스 객체 생성
var app = express();

//===== 서버 변수 설정 및 static으로 [public] 폴더 설정 =====//
console.log('config.server_port : %d', config.server_port);

// 기본 속성 설정
app.set('port', process.env.PORT || config.server_port);

// 뷰 엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 데이터베이스 초기화
database.init(app, config);

// 라우터 객체 참조 및 초기화
var router = express.Router();
route_loader.init(router, app);

//=== 404 오류 페이지 처리 ===//
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// === 푸시 서비스 시작 == //
pushservice.surveyNotifier(app);

// === 서버 시작 ===//
http.createServer(app).listen(app.get('port'), function() {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));    
});
