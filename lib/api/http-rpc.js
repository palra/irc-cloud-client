const request = require('request-promise-native');
const Rx = require('rxjs/Rx');
const { api } = require('./config');
const debug = require('debug')('ircc:http-rpc');

class IRCCloudHttpRpc {
    /**
     * @return {Promise<string>} The form token
     */
    getAuthFormToken() {
        debug('getAuthFormToken: sent')
        return request.post({
            url: `${api.httpsEndpoint}/chat/auth-formtoken`,
            headers: {
                'Content-Length': '0'
            }
        }).then(body => {
            debug('getAuthFormToken: received body')
            var res = JSON.parse(body);
            if (res.success)
                return res.token;

            throw new Error('CSRF Token generation failed');
        })
    }

    /**
     * @return {Promise<string>} The session token
     */
    login(email, password) {
        debug('login: sent')
        return this.getAuthFormToken()
            .then(token => {
                return request.post({
                    url: `${api.httpsEndpoint}/chat/login`,
                    headers: {
                        'x-auth-formtoken': token
                    },
                    form: {
                        token,
                        email,
                        password
                    }
                })
            })
            .then(body => {
                debug('login: received body')
                var res = JSON.parse(body);
                if (res.success)
                    return res.session;

                throw res;
            })
            .then(session => {
                debug('session saved')
                return this.session = session;
            })
    }

    /**
     * @param {string} uri 
     * @return {Rx.Subject<Object>}
     */
    getOobInclude(uri) {
        this._ensureLoggedIn();
        debug('getObbInclude: sent')

        return Rx.Observable.fromPromise(
            request.get({
                url: `${api.httpsEndpoint}${uri}`,
                headers: {
                    Cookie: `session=${this.session}`
                }
            })
            .then(backlog => {
                debug('getObbInclude: received')
                return JSON.parse(backlog)
            })
        ).flatMap(Rx.Observable.from);
    }

    _ensureLoggedIn() {
        if (!this.session) {
            throw new Error('You must be logged in to execute that operation');
        }
    }
}

module.exports = new IRCCloudHttpRpc();
exports.IRCCloudHttpRpc = IRCCloudHttpRpc;