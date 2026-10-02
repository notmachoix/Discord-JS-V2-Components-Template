const path = require('path');
const dotenv = require('dotenv');

module.exports = () => {

    const envPath = path.resolve(
        process.cwd(),
        '.env'
    );

    const result = dotenv.config({
        path: envPath
    });

    if (result.error) {

        console.error(
            '[ENV] Failed to load .env file'
        );

        console.error(
            result.error
        );

        return false;
    }

    console.log(
        '[ENV] Environment loaded'
    );

    return true;
};