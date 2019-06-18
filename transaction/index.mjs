export class Transaction {

    constructor() {
        this.store = {};
        this.logs = [];
    }

    async dispatch(scenario) {

        this._validate(scenario, 'array', 'First parameter');

        const steps = scenario.sort((a, b) => a.index - b.index);
        if(steps[steps.length-1].restore !== void 0) {
            throw new Error('Last step does\'n have restor method.');
        }

        let stepCount = -1;

        for (const step of steps) {
            const { index, meta, call, silent } = step;

            this._validate(index, 'number', 'Index')
                ._validate(meta, 'object', 'Meta')
                ._validate(meta.title, 'string', 'Title')
                ._validate(meta.description, 'string', 'Description')
                ._validate(call, 'function', 'Call');
            
            const log = { index, meta };
            const storeBefore = {...this.store};
            
            try {
                await call(this.store);
                log.storeBefore = storeBefore;
                log.storeAfter = {...this.store};
                log.error = null;
            } catch ({name, message, stack}) {
                log.error = { name, message, stack };
                
                if (silent !== true) {
                    this.logs.push(log);
                    this.store = {};
                    for (let i = stepCount; i >= 0; i--) {
                        const { restore } = steps[i];
                        if (typeof restore !== 'function') {
                            continue;
                        }
                        try {
                            await restore(this.store);
                        } catch(err) {
                            throw err;
                        }
                    }
                    break;
                }
            }
            stepCount++;
            this.logs.push(log);
        }

    }

    _validate(item, type, name) {

        if (type === 'array') {
            if (!Array.isArray(item)) {
                throw new Error(name+' is required and must be '+type);
            }
        } else {
            if (typeof item !== type) {
                throw new Error(name+' is required and must be '+type);
            }
        }

        return this;

    }

}
