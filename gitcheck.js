#!/usr/bin/env node

var fs = require("fs");
var path = require("path");

var gitrunner = require("gitrunner").Async;

var check = function(folder, onupdate, oncompleted) {
    gitrunner.fullStatus(folder, function(err, status) {
        if (status.isRepo) {
            onupdate(status),
            oncompleted();
        } else {
            // Not a git repo - check subfolders
            fs.readdir(folder, function(err, files) {
                (function loopfn(i, completed) {
                    if (!(i < files.length)) {
                        if (completed) completed();
                        return;
                    }
                    var fp = path.resolve(folder, files[i]);
                    fs.stat(fp, function(err, stat) {
                        if (stat.isDirectory()) {
                            check(fp, onupdate, function() {
                                loopfn(i + 1, completed);
                            });
                        } else {
                            loopfn(i + 1, completed);
                        }
                    });
                })(0, oncompleted);
            });

        }
    });
};

check(process.cwd(),
    function(folder) {
        if (folder.changedFiles.length > 0) {
            console.log(folder.changedFiles.length + " changed files in " + folder.path);
            //console.log(folder)
        }
    },
    function() {
        console.log("completed check");
        // todo: fire update for any missing folders in knownfolders
    });
