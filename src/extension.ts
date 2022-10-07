// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const jsdom = require('jsdom');
const axios = require('axios').default;

import { JOJProvider, Course, Homework, Question } from './JOJDataProvider';

var dealing_queue = [];
var joj_tree: JOJProvider;
var user_sid = "2c2cd83712259dc506aa45ec265eaa7ed2e261f5c3a4026a3a6cfaa564d80eba";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const course_tree = new JOJProvider();
    joj_tree = course_tree; // Global Reference

    load_page(get_home_page);

    let disposable = vscode.commands.registerCommand('joj-tools.refresh', function () {
        course_tree.clean();
        load_page(get_home_page);
    });
    context.subscriptions.push(disposable);

    vscode.window.registerTreeDataProvider("joj-tree", course_tree);

    vscode.commands.registerCommand('joj-tools.submithomework', function (homework) {
        vscode.window.showInformationMessage("We are still developing this function...");
    });

    vscode.commands.registerCommand('joj-tools.refreshhomework', function (course) {
        // Refresh all homework under one course
        course.killChildren();
        joj_tree.refresh();
        load_page(get_course_page, course, "Loading Homework");
    });

    vscode.commands.registerCommand('joj-tools.refreshquestion', function (homework) {
        // Refresh all homework under one course
        homework.killChildren();
        joj_tree.refresh();
        load_page(get_homework_page, homework, "Loading Question");
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

async function get_homework_page(homework: Homework) {
    try {
        const response = await http_get(homework.url);
        const dom = new jsdom.JSDOM(response.data);
        var homeworks = dom.window.document.querySelectorAll("tr");
        for (let i = 1; i < homeworks.length; i++) {
            const hwk = homeworks[i];
            const title = hwk.querySelectorAll("td")[2].textContent.substring(20).trim();
            const url = hwk.querySelectorAll("td")[2].querySelector("a").href;
            const status = hwk.querySelectorAll("td")[0].textContent.trim();
            homework.addQuestion(title, url, status);
        }
        joj_tree.refresh();
    } catch (err) {
        vscode.window.showErrorMessage(`Cannot fetch JOJ Page.${err}`)
        console.log(err);
    }
}

async function get_course_page(course: Course) {
    try {
        const response = await http_get(course.url);
        const dom = new jsdom.JSDOM(response.data);
        var courses = dom.window.document.querySelectorAll(".homework__title")
        courses.forEach((ele: any) => {
            const url = ele.querySelector('a').href;
            const title = ele.textContent;
            course.addHomework(title, trim_url(url));
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

async function get_sid() {
    const captcha_panel = vscode.window.createWebviewPanel("code", "captcha", vscode.ViewColumn.One);
    captcha_panel.webview.html = "The captcha is";
    var captcha_input = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: "Enter the CAPTCHA",
        prompt: "Please enter the captcha shown in the picture"
    });
    console.log(captcha_input);
    captcha_panel.dispose();
}

function load_page(playback: any, args?: any, prompt?: string) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        cancellable: false,
        title: prompt ? prompt : 'Loading JOJ',
    }, async (progress) => {
        progress.report({ increment: 0 });
        await playback(args);
        progress.report({ increment: 100 });
    });
}


// This method is called when your extension is deactivated
export function deactivate() { }
