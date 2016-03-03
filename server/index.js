import socketIo  from 'socket.io-client';
import settings  from './settings';

// get connection data from settings.
let io = socketIo.connect('http://localhost:24772', {
    query: 'token=' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6Ik1hcmtvcyIsImVtYWlsIjoibWFya29zdEBnbWFpbC5jb20iLCJpZCI6IjEyMzQ1IiwiaWF0IjoxNDU3MDQxNjQwLCJleHAiOjE0NTcwNDE5NDB9.B4xoRMyABFVOfcFkrUgBRWZNqekW0vJhAOZh5Jmnbgs"
});

io.on('connect', function () {
    console.log('authenticated');
}).on('disconnect', function () {
    console.log('disconnected');
});