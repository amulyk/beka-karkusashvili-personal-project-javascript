import { Transaction } from './transaction/index.mjs';

const scenario = [
    {
        index: 1,
        meta: {
            title: 'Title 1',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async (store) => {
            store.surname = 'Jon'
        },
        restore: async () => {}
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
    } catch (err) {
        console.log(err);
    }
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}