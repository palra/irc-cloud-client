const httpRpc = require('./http-rpc');
const debug = require('debug')('ircc:obb');
const { finalize } = require('rxjs/operators');
const { parseMessage } = require('./rx-utils')

module.exports = function(events) {
    return events
        .filter(msg => msg.type === 'oob_include')
        .pluck('url')
        .take(1)
        .mergeMap((uri) => {
            debug(`uri: ${uri}`)
            return httpRpc.getOobInclude(uri)
        })
        .pipe(
            parseMessage,
            finalize(() => {
                debug('end of backlog')
            })
        )
};