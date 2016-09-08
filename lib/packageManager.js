'use strict';

var fs = require('fs')
    , path = './packageList.json'
    ;

var baseConfig = {
    packages: []
};

function reset() {
    return new Promise(function(resolve, reject) {
        var content = JSON.stringify(baseConfig);

        fs.writeFile(path, content, function(err) {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

function list() {
    return new Promise(function(resolve, reject) {
        try {
            fs.statSync(path);
        } catch(e) {
            reset();
            resolve([]);
            return;
        }

        fs.readFile(path, function(err, data) {
            if(err)
                reject(err);
            else
                resolve(JSON.parse(data).packages);
        });
    });
}

function add(code, description) {
    return new Promise(function(resolve, reject) {
        list()
            .then(function(list) {
                var pac = {
                    code: code
                    , description: description
                };

                list.push(pac);
                fs.writeFile(path, JSON.stringify(list), function(err) {
                    if(err)
                        reject(err);
                    else
                        resolve(list);
                });
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

module.exports = {
    reset: reset
    , list: list
    , add: add
};