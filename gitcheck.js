#!/usr/bin/env node

var fs = require("fs");
var path = require("path");

var gitrunner = require("gitrunner").Async;


var check = function(folder, onupdate, oncompleted) {
    function checkSubfolders() {
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
    if (fs.existsSync(path.resolve(folder, ".git"))) {
        gitrunner.fullStatus(folder, function(err, status) {
            if (err) {
                console.log("error checking " + folder);
                console.log(err);
            }
            if (status.isRepo) {
                onupdate(status),
                oncompleted();
            } else {
                // not a git repo - check subfolders
                checkSubfolders();
            }
        });
    } else {
        checkSubfolders();
    }
};

check(process.cwd(),
    function(folder) {
        if (!folder.branch) {
            console.log("No branch set for " + folder.path);
        }
        if (!folder.remoteBranch) {
            console.log("No remote branch for " + folder.path);
        }
        if (folder.changedFiles.length > 0) {
            console.log(folder.changedFiles.length + " changed files in " + folder.path);
            //console.log(folder)
        }
    },
    function() {
        console.log("completed check");
        // todo: fire update for any missing folders in knownfolders
    });
