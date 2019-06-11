const fs = require('fs');
const path = require('path');
const klawSync = require('klaw-sync');
const createApiDoc = require('./createApiDoc');

/**
 * @param {object} opt input 项目绝对路径，output apiDoc文档生成绝对路径，apiDocJsonPath apiDoc.json保存绝对路径
 * @param {string} opt.input 项目绝对路径
 * @param {string} opt.output apiDoc文档生成绝对路径
 * @param {(string|string[])} opt.includeFilters model名包含过滤
 * @param {(string|string[])} opt.excludeFilters model名排除过滤
 */
const createModelDoc = async (opt) => {
    try {
        let models = opt.input;
        let outputPath = opt.output;
        let includeFilters = opt.includeFilters;
        let excludeFilters = opt.excludeFilters;
    
        modelList = await findFiles(models, includeFilters, excludeFilters);
    
        let annotations = [];
        for (let i=0; i<modelList.length; i++) {
            let model = require(modelList[i]);
            let annotation = await treeToAnnotation(model.collection.name, model.schema.tree);
            annotations.push(annotation);
        }
        let file = path.join(outputPath, 'ModelAnnotations.js');
        await fs.writeFileSync(file, annotations.join('\n\n'));
    
        let options = {};
        options.input = [outputPath];
        options.output = opt.output;
        await createApiDoc(options);
    } catch (err) {
        console.error(err);
    }
}

/**
 * Search files recursivly and filter by include / exlude filters
 *
 * @returns {String[]}
 */
const findFiles = async (path, includeFilters, excludeFilters) => {
    let files = [];
    files = klawSync(path).map(p => {return p.path;});

    // not include Directories
    files = files.filter(p => {return fs.statSync(p).isFile()});
    
    // create RegExp Include Filter List
    let regExpIncludeFilters = [];
    if (typeof includeFilters === 'string') {
        includeFilters = [ includeFilters ];
    } else if (Array.isArray(includeFilters)) {
        includeFilters = includeFilters;
    } else {
        includeFilters = [];
    }
    for (let f of includeFilters) {
        if (f.length) {
            regExpIncludeFilters.push(new RegExp(f));
        }
    }
    
    // RegExp Include Filter
    files = files.filter(f => {
        if (includeFilters.length) {
            for (let re of regExpIncludeFilters) {
                if (re.test(f)) {
                    return 1;
                }
            }
            return 0;
        } else {
            return 1;
        }
    })

    // create RegExp Exclude Filter List
    let regExpExcludeFilters = [];
    if (typeof excludeFilters === 'string') {
        excludeFilters = [ excludeFilters ];
    } else if (Array.isArray(excludeFilters)) {
        excludeFilters = excludeFilters;
    } else {
        excludeFilters = [];
    }
    for (let f of excludeFilters) {
        if (f.length) {
            regExpExcludeFilters.push(new RegExp(f));
        }
    }
    
    // RegExp Exclude Filter
    files = files.filter(f => {
        for (let re of regExpExcludeFilters) {
            if (re.test(f)) {
                return 0;
            }
        }
        return 1;
    })
    
    return files;
}

const treeToAnnotation = async (name, tree) => {
    let annotation = `/**\n * @api {GET} ${name} ${name}\n * @apiVersion 1.0.0\n * @apiGroup MODEL\n *\n`;
    for (let key in tree) {
        if (tree[key].constructor.name != 'VirtualType') {
            let description, type = {};
            if (tree[key].name) {
                type = tree[key].name;
            } else if (Array.isArray(tree[key])) {
                if (tree[key][0].name) {
                    description = `[${tree[key][0].name}]`;
                } else if (tree[key][0].type) {
                    description = `[${tree[key][0].type.name}]`;
                } else {
                    description = JSON.stringify(await getTreeType(tree[key][0]));
                }
                type = 'Array';
            } else if (tree[key].type) {
                type = tree[key].type.name;
            } else {
                description = JSON.stringify(await getTreeType(tree[key].type));
                type = 'Object';
            }
            annotation += ` * @apiParam {${type=='ObjectId' ? 'String' : type}} ${tree[key].required ? key : '['+key}${tree[key].default ? '='+tree[key].default : ''}${tree[key].required ? '' : ']'}${description ? ' '+description : ''}\n`;
        }
    }
    annotation += ' */';
    return annotation;
}

// Mongo 多层结构字段类型转 Object
const getTreeType = async (tree) => {
    let type = {};
    Object.keys(tree).map(async(x) => {
        if (tree[x].name) {
            type[x] = tree[x].name;
        } else {
            type[x] = await getTreeType(tree[x]);
        }
    });
    return type;
}

const xxx = async () => {
    let options = {};

    options.input = path.join('F:/Git/cyl-app-backend', 'cyl-db');
    options.output = 'E:/Running/apiDoc/Test/doc';
    options.includeFilters = ['oilconsumption', 'coupon'];
    await createModelDoc(options);
}

xxx()