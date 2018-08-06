module.exports = {
    server_port: 3000,
    db_url: 'postgres://emoodchart:esel10582@emoodchart.ciyzhtql4sob.us-east-2.rds.amazonaws.com:5432/emoodchart',
    route_info : [
        {file: './user', path: '/process/login', method: 'login', type: 'post'},
        {file: './user', path: '/process/adduser', method: 'adduser', type: 'post'},
        {file: './user', path: '/process/listuser', method: 'listuser', type: 'post'},
        {file: './user', path: '/process/createtable', method: 'createtable', type: 'post'}
    ]
}