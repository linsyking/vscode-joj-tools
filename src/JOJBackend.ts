import { spawn } from "child_process"

export async function submit_code(url: string, zip_path: string, lang: string, sid: string) {
    return new Promise((resolve, reject) => {
        const child = spawn("joj-submit", ["-c", "-d", "-j", url, zip_path, lang, sid]);
        var output: string = "";
        child.stdout.setEncoding('utf-8');
        child.stderr.setEncoding('utf-8');
        child.stdout.on("data", (data: string) => {
            output += data;
        });
        child.stderr.on("data", (data:string) => {
            if(data.indexOf("Invalid problem")!=-1){
                resolve("You cannot submit this question.");
            }
            if(data.indexOf("Upload error")!=-1){
                resolve("This language is not allowed in this question.");
            }
            console.log("error", data);
        });
        child.on("exit", ()=>{
            resolve(output);
        });
    });
}


