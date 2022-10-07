// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const jsdom = require('jsdom');
const axios = require('axios').default;
import { spawn } from "child_process";
import { JOJProvider, Course, Homework } from './JOJDataProvider';
import { LocalStorageService } from './Config';

var dealing_queue = [];
var joj_tree: JOJProvider;
var local_storage: LocalStorageService;
var user_sid: string;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    local_storage = new LocalStorageService(context.workspaceState);

    const course_tree = new JOJProvider();
    joj_tree = course_tree; // Global Reference

    precheck_sid();
    if (user_sid) {
        load_page(get_home_page);
    }

    let disposable = vscode.commands.registerCommand('joj-tools.refresh', function () {
        course_tree.clean();
        load_page(get_home_page);
    });
    context.subscriptions.push(disposable);

    vscode.window.registerTreeDataProvider("joj-tree", course_tree);

    vscode.commands.registerCommand('joj-tools.submithomework', function (homework) {
        vscode.window.showInformationMessage("We are still developing this function...");
    });

    vscode.commands.registerCommand('joj-tools.reedit', function () {
        get_sid();
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

function precheck_sid() {
    var usid = local_storage.getValue("sid");
    if (usid) {
        user_sid = String(usid);
    } else {
        get_sid();
    }
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
    const child = spawn("joj-auth");
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdin.setDefaultEncoding('utf-8');
    const captcha_panel = vscode.window.createWebviewPanel("code", "captcha", vscode.ViewColumn.One);
    child.stdout.on("data", async (data) => {
        if (data.indexOf("captcha") != -1) {
            captcha_panel.webview.html = `<div   style="position:fixed;text-align:center;top:30%;left:10%"><textarea rows="30" cols="100" readonly="readonly" style="resize:none" >${data}</textarea></div>`
            var captcha_input = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                title: "Enter the CAPTCHA",
                prompt: "Please enter the captcha shown in the picture"
            });
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
                password: true
            });
            child.stdin.write(`${captcha_input}\n${username_input}\n${password_input}\n`);
        } else {
            if (data.indexOf("Please") == -1) {
                user_sid = data.trim();
                local_storage.setValue("sid", user_sid);
                load_page(get_home_page);
            }

        }

    })

    child.stderr.on("data", (data) => {
        if (data.indexOf("Please") != -1) {
            vscode.window.showErrorMessage("Something wrong with captcha,username or password! Please try again!");
            get_sid();
        }

    })

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
