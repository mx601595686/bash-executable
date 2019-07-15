#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import chalk from 'chalk';

const languagePack = (function () {
    const env = process.env;
    const language = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES || '';

    if (language.toLowerCase().includes('zh_')) {
        return {
            help: `
用法：executable [options] [files]

例子：
    executable entrypoint.sh run.sh         为entrypoint.sh与run.sh添加执行权限

Options：
    -a                                      为仓库中所有bash文件添加执行权限
    -l                                      列出仓库中所有bash文件和可执行文件
    -f                                      找出仓库中所有没有执行权限的bash文件
            `.trim(),
            git_not_executable: 'git命令无法执行',
            add_execute_permission: '添加执行权限：',
            change_EOL: '修改EOL：'
        };
    } else {
        return {
            help: `
Usage：executable [options] [files]

Examples：
    executable entrypoint.sh run.sh         Add execute permission for entrypoint.sh and run.sh

Options：
    -a                                      Add execute permission to all bash files in the repository
    -l                                      List all bash files and executable files in the repository
    -f                                      Find all bash files in the repository that do not have execute permission
            `.trim(),
            git_not_executable: 'git command is not executable',
            add_execute_permission: 'Add execute permission：',
            change_EOL: 'Change EOL：'
        };
    }
})();

//检测git是否可用
function checkGit(): boolean {
    try {
        child_process.execFileSync('git', ['--version']);
        return true;
    } catch (error) {
        console.error(languagePack.git_not_executable, '\r\n', error);
        return false;
    }
}

//命令解析器
function commandParser() {
    const args = process.argv.slice(2);

    switch (args[0]) {
        case undefined:
        case '':
        case '-h':
        case '--help': {
            console.log(languagePack.help);
            break;
        }
        case '-f':
        case '-l': {
            const fileList = child_process.execFileSync('git', ['ls-files', '--stage', '--eol', '--full-name', ...args.slice(1)], { encoding: 'utf8' }).split('\n').filter(item => item);
            fileList.forEach(item => {
                const data = item.split(/\s/).filter(item => item);
                const isBash = item.endsWith('.sh');
                const executable = data[0].includes('7');
                const is_lf = !data[4].includes('crlf');
                if (isBash || executable) {
                    if (executable && is_lf) {
                        if (args[0] === '-l') console.log(item);
                    } else {
                        if (!executable)
                            item = item.replace(data[0], chalk.red.bgBlackBright.bold(data[0]));
                        if (!is_lf)
                            item = item.replace(data[4], chalk.red.bgBlackBright.bold(data[4]));

                        console.warn(chalk.yellow(item));
                    }
                }
            });
            break;
        }
        default: {
            if (args[0] === '-a') var is_a = args.shift();

            const rootPath = child_process.execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

            child_process.execFileSync('git', ['ls-files', '--stage', '--eol', '--full-name', ...args], { encoding: 'utf8' }).split('\n').filter(item => item).forEach(item => {
                const data = item.split(/\s/).filter(item => item);
                const isBash = !is_a || item.endsWith('.sh');
                const executable = data[0].includes('7');
                const not_lf = data[4].includes('crlf');

                if (executable || isBash) {
                    const filePath = path.resolve(rootPath, data[6]);

                    if (not_lf) {
                        const data = fs.readFileSync(filePath, { encoding: 'utf8' });
                        fs.writeFileSync(filePath, data.replace(/\r\n/g, '\n'));
                        console.log(languagePack.change_EOL, data[6]);
                    }

                    if (!executable) {
                        child_process.execFileSync('git', ['add', '--chmod=+x', filePath]);
                        console.log(languagePack.add_execute_permission, data[6]);
                    }
                }
            });
            break;
        }
    }
}

checkGit() && commandParser();