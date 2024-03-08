# JOJ Tools

VSCode JOJ Tools Integration.

[中文版README](https://github.com/Hydraallen/vscode-joj-tools/blob/main/README_zh_CN.md)

## Features

- View courses, homework and questions
- View question details
- Submit questions
- Submit homework
- View submission details

## Installation

Install it through VS Code Extension Market.

You also need to install [Python3](https://www.python.org/) and pip3 beforehand if you haven't. If you use Windows, please add python scripts to PATH while installing python.

## Usage

Open your homework folder where the code to submit is. Then use the extension to run your code.

## Known Bugs

### Old version packages

Please first make sure your `joj-submittor` and `ji-auth` is the latest version:

```bash
ji-auth --version
joj-submit --version
```

Otherwise, please first uninstall them first then run the extension. The extension will install the latest version for you.

Uninstallion command:

```bash
# On Windows/MacOS
pip3 uninstall ji-auth joj-submitter

# On linux
pipx uninstall ji-auth joj-submitter
```

If the extension tells you that `Failed to install XXX`, you can run the command in your terminal and see what's going on. The goal is to install those two python packages.

### Mismatched version of pip3 and Python3.

Mismatched version of pip3 and Python3 may leads to installation failure of `ji-auth` and `joj-submitter`.

Please first check the Python version installed on your computer with commands:

```bash
python3 -V
```

It will show the version of Python like: `Python 3.a.b`.

Then check the pip version installed on your computer with commands:

```bash
pip3 -V
```

It will first show the version and path of pip. At the end, it will show the corresponding Python version like `(python 3.a)`, which should match the python version above.

If it doesn't match, please reinstall pip3.

### Related to MacOS

If you are using MacOS after Big Sur, it is possible that your VSCode may not be connected to the shell properly. Here is the solution:

1. Uninstall `joj-tools` in VSCode and **quit** VSCode.
2. Make sure your `joj-submittor` and `ji-auth` is the latest version.
3. Try `ji-auth joj` in the terminal and finish the login in part by entering your jaccount.
4. Open VSCode and install `joj-tools` again.
5. Click the buttom of `JOJ` and login in.

## Acknowledgement

- [JOJ Submitter](https://github.com/BoYanZh/JOJ-Submitter)
- [JI Auth](https://github.com/BoYanZh/JI-Auth)
