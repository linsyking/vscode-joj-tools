"use strict";
var child_process_1 = require("child_process");
function submit_code(url, zip_path, lang, sid, playback) {
    var child = child_process_1.spawn("joj-submit", ["-a", "-c", "-d", "-j", url, zip_path, lang, sid]);
    child.stdout.setEncoding('utf-8');
    child.stdout.on("data", function (data) {
        console.log(data);
        // playback(data);
    });
}
exports.submit_code = submit_code;
