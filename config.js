module.exports = {
    server_port: 3000,
    db_url: 'postgres://emoodchart:esel10582@emoodchart.ciyzhtql4sob.us-east-2.rds.amazonaws.com:5432/emoodchart',
    fcm_api_key: 'AAAAoXvvNNw:APA91bHcTpYTqup6kk_nFwi0EQ2X1MVYeBdTmT_ApNtOHOlWWW_1m1hxpatDhu7QQ8M0J9FkOe8DIQf6H0KpTYhWO8OJ5_9sm9JH69FHRM1uKorAW_L0wUDSarWTP5NUYZ1cCO6uE6tlpfTWi5he4caP1y4ALrBtQA',
    route_info : [
        {file: './user', path: '/process/login', method: 'login', type: 'post'},
        {file: './user', path: '/process/adduser', method: 'adduser', type: 'post'},
        {file: './user', path: '/process/listuser', method: 'listuser', type: 'post'},
        {file: './user', path: '/process/createtable', method: 'createtable', type: 'post'},
        {file: './device', path: '/process/adddevice', method: 'adddevice', type: 'post'},
        {file: './device', path: '/process/listdevice', method: 'listdevice', type: 'post'},
        {file: './device', path: '/process/sendall', method: 'sendall', type: 'post'}
    ]
}