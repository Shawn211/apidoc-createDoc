'use strict';

const fs =require('fs');
const path = require('path');
const createDoc = require('apidoc').createDoc;

function transformToObject(filters) {
    if (!filters)
        return;

    if (typeof (filters) === 'string')
        filters = [filters];

    var result = {};
    filters.forEach(function (filter) {
        var splits = filter.split('=');
        if (splits.length === 2) {
            var obj = {};
            result[splits[0]] = path.resolve(splits[1], '');
        }
    });
    return result;
}

/**
 * @param {object} opt input 项目绝对路径，output apiDoc文档生成绝对路径，apiDocJsonPath apiDoc.json保存绝对路径
 * @param {string[]} opt.input 项目绝对路径
 * @param {string} opt.output apiDoc文档生成绝对路径
 * @param {string} opt.apiDocJsonPath apiDoc.json保存绝对路径
 */
async function createApiDoc (opt) {
    let inputs = opt.input;
    if (!inputs || inputs.length === 0)
        throw Error('Input required')
    if (!opt.output)
        throw Error('Output required')
    if (!opt.apiDocJsonPath)
        throw Error('ApiDocJsonPath required')
    
    let options = {
        excludeFilters: opt.excludeFilters ? [opt.excludeFilters] : [''],
        includeFilters: opt.fileFilters ? [opt.fileFilters] : ['.*\\.(clj|cls|coffee|cpp|cs|dart|erl|exs?|go|groovy|ino?|java|js|jsx|kt|litcoffee|lua|p|php?|pl|pm|py|rb|scala|ts|vue)$'],
        src           : '',
        dest          : opt.output,
        template      : opt.template ? opt.template : path.join(__dirname, './node_modules/apidoc/template/'),
        config        : opt.config ? opt.config : './',
        apiprivate    : opt.private ? opt.private : false,
        verbose       : opt.verbose ? opt.verbose : false,
        debug         : opt.debug ? opt.debug : false,
        parse         : true,  // 默认不创建文件
        colorize      : opt.color ? opt.color : true,
        filters       : opt.parseFilters ? transformToObject([opt.parseFilters]) : [],
        languages     : opt.parseLanguages ? transformToObject([opt.parseLanguages]) : [],
        parsers       : opt.parseParsers ? transformToObject([opt.parseParsers]) : [],
        workers       : opt.parseWorkers ? transformToObject([opt.parseWorkers]) : [],
        silent        : opt.silent ? opt.silent : false,
        simulate      : opt.simulate ? opt.simulate : false,
        markdown      : opt.markdown ? opt.markdown : true,
        lineEnding    : opt.lineEnding,
        encoding      : opt.encoding ? opt.encoding : 'utf8',
        // 将生成的 api_data.json 保存在各自项目的特定路径
        apiDocJsonPath: opt.apiDocJsonPath
    };
    let completed_api = {
        data: '',
        project: ''
    };
    let api_true = false;
    let api_false = false;
    let last_success_input = '';
    let api_project = {};
    for (let input of inputs) {
        options.src = input;
        let api = await createDoc(options);
        if (api === true) {
            api_true = true;
        } else if (api === false) {
            api_false = true;
        } else {
            last_success_input = input;
            completed_api.data = completed_api.data ? completed_api.data.slice(0, completed_api.data.length - 1).concat(',', api.data.slice(1, api.data.length)) : api.data;
            api_project = api.project;
        }
        
        if (inputs.indexOf(input) === inputs.length - 1) {
            // 若需要创建文件，则最后一遍对可创建文件的input路径进行createDoc
            options.parse = opt.parse ? opt.parse : false  // 最后一个input路径默认创建文件
            options.src = input;
            await createDoc(options);

            // 进行completed_api的分析与最终赋值
            if (api_false) {
                completed_api = false;
            } else if (api_true && completed_api.data.length === 0) {
                completed_api = true;
            } else {
                completed_api.project = api_project;
            }
        }
    }

    if (completed_api !== true && completed_api !== false && !options.parse && !options.simulate)
        await fs.writeFileSync(path.join(opt.output, './api_data.json'), completed_api.data + '\n');
        await fs.writeFileSync(path.join(opt.output, './api_data.js'), 'define({ "api": ' + completed_api.data + ' });' + '\n');
        await fs.writeFileSync(path.join(opt.apiDocJsonPath, './api_data.json'), completed_api.data + '\n');
    return completed_api;
}

module.exports = createApiDoc;