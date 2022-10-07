import { spawn } from "child_process"

export function submit_code(zip_path: string, url: string, lang: string, playback: (arg0: string) => void) {
    const child = spawn("joj-submit", ["joj"]);
    child.stdout.on("data", (data) => {
        console.log(data);
        // playback(data);
    })
}


