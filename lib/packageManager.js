'use strict';

var fs = require('fs')
    , path = './packageList.json'
    ;

var baseConfig = {
    packages: []
};

module.exports = {
    reset: function() {
        return new Promise(function(resolve, reject) {
            var content = JSON.stringify(baseConfig);
            fs.unlinkSync(path);

            fs.writeFile(path, content, function(err) {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    , list: function() {
        return new Promise(function(resolve, reject) {
            fs.readFile(path, function(err, data) {
                if(err)
                    reject(err);
                else
                    resolve(JSON.parse(data));
            });
        });
    }
    , add: function(code, description) {
        return new Promise(function(resolve, reject) {
            this.list()
                .then(function(list) {
                    var pac = {
                        code: code
                        , description: description
                    };

                    list.packages.push(pac);
                    fs.writeFile(path, JSON.stringify(list), function(err) {
                        if(err)
                            reject(err);
                        else
                            resolve(list.packages);
                    });
                })
                .catch(function(err) {
                    reject(err);
                });
        }.bind(this));
    }
};