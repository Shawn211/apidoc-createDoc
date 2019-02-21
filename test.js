'use strict';

const path = require('path');
const createDoc = require('./index');

async function createApiDoc() {
    try {
        let options = {};
        options.input = [
            path.join(__dirname, './api_need'),
            path.join(__dirname, './api_user')
        ];
        options.output = path.join(__dirname, './Test/doc');
        options.apiDocJsonPath = path.join(__dirname, './Test');
    
        await createDoc(options);
    } catch (err) {
        console.error(err);
    }
}

createApiDoc();