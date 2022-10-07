import { spawn } from "child_process"

export function submit_code(url: string, zip_path: string, lang: string, sid: string, playback: (arg0: string) => void) {
    const child = spawn("joj-submit", ["-a", "-c", "-d", "-j", url, zip_path, lang, sid]);
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdout.on("data", (data) => {
        console.log(data);
        playback(data);
    });
    child.stderr.on("data", (data) => {
        console.log("error",data);
    });
}


