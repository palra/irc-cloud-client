const WebSocket = require('ws');
const Rx = require('rxjs/Rx');
const oob = require('./oob');
const { api } = require('./config')
const httpRpc = require('./http-rpc');

module.exports = function login(email, password) {
    return httpRpc
        .login(email, password)
        .then(session => {
            let ws = new WebSocket(api.wss.endpoint, {
                protocolVersion: 13,
                origin: api.wss.options.origin,
                headers: {
                    'Cookie': `session=${session}`,
                    'Host': api.wss.options.host
                }
            });
        
            return Rx.Observable
                .fromEvent(ws, 'message')
                .map(m => JSON.parse(m.data));
        }).then(events => {
            return events.merge(oob(events))
        })
};
