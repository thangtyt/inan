'use strict';

module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.on('new_user', function () {
            socket.emit('update_user_count',io.engine.clientsCount);
        })
        //socket.emit('update_user_count',io.engine.clientsCount);
    })
};