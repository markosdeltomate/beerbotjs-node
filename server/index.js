import io from 'socket.io-client';
import Auth from './authorization';
import Fermenter from './Fermenter';

let robot;

Auth.login((sessionToken) => {
    let extraHeaders = {
            extraHeaders: {
                Authorization: `Bearer ${sessionToken}`
            }
        },
        socket = io.connect(
            `http://${process.env.HOST}:${process.env.PORT}`,
            extraHeaders);
    socket.on('connect', () => {
        //console.log(socket);
        //console.log(io);
    }).on('authenticated', () => {
        robot = new Fermenter(socket);
    }).on('disconnect', (reason) => {
        console.log('Disconnect ', reason);
    });
});
