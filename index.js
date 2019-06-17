

class Transaction {

    constructor() {
        this.store = {};
        this.logs = [];
    }

    async dispatch(scenario) {

        this._validate(scenario, 'array', 'First parameter');

        const steps = scenario.sort((a, b) => a.index - b.index);
        let stepCount = -1;

        for (const step of steps) {
            const { index, meta, call, restore } = step;

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
                
                if (typeof restore === 'function') {
                    this.logs.push(log);
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
                        if (i === 0) {
                            this.store = {};
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

const scenario = [
    {
        index: 1,
        meta: {
            title: 'Title 1',
            description: 'This action is responsible for reading the most popular customers'
        },
				// callback for main execution
        call: async (store) => {
            // await sleep(1000);
            store.surname = 'Jon'
        },
				// callback for rollback
        restore: async (store) => {
            store.surname = "testing restor"
        }
    },
    {
        index: 2,
        meta: {
            title: 'Title 2',
            description: 'This action is responsible for reading the most popular customers'
        },
				// callback for main execution
        call: async (store) => {
            store.name = 'Jon'
            // await sleep(2000);
            // throw new TypeError('name is not defiend');

        },
				// callback for rollback
        restore: async (store) => {
            throw new TypeError('Error from restor');
        }
    },
    {
        index: 3,
        meta: {
            title: 'Title 3',
            description: 'This action is responsible for reading the most popular customers'
        },
				// callback for main execution
        call: async (store) => {
            store.name = 'Jon'
            throw new TypeError('name is not defiend');
            // await sleep(2000);
        },
				// callback for rollback
        restore: async (store) => {
            throw new TypeError('name is not defiend');
        }
    }
];

const transaction = new Transaction();

(async() => {
    try {
			await transaction.dispatch(scenario);
			const store = transaction.store; // {} | null
            const logs = transaction.logs; // []
            console.log(logs);
            console.log(store);
            // console.log(logs[1].error);
            
    } catch (err) {
            // Send email about broken transaction
            console.log(err);
            
    }
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}