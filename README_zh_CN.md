# JOJ Tools

[English version](https://github.com/Hydraallen/vscode-joj-tools/blob/main/README.md)

## 功能

- 查看课程、作业和问题
- 查看问题详情
- 提交问题
- 提交作业
- 查看提交详情

## 安装

通过 VS Code 插件市场进行安装。

请提前安装 [Python3](https://www.python.org/) 和 pip3。如果您使用的是 Windows，请在安装 Python 时将 Python 脚本添加到 PATH。

## 使用说明

打开包含要提交代码的作业文件夹，然后使用该扩展提交代码。

## 已知问题

### 旧版本软件包

请首先确保您的 `joj-submittor` 和 `ji-auth` 是最新版本。

```bash
ji-auth --version
joj-submit --version
```

如果之前安装有旧版本的请先卸载它们，然后运行扩展。扩展将为您安装最新版本。

卸载指令：

```bash
# On Windows/MacOS
pip3 uninstall ji-auth joj-submitter

# On linux
pipx uninstall ji-auth joj-submitter
```

如果在VSCode内部安装过程中 `Failed to install XXX`, 可以尝试在终端中手动安装。目标是要安装这两个 python包。

### pip3 和 Python3 版本不一致。

pip3 和 Python3 版本不一致可能导致 `ji-auth` 和 `joj-submitter` 安装失败。

请首先使用以下命令检查计算机上安装的 Python 版本：

```bash
python3 -V
```

它将显示 Python 的版本，如：`Python 3.a.b`。

然后使用以下命令检查计算机上安装的 pip 版本：

```bash
pip3 -V
```

它将首先显示 pip 的版本和路径。最后，它将显示相应的 Python 版本，如 `(python 3.a)`，这里的版本应该与上面的 Python 版本匹配。

如果不匹配，请重新安装 pip3。

#### MacOS 相关

如果您使用 Big Sur 之后的 MacOS版本，您的 VSCode 可能无法正确连接到 shell。以下是解决方案：

1. 卸载 VSCode 中的 `joj-tools` 并**退出** VSCode。
2. 确保您的 `joj-submittor` 和 `ji-auth` 是最新版本。
3. 在终端中试用 `ji-auth joj` 并输入您的 jaccount 完成登录。
4. 打开 VSCode 并再次安装 `joj-tools`。
5. 点击 "JOJ "按钮并登录。

## 致谢

- [JOJ Submitter](https://github.com/BoYanZh/JOJ-Submitter)
- [JI Auth](https://github.com/BoYanZh/JI-Auth)
