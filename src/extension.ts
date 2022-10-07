// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const jsdom = require('jsdom');
const axios = require('axios').default;
import { spawn } from "child_process";
import { JOJProvider, Course, Homework, Question } from './JOJDataProvider';

var dealing_queue = [];
var joj_tree: JOJProvider;
var user_sid = "2c2cd83712259dc506aa45ec265eaa7ed2e261f5c3a4026a3a6cfaa564d80eba";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    get_sid();
    const course_tree = new JOJProvider();
    joj_tree = course_tree; // Global Reference

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
        joj_tree.refresh();
        get_course_page(course);
    });

    vscode.commands.registerCommand('joj-tools.refreshquestion', function (homework) {
        // Refresh all homework under one course
        vscode.window.showInformationMessage(`Homework ${homework.name} is being fetched...`);
        homework.killChildren();
    });

}

function trim_url(url: string) {
    if (url.charAt(url.length - 1) == '/') {
        var ns = url.substring(0, url.length - 1);
    } else {
        ns = url;
    }
    return ns.substring(ns.lastIndexOf('/') + 1);
}

async function http_get(url: string) {
    return axios.get(url,
        {
            headers: {
                Cookie: `sid=${user_sid};save=1;`
            }
        });
}

async function get_course_page(course: Course){
    try {
        const response = await http_get(course.url);
        const dom = new jsdom.JSDOM(response.data);
        console.log(response.data);
        var json_raw = dom.window.document.querySelectorAll("script")[3].textContent.trim();
        console.log(dom.window.document.querySelectorAll("script")[3].textContent);
        json_raw = json_raw.substring(14, json_raw.length-1);
        var course_json = JSON.parse(json_raw)['docs'];
        course_json.forEach((element: any) => {
            const id = element.id;
            const status = element.status;
            const title = element.title;
            course.addHomework(title,id);
            console.log(element)
        });
        joj_tree.refresh();
    } catch (err) {
        vscode.window.showErrorMessage(`Cannot fetch JOJ Page.${err}`)
        console.log(err);
    }
}

async function get_home_page() {
    try {
        const response = await http_get("https://joj.sjtu.edu.cn/");
        const dom = new jsdom.JSDOM(response.data);
        const courses = dom.window.document.querySelectorAll("tr");
        for (let i = 2; i < courses.length; i++) {
            const element = courses[i];
            const name = element.querySelector("td").textContent.trim();
            const href = element.querySelector("a").href;
            const role = element.querySelectorAll("td")[1].textContent.trim();
            joj_tree.addCourse(name, role, trim_url(href));
        }
        joj_tree.refresh();
    } catch (err) {
        vscode.window.showErrorMessage(`Cannot fetch JOJ Page.${err}`)
        console.log(err);
    }
}

const ConvertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
 };

async function get_sid() {
    const child = spawn("joj-auth");
    child.stdout.setEncoding('utf-8');
    child.stdin.setDefaultEncoding('utf-8');
    const captcha_panel = vscode.window.createWebviewPanel("code", "captcha", vscode.ViewColumn.One);
    child.stdout.on("data", async(data) => {
        console.log(data);
        if (data.indexOf("captcha")!=-1)
        {captcha_panel.webview.html =`<div   style="position:fixed;text-align:center;top:30%;left:10%"><textarea rows="30" cols="100" readonly="readonly" style="resize:none" >${data}</textarea></div>`
        var captcha_input = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            title: "Enter the CAPTCHA",
            prompt: "Please enter the captcha shown in the picture"
        });
        console.log(captcha_input);
        captcha_panel.dispose();
        var username_input = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            title: "Enter the jaccount username",
            prompt: "Please enter the jaccount username"
        });
        var password_input = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            title: "Enter the password",
            prompt: "Please enter the password",
            password:true
        });
        child.stdin.write(`${captcha_input}\n${username_input}\n${password_input}\n`);
    }

       
    })
    
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
