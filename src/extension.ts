// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const jsdom = require('jsdom');
const axios = require('axios').default;

import { JOJProvider } from './JOJDataProvider';

var dealing_queue = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


    const course_tree = new JOJProvider();

    let disposable = vscode.commands.registerCommand('joj-tools.refresh', function () {
        course_tree.clean();
        load_page(get_home_page);
    });
    context.subscriptions.push(disposable);

    // const c1 = course_tree.addCourse("sa", "sd", "Dssd");
    // c1.addHomework("dssda", "Dd");
    vscode.window.registerTreeDataProvider("joj-tree", course_tree);

    vscode.commands.registerCommand('joj-tools.submithomework', function (homework) {
        vscode.window.showInformationMessage("We are still developing this function...");
        // const c1 = course_tree.addCourse("sa", "sd","Dssd");
        // c1.addHomework("dssda", "Dd");
        // course_tree.refresh();
    });

    vscode.commands.registerCommand('joj-tools.refreshhomework', function (course) {
        // Refresh all homework under one course
        vscode.window.showInformationMessage(`Course ${course.name} is being fetched...`);
        course.killChildren();
    });

    vscode.commands.registerCommand('joj-tools.refreshquestion', function (homework) {
        // Refresh all homework under one course
        vscode.window.showInformationMessage(`Homework ${homework.name} is being fetched...`);
        homework.killChildren();
    });

}

function trim_url(url:string){
    if(url.charAt(url.length - 1)=='/'){
        var ns = url.substring(0,url.length - 1);
    }else{
        ns = url;
    }
    return ns.substring(ns.lastIndexOf('/') + 1);
}

async function get_home_page() {
    try {
        const response = await axios.get("https://joj.sjtu.edu.cn/");
        const dom = new jsdom.JSDOM(response.data);
        console.log(dom.window.document.querySelector("p").textContent)
        const courses = dom.window.document.querySelectorAll("tr")
        for (let i = 2; i < courses.length; i++) {
            const element = courses[i];
            const name = element.querySelector("td").textContent.trim();
            const href = element.querySelector("a").href;

        }
        const captcha_panel = vscode.window.createWebviewPanel("code", "captcha", vscode.ViewColumn.One);
        captcha_panel.webview.html = "The captcha is";
        var captcha_input = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            title: "Enter the CAPTCHA",
            prompt: "Please enter the captcha shown in the picture"
        });
        console.log(captcha_input);
        captcha_panel.dispose();

    } catch (err) {
        vscode.window.showErrorMessage(`Cannot fetch JOJ Page.${err}`)
        console.log(err);
    }

}

function load_page(playback: () => any, prompt?: string) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        cancellable: false,
        title: prompt ? prompt : 'Loading JOJ',

    }, async (progress) => {
        progress.report({ increment: 0 });
        await playback();
        progress.report({ increment: 100 });
    });
}


// This method is called when your extension is deactivated
export function deactivate() { }
