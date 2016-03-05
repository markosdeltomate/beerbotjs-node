import io from 'socket.io-client';
import Auth from './authorization';
import settings from './settings';
import Robot from './robot';

let robot;

Auth.login((sessionToken) => {
    let extraHeaders = {
            extraHeaders: {
                Authorization: `Bearer ${sessionToken}`
            }
        },
        socket = io.connect(
            `http://${settings.host}:${settings.port}`,
            extraHeaders);
    socket.on('connect', () => {
        //console.log(socket);
        //console.log(io);
    }).on('authenticated', () => {
        robot = new Robot(socket);
    }).on('disconnect', (reason) => {
        console.log('Discconect ', reason);
    });



});
