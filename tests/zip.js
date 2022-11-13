const join = require('path').join;
const readdir = require('fs/promises').readdir;
const stat = require('fs/promises').stat;
const readFile = require('fs/promises').readFile;
const fs = require('fs');
const JSZip = require("jszip")

async function compress(dir_path) {
    console.log("Crompressing", dir_path);
    const zip = new JSZip();
    const files = await readdir(dir_path, { withFileTypes: true });
    var all_files = [];
    var total_size = 0;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.isFile()) {
            const mypath = join(dir_path, file.name);
            all_files.push(file.name);
            const { size } = await stat(mypath);
            total_size += size;
            const filedata = await readFile(mypath);
            zip.file(file.name, filedata);
        }
    }
    if (total_size > 2 * 1024 * 1024) {
        return "exceed maximum size";
    }

    try {
        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream('joj_upload.zip'))
            .on('finish', function () {
                console.log("joj_upload.zip written.");
            });
    } catch (error) {
        console.log(error);
    }
    return 0;
}


compress('./');