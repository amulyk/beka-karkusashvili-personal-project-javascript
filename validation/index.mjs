export const validation = (data, schema) => {

    const error = (message) => { throw new Error(message); }

    for (const [key, value] of Object.entries({ ...data, ...schema })) {
        const type = schema[key];

        // Check if data dont have main propertys
        if (!data.hasOwnProperty(key)) {
            // Skip if not required
            if (schema[key].required === false) { continue; }
            error(key+' Not exists in data');
        }

        // Check if data have extra property
        if (!schema.hasOwnProperty(key)) {
            error(key+' Not exists in schema');
        }

        // Check array
        if (Array.isArray(type)) {
            error(key+' can\'t be empty '+type+' in schema');
        }

        // Check object
        if (typeof type === 'object') {
            if (typeof schema[key].type !== 'string') {
                if (typeof data[key] !== 'object') {
                    error(key+' must be a object.');
                }
                validation(data[key], schema[key]);
                continue;
            }else {
                // Case when checking aditional fields
                if (typeof data[key] !== schema[key].type) {
                    error(key+' type not match');
                }else {
                    if (Array.isArray(schema[key].values)) {
                        if (schema[key].values.indexOf(data[key]) === -1) {
                            error(key+' must be "'+schema[key].values.join(', ')+'".');
                        }
                    }
                    continue;
                }
            }
        }

        // Check primitive types
        if (typeof data[key] !== type) {
            error(key+' type not match');
        }
    }
}
