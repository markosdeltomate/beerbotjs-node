"use strict";
import Auth from './authorization';
import Fermenter from './fermenter';
import IO from './socket';
let auth = new Auth(); //TODO: I hate this structure, let's move login into IO maybe?

auth.login((sessionToken) => {

    let socket = new IO(sessionToken, Fermenter);
/*    socket.buildRobot(fermenter).then(() => {
        robot = fermenter;
    });*/

});
