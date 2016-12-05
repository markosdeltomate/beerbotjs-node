import Auth from './authorization';
import Fermenter from './Fermenter';
import IO from './socket';
let robot;

Auth.login((sessionToken) => {

    let socket = new IO(sessionToken, Fermenter);
    socket.buildRobot(fermenter).then(() => {
        robot = fermenter;
    });





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
