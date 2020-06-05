#!/usr/bin/env node

const prompts = require('prompts');
const path = require('path');
const chalk = require('chalk');
const semver = require('semver');
const fs = require('fs-extra');
const packageTemp = require('./packageTemp');
const sortPackageJson = require('sort-package-json');
const execShPromise = require('exec-sh').promise;
const finder = require('find-package-json');

const rootDirectory = path.join(getRootPackageJsonPath(), '..');
const targetParentDirectory = path.join(rootDirectory, '/packages');

let componentName = '',
    targetDirectory = '';
let packageConfig = packageTemp;

const questions = [
    {
        type: 'text',
        name: 'antdVersion',
        message: '请选择组件基于Antd哪个版本开发:',
        initial: '^4.2.4',
        validate: function (input) {
            return !!input || '该字段不能为空';
        }
    },
    {
        type: 'text',
        name: 'appName',
        message: '请输入组件名称(只能输入数字、字母和短横杠字符):',
        validate: function (input) {
            return /^[\w-]+$/.test(input) || '只能输入数字、字母和短横杠字符';
        }
    },
    {
        type: 'text',
        name: 'version',
        initial: '1.0.0',
        message: '请输入版本号:',
        validate: function (input) {
            return semver.valid(input) ? true : chalk.cyan(input) + ' 不是一个有效的版本号';
        }
    },
    {
        type: 'text',
        name: 'description',
        message: '请输入项目描述:',
        validate: function (input) {
            return !!input || '该字段不能为空';
        }
    }
];

function getRootPackageJsonPath() {
    try {
        const f = finder(process.cwd());
        let result;

        for (const v of f) {
            result = v.__path;
        }

        return result;
    } catch (error) {
        process.exit(1);
    }
}

async function setConfigWithAnswer() {
    try {
        const answers = await prompts(questions, {
            onCancel: () => {
                process.exit(1);
            }
        });

        const { appName, antdVersion, description, ...restAnswers } = answers;

        componentName = appName;
        targetDirectory = path.join(targetParentDirectory, componentName);

        const author = await getAuthor();

        Object.assign(packageConfig, restAnswers, {
            name: `@tiger-comp/${appName}`,
            author: `${author}@itiger.com`,
            description,
            peerDependencies: {
                ...packageTemp.peerDependencies,
                antd: `${antdVersion}`
            }
        });
    } catch (error) {
        console.log(error);
    }
}

async function getAuthor() {
    // npm whoami --registry http://r.npm.tigerfintech.com
    try {
        const out = await execShPromise('npm whoami --registry http://r.npm.tigerfintech.com', true);
        const result = out.stdout.replace(/(\n|\r)/, '');

        return result;
    } catch (e) {
        console.log('Error: ', e);
        console.log('Stderr: ', e.stderr);
        console.log('Stdout: ', e.stdout);

        return 'fed';
    }
}

async function copyTemplateFiles() {
    const templateDirectory = path.resolve(__dirname, '../template');

    try {
        await fs.copy(templateDirectory, targetDirectory);
    } catch (error) {
        console.error(`%s ${error}`, chalk.red.bold('ERROR'));

        process.exit(1);
    }
}

function writePackageJson() {
    const targetFilePath = path.join(targetDirectory, 'package.json');

    fs.ensureFileSync(targetFilePath);

    fs.writeFileSync(targetFilePath, sortPackageJson(JSON.stringify(packageConfig, null, 2)));
}

async function reaplaceParamInLicense() {
    const targetFilePath = path.join(targetDirectory, 'LICENSE');

    if (fs.pathExistsSync(targetFilePath)) {
        let data = fs.readFileSync(targetFilePath, 'utf8');
        const author = await getAuthor();
        const year = new Date().getFullYear();

        fs.outputFileSync(
            targetFilePath,
            data.replace(/\{author\}/g, `${author}@itiger.com`).replace(/\{year\}/g, year)
        );
    }
}

async function run() {
    await setConfigWithAnswer();

    await copyTemplateFiles();

    await reaplaceParamInLicense();

    writePackageJson();

    console.log(`%s ${componentName} component ready!`, chalk.green.bold('DONE'));
}

run();
