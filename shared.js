export const scripts = {
    BACKGROUND: 'background-script',
    DEBUG_INFO: 'debug-info-script',
    DETECTOR: 'detector-script',
    IFRAME: 'iframe-script',
    INJECTOR: 'injector-script',
    DEBUG_CONNECTION: 'debug-connection'
};

export class Message {
    constructor(to, from, body) {
        this.to = to;
        this.from = from;
        this.body = body;
    }
}

export class Deferred {
    constructor() {
        this._promise = new Promise((resolve) => {
            this._resolve = resolve;
        });
    }

    get promise() {
        return this._promise;
    }

    get resolve() {
        return this._resolve;
    }
}
