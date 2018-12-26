module.exports = {
    server_port: 7779,
    db_url: 'postgres://emoodchart:esel10582@bipolar-database.ckq0ra1dncd4.ap-northeast-2.rds.amazonaws.com:5432/emoodchart',    
    fcm_api_key: 'AAAAoXvvNNw:APA91bHcTpYTqup6kk_nFwi0EQ2X1MVYeBdTmT_ApNtOHOlWWW_1m1hxpatDhu7QQ8M0J9FkOe8DIQf6H0KpTYhWO8OJ5_9sm9JH69FHRM1uKorAW_L0wUDSarWTP5NUYZ1cCO6uE6tlpfTWi5he4caP1y4ALrBtQA',
    project_id: '693569008860',
    notification_key: 'APA91bFYPrWpggOKUAhtRdPs25Ed6xvBl9UXbJlUd3UWaxhycRMB-jXO75jOTFQeLUHrEwsLWj_88KxlNrw16TPdkWWceed4WTryanUc0xsBba7G0ZxoRwk',
    route_info : [
        {file: './device', path: '/process/adddevice', method: 'adddevice', type: 'post'},
        {file: './device', path: '/process/listdevice', method: 'listdevice', type: 'post'},
        {file: './device', path: '/process/sendall', method: 'sendall', type: 'post'},
	{file: './device', path: '/process/queryPatId', method: 'queryPatId', type: 'post'}
    ]
}
