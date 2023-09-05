# JOJ Tools

VSCode JOJ Tools Integration.

## Features

- View courses, homework and questions
- View question details
- Submit questions
- Submit homework
- View submission details

## Installation

Install it through VS Code Extension Market.

You also need to install Python3 beforehand if you haven't. If you use Windows, please add python scripts to PATH while installing python.

## Usage

Open your homework folder where the code to submit is. Then use the extension to run your code.

## Known Bugs

Please first make sure your `joj-submittor` and `ji-auth` is the latest version.

Otherwise, please first uninstall them first then run the extension. The extension will install the latest version for you.

Uninstallion command:

```bash
# On Windows/MacOS
pip3 uninstall ji-auth joj-submitter

# On linux
pipx uninstall ji-auth joj-submitter
```

If the extension tells you that `Failed to install XXX`, you can run the command in your terminal and see what's going on. The goal is to install those two python packages.

## Acknowledgement

- [JOJ Submitter](https://github.com/BoYanZh/JOJ-Submitter)
- [JI Auth](https://github.com/BoYanZh/JI-Auth)
