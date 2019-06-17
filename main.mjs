import { Transaction } from './transaction/index.mjs';

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