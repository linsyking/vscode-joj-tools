import * as vscode from 'vscode';

export class JOJProvider implements vscode.TreeDataProvider<JOJItem> {
  courses: { name: string; role: string; }[] = [{ name: "0", role: "1" }];
  homeworks: { name: string; }[] = [{ name: "0" }];
  questions: { name: string; }[] = [];
  constructor() { }

  private _onDidChangeTreeData: vscode.EventEmitter<JOJItem | undefined | null | void> = new vscode.EventEmitter<JOJItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<JOJItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: JOJItem): vscode.TreeItem {
    return element;
  }

  setData(courses?: { name: string; role: string; }[], homeworks?: { name: string; }[], questions?: { name: string; }[]) {
    if (courses) { this.courses = courses; }
    if (homeworks) { this.homeworks = homeworks; }
    if (questions) { this.questions = questions; }

  }

  getChildren(element?: JOJItem): Thenable<JOJItem[]> {
    // if (!this.sid) {
    //   vscode.window.showInformationMessage('No dependency in empty workspace');
    //   return Promise.resolve([]);
    // }

    if (element) {
      return Promise.resolve(element.children);
    } else {
      return Promise.resolve([new Course(this.courses[0].name,"dsa", vscode.TreeItemCollapsibleState.None)]);
    }
  }

}

class JOJItem extends vscode.TreeItem {
  children: JOJItem[] = [];
  constructor(
    public readonly name: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
  }
  addChild(element: JOJItem) {
    this.children.push(element);
  }

}


class Course extends JOJItem {
  constructor(
    public readonly name: string,
    private role: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name}-${this.role}`;
    this.description = this.role;
    this.iconPath = new vscode.ThemeIcon("book");
  }
  contextValue = "course";
}

class Homework extends JOJItem {
  constructor(
    public readonly name: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name}`;
    this.description = this.name;
    this.iconPath = new vscode.ThemeIcon("book");
  }
  contextValue = "homework";
}

class Question extends JOJItem {
  constructor(
    public readonly name: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = `${this.name}`;
    this.description = this.name;
    this.iconPath = new vscode.ThemeIcon("book");
  }
  contextValue = "question";
}

