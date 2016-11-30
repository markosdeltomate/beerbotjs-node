import express from 'express';
import http from 'http';
import Socket from 'socket.io';
import jwt from 'jsonwebtoken';
import Auth from './authorization';
import clientConf from './clientConf';

let app = express(),
    server = http.createServer(app),
    io = Socket.listen(server);

app.post('/login', (req, res) => {
    let profile = {
            userName: 'Markos',
            email: 'markost@gmail.com',
            id: '12345'
        },
        token = jwt.sign(profile, process.env.APP_SECRET, { expiresIn: 60*60 });

    res.json({token: token});
});

//io.use();

io.sockets
    .on('connection', (socket) => {
        let sessionToken = socket.handshake.headers.authorization.split(' ').pop(),
            decoded = Auth.validateToken(sessionToken);
        socket.on('stream-start', (data) => {
            console.log('strean start', data);
        });

        socket.on('data', (data) => {
            //console.log(`Sensor ${data.sensor.name} register temp ${data.sensor.celcius}°C`);
            console.log(data);
            /*if (data.relay) {
                let relay = (data.relay.isOn)?'on':'off';
                console.log(`and the relay ${data.relay.name} is ${relay}`);
            }*/
        });
        if (decoded) {
            console.log('Authenticated: ', decoded.email);
            socket.emit('authenticated');
            socket.emit('configSent', clientConf);
        } else {
            console.log('authentication failed ');
            socket.emit('disconnect');
        }

    });

server.listen(24772, () => {
    console.log('listening on 24772');
});
