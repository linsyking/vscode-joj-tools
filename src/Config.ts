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

export function check_init() {
    check_single("joj-auth", "joj-auth");
    check_single("joj-submit", "joj-submitter");
}

function check_single(com: string, ins: string) {
    var child = spawn(com, ["--version"]);
    child.on("error", () => {
        vscode.window.showInformationMessage(`Not found ${com}, trying to install...`);
        const child2 = spawn("pip3", ["install", ins]);
        child2.on("error", () => {
            // Cannot install
            vscode.window.showErrorMessage(`Cannot install ${ins}, make sure you have python3 >=3.6 installed and pip3 enabled.`);
        })
        child2.on("exit", (code) => {
            if (code != 0) {
                vscode.window.showErrorMessage(`Failed to run pip3 install ${com}.`);
            } else {
                vscode.window.showInformationMessage("Please reload VSCode window to enable this extension.");
            }
        })
    })
}
