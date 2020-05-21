import { existsSync, lstatSync, writeFile } from 'fs';
import * as _ from 'lodash';
import * as mkDirP from 'mkdirp';
import { join } from 'path';
import { commands, ExtensionContext, InputBoxOptions, OpenDialogOptions, QuickPickOptions, Uri, window } from 'vscode';
import { getComponentTemplate, getStyledComponentTemplate, getStylesheetTemplate } from './templates';

export function activate(context: ExtensionContext) {
	console.log('\'react-generator-ts\' is now active!');

	let generateComponent = commands.registerCommand('react-generator-ts.generateComponent', async (uri: Uri) => {
		const componentName = await promptForComponentName();
		if (_.isNil(componentName) || componentName.trim() === '') {
			window.showErrorMessage('The component name must not be empty');
			return;
		}

		let targetDirectory;
		if (_.isNil(_.get(uri, 'fsPath')) || !lstatSync(uri.fsPath).isDirectory()) {
			targetDirectory = await promptForTargetDirectory();
			if (_.isNil(targetDirectory)) {
				window.showErrorMessage('Please select a valid directory');
				return;
			}
		} else {
			targetDirectory = uri.fsPath;
		}

		const withStylesheet = (await promptForWithStylesheet()) === 'yes (default)';
		let useSCSS = false;

		if (withStylesheet) {
			useSCSS = (await promptForUseSCSS()) === 'SCSS (default)';
		}

		try {
			await generateComponentCode(componentName, targetDirectory, withStylesheet, useSCSS);
			window.showInformationMessage(
				`Successfully Generated ${componentName} Component`
			);
		} catch (error) {
			window.showErrorMessage(
				`Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
			);
		}
	});

	context.subscriptions.push(generateComponent);
}

async function generateComponentCode(componentName: string, targetDirectory: string, withStylesheet: boolean, useSCSS: boolean) {
	const componentPath = join(targetDirectory, componentName);

	if (!existsSync(componentPath)) {
		await mkDirP(componentPath);
	}

	componentName = componentName.split('/').pop() as string;

	const tasks = [];

	if (withStylesheet) {
		tasks.push(createStyledComponentTemplate(componentName, componentPath, useSCSS));
		tasks.push(createStylesheetTemplate(componentName, componentPath, useSCSS));
	} else {
		tasks.push(createComponentTemplate(componentName, componentPath));
	}

	await Promise.all(tasks);
}

async function createStylesheetTemplate(componentName: string, targetDirectory: string, useSCSS: boolean) {
	const extension = useSCSS ? 'scss' : 'css';
	const targetPath = `${targetDirectory}/${componentName}.module.${extension}`;
	if (existsSync(targetPath)) {
		throw Error(`${componentName}.module.${extension} already exists!`);
	}

	return new Promise(async (resolve, reject) => {
		writeFile(
			targetPath,
			getStylesheetTemplate(componentName),
			"utf8",
			error => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			}
		);
	});
}

async function createComponentTemplate(componentName: string, targetDirectory: string) {
	const targetPath = `${targetDirectory}/${componentName}.tsx`;
	if (existsSync(targetPath)) {
		throw Error(`${componentName}.tsx already exists`);
	}

	return new Promise(async (resolve, reject) => {
		writeFile(
			targetPath,
			getComponentTemplate(componentName),
			"utf8",
			error => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			}
		);
	});
}


async function createStyledComponentTemplate(componentName: string, targetDirectory: string, useSCSS: boolean) {
	const targetPath = `${targetDirectory}/${componentName}.tsx`;
	if (existsSync(targetPath)) {
		throw Error(`${componentName}.tsx already exists`);
	}

	return new Promise(async (resolve, reject) => {
		writeFile(
			targetPath,
			getStyledComponentTemplate(componentName, useSCSS),
			"utf8",
			error => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			}
		);
	});
}


async function promptForComponentName(): Promise<string | undefined> {
	const componentNamePromptOptions: InputBoxOptions = {
		prompt: 'Component Name',
		placeHolder: 'Counter',
	};
	return window.showInputBox(componentNamePromptOptions);
}

async function promptForWithStylesheet(): Promise<string | undefined> {
	const useStylesheetPromptValues: string[] = ['yes (default)', 'no'];
	const useStylesheetPromptOptions: QuickPickOptions = {
		placeHolder:
			'Do you want to use a stylesheet?',
		canPickMany: false
	};
	return window.showQuickPick(
		useStylesheetPromptValues,
		useStylesheetPromptOptions
	);
}

async function promptForUseSCSS(): Promise<string | undefined> {
	const useSCSSPromptValues: string[] = ['SCSS (default)', 'CSS'];
	const useSCSSPromptOptions: QuickPickOptions = {
		placeHolder:
			'Do you want to use SCSS or CSS?',
		canPickMany: false
	};
	return window.showQuickPick(
		useSCSSPromptValues,
		useSCSSPromptOptions
	);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
	const options: OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Select a folder to create the component in',
		canSelectFolders: true,
	};

	return window.showOpenDialog(options).then(uri => {
		if (_.isNil(uri) || _.isEmpty(uri)) {
			return undefined;
		}
		return uri[0].fsPath;
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
