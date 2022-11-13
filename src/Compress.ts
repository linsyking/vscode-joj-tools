import { join } from "path";
import { readdir, stat, readFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import JSZip = require("jszip");

export async function compress(dir_path: string) {
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
            // console.log("adding file:", file.name, mypath);
            const { size } = await stat(mypath);
            total_size += size;
            const filedata = await readFile(mypath);
            zip.file(file.name, filedata);
        }
    }
    if (total_size > 2 * 1024 * 1024) {
        return "Exceed maximum size";
    }
    const result = await compress_call(zip, dir_path);
    if (result != 0) {
        return "Compress failed, please see the console for details.";
    }
    console.log("Compress done.", result);

    return 0;
}

async function compress_call(myzip: JSZip, path:string) {
    return new Promise((resolve, reject) => {
        try {
            myzip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(createWriteStream(join(path, 'joj_upload.zip')))
                .on('finish', function () {
                    resolve(0);
                });
        } catch (error) {
            console.log(error);
            resolve(-1);
        }
    })
}