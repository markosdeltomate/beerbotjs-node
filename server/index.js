import io from 'socket.io-client';
import Auth from './authorization';
import settings from './settings';


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
    }).on('authenticated', (data) => {
        console.log('authenticated', data);
        socket.emit('stream-start', {'stream': 'bla'});
    }).on('disconnect', (reason) => {
        console.log('Discconect ', reason);
    });



});
