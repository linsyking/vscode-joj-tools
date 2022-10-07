import { spawn, exec } from "child_process";
import { readdir } from "fs";
import { join } from "path";

export function compress(dir_path: string, playback: any) {
    console.log("Crompressing", dir_path);
    readdir(dir_path, (err, files) => {
        var l_n = files.length;
        const child = spawn('zip', ["a.zip"].concat(files),{
            cwd: dir_path
        });
        child.stdout.setEncoding('utf-8');
        child.stderr.setEncoding('utf-8');

        setTimeout(() => {
            playback();
        }, 500);

        child.stderr.on("data", (data) => {
            console.log(data);
        })
    });

}
