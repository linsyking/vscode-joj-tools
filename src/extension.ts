// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const jsdom = require('jsdom');
const axios = require('axios').default;
const isWindows = () => Boolean(vscode.env.appRoot && vscode.env.appRoot[0] !== "/");
import { spawn } from "child_process";
import { JOJProvider, Course, Homework, Question } from './JOJDataProvider';
import { check_init, LocalStorageService } from './Config';
import { compress } from './Compress';
import { submit_code } from './JOJBackend';
import { join } from 'path';
import { rm } from 'fs';
import { dumpJOJTree, loadJOJTree } from './Serializer';

var dealing_queue: Question[] = [];
var joj_tree: JOJProvider;
var local_storage: LocalStorageService;
var user_sid: string;

export function activate(context: vscode.ExtensionContext) {
    check_init();

    local_storage = new LocalStorageService(context.globalState);

    const course_tree = new JOJProvider();
    joj_tree = course_tree; // Global Reference

    precheck_sid();
    if (user_sid) {
        const cache = local_storage.getValue("joj_tree");
        if (cache) {
            // User has cache, use cache
            loadJOJTree(String(cache), joj_tree);
            joj_tree.refresh();
        } else {
            load_page(get_home_page);
        }
    }

    let disposable = vscode.commands.registerCommand('joj-tools.refresh', function () {
        course_tree.clean();
        load_page(get_home_page);
    });
    context.subscriptions.push(disposable);

    vscode.window.registerTreeDataProvider("joj-tree", course_tree);

    vscode.commands.registerCommand('joj-tools.submithomework', function (homework: Homework) {
        // Add the queue
        if (homework.children.length == 0) {
            vscode.window.showErrorMessage("Please first fetch the question list.");
            return;
        }
        (async () => {
            const lang = await ask_lang();
            if (!lang) {
                return;
            }
            const dq_length = dealing_queue.length;
            homework.children.forEach((child: any) => {
                if (!is_in_queue(child)) {
                    child.lang = lang;
                    dealing_queue.push(child);
                    child.changeIcon("sync");
                }
            })
            joj_tree.refresh();
            if (dq_length != 0) {
                return;
            } else {
                load_page(comp_submit, dealing_queue[0], "Submitting Code")
            }
        })();
    });

    vscode.commands.registerCommand('joj-tools.submitquestion', function (question: Question) {
        if (is_in_queue(question)) {
            vscode.window.showWarningMessage("Already in the queue");
            return;
        } else {
            dealing_queue.push(question);
        }
        if (dealing_queue.length > 1) {
            vscode.window.showInformationMessage("Added to the waiting queue");
            (async () => {
                const lang = await ask_lang();
                if (!lang) {
                    del_queue(question);
                    return;
                }
                question.lang = lang;
                question.changeIcon("sync");
                joj_tree.refresh();
            })();
            return;
        }
        question.lang = undefined;
        load_page(comp_submit, question, "Submitting Code");
    });

    vscode.commands.registerCommand('joj-tools.reedit', function () {
        get_sid();
    });

    vscode.commands.registerCommand('joj-tools.viewquestion', function (question) {
        // Show the question details
        show_detail_page(question);
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

async function show_detail_page(question: Question) {
    const page = await http_get(question.url);
    const dom = new jsdom.JSDOM(page.data);
    var p_detail = dom.window.document.querySelector(".section__body").outerHTML;
    const detail_panel = vscode.window.createWebviewPanel("details", "Question Details", vscode.ViewColumn.One);
    detail_panel.webview.html = p_detail;
}

async function ask_lang() {
    const lang = await vscode.window.showQuickPick([
        "c", "cc", "llvm-c", "llvm-cc", "cmake", "make", "ocaml", "matlab", "cs", "pas", "java", "py", "py3", "octave", "php", "rs", "hs", "js", "go", "rb", "other"
    ], { title: "Choose the language" });
    if (!lang) {
        vscode.window.showWarningMessage("Submission aborted");
        return;
    }
    return lang;
}

async function comp_submit(question: Question) {
    const myfolder = vscode.workspace.workspaceFolders;
    if (!myfolder) {
        // Give up
        vscode.window.showErrorMessage("Not in a folder!");
        return;
    }
    var dir = myfolder[0].uri.path;
    if (isWindows()) {
        dir = dir.substring(1);
    }
    var lang;
    if (question.lang) {
        lang = question.lang;
    } else {
        lang = await ask_lang();
        if (!lang) {
            del_queue(question);
            return;
        }
        question.lang = lang;
    }
    console.log(dir);
    await compress(dir);
    question.changeIcon("sync");
    joj_tree.refresh();
    const opt = await submit_code(question.url, join(dir, "../a.zip"), String(lang), user_sid);
    try {
        var opt_obj = JSON.parse(String(opt));
        if (opt_obj.status != "Accepted") {
            vscode.window.showErrorMessage(`${question.name} not passed, please see the details.`)
            const info_panel = vscode.window.createWebviewPanel("details", "Submission Details", vscode.ViewColumn.One);
            info_panel.webview.html = parse_result(question, opt_obj);
        } else {
            vscode.window.showInformationMessage(`${question.name} Accepted`)
        }
    } catch (error) {
        vscode.window.showErrorMessage(String(opt));
    }

    // Remove zip
    rm(join(dir, "../a.zip"), () => { });
    // Delete item in queue
    del_queue(question);
    // Upload Question
    question.homework.killChildren();
    await get_homework_page(question.homework);
    joj_tree.refresh();
    save_joj_tree();
    if (dealing_queue.length > 0) {
        // Still need to work
        await comp_submit(dealing_queue[0]);
    }
}

function parse_result(question: Question, obj: any) {

    try {
        var details = obj.details;
        var details_txt = "";
        details.forEach((tc: any, index: any) => {
            if (tc.status == "Accepted") {
                return;
            }
            if (question.lang == "matlab") {
                const pos = tc.out.indexOf("com.") + 4;
                tc.out = tc.out.substring(pos).trim();
                tc.ans = tc.ans.substring(pos).trim();
            }
            details_txt += `<h3>Test Case ${index + 1}</h3>
            <h4>Summary</h4>
            <p>Status: ${tc.status}</p>
            <h4>Details</h4>
            <p>
                Out:
                <pre>${tc.out}</pre>
            </p>
            <p>
                Ans:
                <pre>${tc.ans}</pre>
            </p>`
        });


        var html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>${question.name}</h1>
            <p><a href="${question.url}">URL</a></p>
            <h2>Summary</h2>
            <p>Status: ${obj.status}</p>
            <p>Accepted Count: ${obj.accepted_count}</p>
            <p>Score: ${obj.score}</p>
            <p>Total Time: ${obj.total_time}</p>
            <p>Peak Memory: ${obj.peak_memory}</p>
            <h2>Compiler Text</h2>
            <pre>${obj.compiler_text}</pre>
            <h2>Failed cases</h2>
            ${details_txt}
        </body>
        </html>`
        return html;
    } catch (e) {
        return "";
    }
}

function set_refresh_homework(homework: Homework) {
    // Set All refresh
    homework.children.forEach((hk) => {
        dealing_queue.forEach((e: Question) => {
            if (e.url == hk.url) {
                hk.changeIcon("sync");
            }
        })
    })

}

function is_in_queue(question: Question) {
    var flag = false;
    dealing_queue.forEach((e: Question) => {
        if (e.url == question.url) {
            flag = true;
        }
    })
    return flag;
}

function del_queue(question: Question) {
    dealing_queue.forEach((e, i, arr) => {
        if (e.url == question.url) {
            arr.splice(i, 1);
        }
    })
    return;
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
        if (homeworks.length == 0) {
            // TODO: Claim the homework automatically
            vscode.window.showWarningMessage("Please first claim the homework!");
        }
        for (let i = 1; i < homeworks.length; i++) {
            const hwk = homeworks[i];
            const title = hwk.querySelectorAll("td")[2].textContent.substring(20).trim();
            const url = hwk.querySelectorAll("td")[2].querySelector("a").href;
            const status = hwk.querySelectorAll("td")[0].textContent.trim();
            homework.addQuestion(title, trim_url(url), status);
        }
        set_refresh_homework(homework);
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
        var courses = dom.window.document.querySelectorAll(".homework__title");
        for (let i = 0; i < courses.length; i++) {
            const ele = courses[i];
            const url = ele.querySelector('a').href;
            const title = ele.textContent;
            const homework = course.addHomework(title, trim_url(url));
            await get_homework_page(homework);
        }
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
            const tmp_course = joj_tree.addCourse(name, role, trim_url(href));
            await get_course_page(tmp_course);
        }
        joj_tree.refresh();
        save_joj_tree();
    } catch (err) {
        vscode.window.showErrorMessage(`Cannot fetch JOJ Page.${err}`)
        console.log(err);
    }
}

async function get_sid(last_username?: string, last_password?: string) {
    const child = spawn("ji-auth", ["joj", "--disable-mask"]);
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdin.setDefaultEncoding('utf-8');
    const captcha_panel = vscode.window.createWebviewPanel("code", "captcha", vscode.ViewColumn.One);
    var username_input: string | undefined;
    var password_input: string | undefined;
    child.stdout.on("data", async (data) => {
        if (data.indexOf("captcha") != -1) {
            captcha_panel.webview.html = `<div style="position:fixed;text-align:center;top:30%;left:10%"><pre>${data}</pre></div>`
            var captcha_input = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                title: "Enter the CAPTCHA",
                prompt: "Please enter the captcha shown in the picture"
            });
            captcha_panel.dispose();
            username_input = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                value: last_username,
                title: "Enter the jaccount username",
                prompt: "Please enter the jaccount username"
            });
            password_input = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                value: last_password,
                title: "Enter the password",
                prompt: "Please enter the password",
                password: true
            });
            child.stdin.write(`${captcha_input}\n${username_input}\n${password_input}\n`);
        } else {
            if (data.indexOf("Please") == -1) {
                user_sid = data.trim();
                local_storage.setValue("sid", user_sid);
                joj_tree.clean();
                vscode.window.showInformationMessage(`Welcome, ${username_input}`);
                load_page(get_home_page);
            }
        }
    })

    child.stderr.on("data", (data) => {
        console.log(data);
        if (data.indexOf("Please") != -1) {
            vscode.window.showErrorMessage("Something wrong with captcha, username or password! Please try again!");
            get_sid(username_input, password_input);
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


function save_joj_tree() {
    const result = dumpJOJTree(joj_tree);
    local_storage.setValue("joj_tree", result);
}

// This method is called when your extension is deactivated
export function deactivate() { }
