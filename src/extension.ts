// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const jsdom = require('jsdom');
const axios = require('axios').default;

import { JOJProvider } from './JOJDataProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    init_JOJ_Page();

    let disposable = vscode.commands.registerCommand('joj-tools.refresh', function () {
        init_JOJ_Page();
    });

    const course_tree = new JOJProvider();
    vscode.window.registerTreeDataProvider("joj-tree", course_tree);
    
    vscode.commands.registerCommand('joj-tools.submitentry', function () {
        course_tree.setData([{ name:"sa", role:"sd" }], [{ name:"sdda"}], undefined);
        course_tree.refresh();
    });

    context.subscriptions.push(disposable);
}


async function get_JOJ_page() {
    try {
        const response = await axios.get("https://yydbxx.cn");
        const dom = new jsdom.JSDOM(response.data);
        console.log(dom.window.document.querySelector("p").textContent)

    } catch (err) {
        console.log(err);
    }

}

function init_JOJ_Page() {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        cancellable: false,
        title: 'Loading JOJ',

    }, async (progress) => {
        progress.report({ increment: 0 });
        await get_JOJ_page();
        progress.report({ increment: 100 });
    });
}


// This method is called when your extension is deactivated
export function deactivate() { }
