import * as vscode from 'vscode';

export class JOJProvider implements vscode.TreeDataProvider<JOJItem> {
    courses: Course[] = [];
    constructor() { }

    private _onDidChangeTreeData: vscode.EventEmitter<JOJItem | undefined | null | void> = new vscode.EventEmitter<JOJItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<JOJItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: JOJItem): vscode.TreeItem {
        return element;
    }

    clean() {
        this.courses = []
    }

    addCourse(name: string, role: string, cid: string) {
        var t_course = new Course(name, role, cid);
        this.courses.push(t_course);
        return t_course
    }

    getChildren(element?: JOJItem): Thenable<JOJItem[]> {
        if (element) {
            return Promise.resolve(element.children);
        } else {
            return Promise.resolve(this.courses);
        }
    }

}

export class JOJItem extends vscode.TreeItem {
    url: string = "";
    children: JOJItem[] = [];
    constructor(
        public readonly name: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(name, collapsibleState);
    }
    protected addChild(element: JOJItem) {
        this.children.push(element);
    }
    killChildren() {
        this.children = [];
    }
    changeIcon(icon_name: string) {
        this.iconPath = new vscode.ThemeIcon(icon_name);
    }
}


export class Course extends JOJItem {
    constructor(
        public readonly name: string,
        private role: string,
        private cid: string
    ) {
        super(name, vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = `${this.name}-${this.role}`;
        this.description = this.role;
        this.iconPath = new vscode.ThemeIcon("folder");
        this.url = `https://joj.sjtu.edu.cn/d/${cid}/homework`
    }

    addHomework(name: string, hid: string) {
        var homework = new Homework(name, this.cid, hid, this);
        this.addChild(homework);
        return homework;
    }

    contextValue = "course";
}

export class Homework extends JOJItem {
    constructor(
        public readonly name: string,
        private cid: string,
        private hid: string,
        public readonly course: Course
    ) {
        super(name, vscode.TreeItemCollapsibleState.Expanded);
        this.tooltip = `${this.name}`;
        this.iconPath = new vscode.ThemeIcon("file");
        this.url = `https://joj.sjtu.edu.cn/d/${cid}/homework/${this.hid}`
    }
    addQuestion(name: string, qid: string, status: string) {
        var question = new Question(name, this.cid, this.hid, qid, status, this);
        this.addChild(question);
        return question;
    }
    contextValue = "homework";
}

export class Question extends JOJItem {
    lang: string | undefined;
    constructor(
        public readonly name: string,
        private cid: string,
        private hid: string,
        private qid: string,
        private status: string,
        public readonly homework: Homework
    ) {
        super(name, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.name}`;
        var icon_style = "";
        switch (status) {
            case "Accepted":
                icon_style = "check";
                break;
            case "No Submissions":
                icon_style = "circle-filled";
                break;
            case "Running":
                icon_style = "repo-sync";
                break;
            default:
                icon_style = "close";
                break;
        }
        this.iconPath = new vscode.ThemeIcon(icon_style);
        this.url = `https://joj.sjtu.edu.cn/d/${cid}/homework/${this.hid}/${this.qid}`
    }

    setLang(lang: string) {
        this.lang = lang;
    }
    contextValue = "question";
}

