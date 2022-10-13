// Save and Load the course data

import * as vscode from "vscode";
import { JOJProvider } from "./JOJDataProvider";

export function loadJOJTree(jojTreeJson: string, jojRoot: JOJProvider) {
    // Load the JOJ Tree From Json and add them to jojRoot
    try {
        var courses_json = JSON.parse(jojTreeJson).courses;
        courses_json.forEach((course: any) => {
            var course_info = jojRoot.addCourse(course['name'], course['role'], course['cid']);
            course['children'].forEach((child: any) => {
                var homework = course_info.addHomework(child['name'], child['hid']);
                child['children'].forEach((question: any) => {
                    const que = homework.addQuestion(question.name, question.qid, question.status);
                    // que.changeIcon(question.icon);
                });
            });
        });
    } catch (error) {
        vscode.window.showErrorMessage("Cannot read cache!");
        console.log("Parsing error", error);
    }

}


export function dumpJOJTree(jojRoot: JOJProvider) {
    // TODO: Return the JSON String
    var js_obj: any = { courses: [] };
    for (var i = 0; i < jojRoot.courses.length; i++) {
        const jojcourse = jojRoot.courses[i];
        var course_obj: any = { name: "", cid: "", role: "", children: [] };
        course_obj["name"] = jojcourse.name;
        course_obj["cid"] = jojcourse.cid;
        course_obj["role"] = jojcourse.role;

        jojcourse.children.forEach((homework: any) => {
            var hw_obj: any = { name: "", hid: "", children: [] };
            hw_obj["name"] = homework.name;
            hw_obj["hid"] = homework.hid;
            homework.children.forEach((question: any) => {
                var ques_obj = { name: "", qid: "", status: "" };
                ques_obj["name"] = question.name;
                ques_obj["qid"] = question.qid;
                ques_obj["status"] = question.status;
                hw_obj.children.push(ques_obj);
            })

            course_obj.children.push(hw_obj);
        });
        js_obj.courses.push(course_obj);
    }
    const result = JSON.stringify(js_obj);
    return result;
}
