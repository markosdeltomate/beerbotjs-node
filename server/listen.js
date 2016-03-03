import express from 'express';
import http from 'http';
import Socket from 'socket.io';
import jwt from 'jsonwebtoken';
import socketioJwt from 'socketio-jwt';
import settings from './settings';

let app = express(),
    server = http.createServer(app),
    io = Socket.listen(server);

app.post('/login', (req, res) => {
    let profile = {
            userName: 'Markos',
            email: 'markost@gmail.com',
            id: '12345'
        },
        token = jwt.sign(profile, settings.jwtSecret, { expiresIn: 60*60 });

    res.json({token: token});
});

io.use(socketioJwt.authorize({
    secret: settings.jwtSecret,
    handshake: true
}));

io.sockets
    .on('connection', (socket) => {
        console.log(socket.decoded_token.email, 'connected');
        //socket.on('event');
    });

server.listen(24772, () => {
    console.log('listening on *:24772');
});
