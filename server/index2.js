import socketIo  from 'socket.io-client';
import settings  from './settings';

// get connection data from settings.
let io = socketIo.connect(settings.host, {
    port: settings.port
});

let stopStreaming = () => {
    if (Object.keys(sockets).length === 0) {
        app.set('sensorData', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
    }
};

let startStreaming = () => {
    if (app.get('sensorData')) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }

    //TODO: this shuold be the johnny five onData event.
    var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
    proc = spawn('raspistill', args);
    console.log('Watching for changes...');
    app.set('sensorData', true);
    fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    })
};

io.on('connection', (socket) => {
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);
    socket.on('disconnect', startStreaming);
    socket.on('start-stream', startStreaming);
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

