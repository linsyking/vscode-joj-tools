import { Memento } from "vscode";
import { spawn } from "child_process";
import * as vscode from "vscode";
import { platform } from "os";
export class LocalStorageService {

    constructor(private storage: Memento) { }

    public getValue(key: string) {
        return this.storage.get(key);
    }

    public setValue(key: string, value: any) {
        this.storage.update(key, value);
    }
}

export async function check_init() {
    await check_single("ji-auth", "ji-auth>=0.0.8");
    await check_single("joj-submit", "joj-submitter>=0.0.10");
    return "success";
}

async function check_single(com: string, ins: string) {
    const os = platform();
    const pipc = os == "linux" ? "pipx" : "pip3";
    return new Promise((resolve, reject) => {
        var child = spawn(com, ["--version"]);
        child.on("error", () => {
            vscode.window.showInformationMessage(`Not found ${com}, trying to install...`);
            const child2 = spawn(pipc, ["install", ins]);
            child2.on("error", () => {
                // Cannot install
                vscode.window.showErrorMessage(`Cannot install ${ins}, make sure you have python3 >=3.6 installed and pip3 enabled (For linux users, please use pipx).`);
                reject("fail");
            })
            child2.on("exit", (code) => {
                if (code != 0) {
                    vscode.window.showErrorMessage(`Failed to install ${ins}.`);
                    reject("fail");
                } else {
                    resolve("restart");
                }
            })
        })
        child.on("exit", (code) => {
            resolve("success");
        })
    });

}
