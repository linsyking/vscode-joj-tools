import { Memento } from "vscode";
import { spawn } from "child_process";
import * as vscode from "vscode";
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
    return new Promise((resolve, reject) => {
        var child = spawn(com, ["--version"]);
        child.on("error", () => {
            vscode.window.showInformationMessage(`Not found ${com}, trying to install...`);
            const child2 = spawn("pip3", ["install", ins]);
            child2.on("error", () => {
                // Cannot install
                vscode.window.showErrorMessage(`Cannot install ${ins}, make sure you have python3 >=3.6 installed and pip3 enabled.`);
                reject("fail");
            })
            child2.on("exit", (code) => {
                if (code != 0) {
                    vscode.window.showErrorMessage(`Failed to run pip3 install ${ins}.`);
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
