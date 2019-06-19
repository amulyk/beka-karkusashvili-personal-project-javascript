import { validation } from '../validation';

class Transaction {

    constructor() {
        this.store = {};
        this.logs = [];
    }

    async dispatch(scenario) {

        this._validate(scenario, 'array', 'First parameter');

        scenario.forEach(item => {
            const { index, meta, call } = item;
            if (index < 1) {
                throw new Error('Index must more than or equal 1.');
            }

            validation(item, schema);

        });
        const steps = scenario.sort((a, b) => a.index - b.index);
        if(steps[steps.length-1].hasOwnProperty('restore')) {
            throw new Error('Last step does\'n have restor method.');
        }
        let stepCount = -1;

        for (const step of steps) {
            const { index, meta, call, silent } = step;
            
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
                    this.store = null;
                    for (let i = stepCount; i >= 0; i--) {
                        const { restore } = steps[i];
                        if (typeof restore !== 'function') {
                            continue;
                        }
                        try {
                            await restore();
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

const schema = {
    index: 'number',
    meta: {
        title: 'string',
        description: 'string'
    },
    call: 'function',
    restore: {
        type: 'function',
        required: false
    },
    silent: {
        type: 'string',
        required: false
    }
}

export { Transaction };
