import { existsSync, lstatSync, writeFile } from 'fs';
import * as _ from 'lodash';
import * as mkDirP from 'mkdirp';
import { join } from 'path';
import { commands, ExtensionContext, InputBoxOptions, OpenDialogOptions, QuickPickOptions, Uri, window } from 'vscode';
import { getComponentTemplate, getStyledComponentTemplate, getStylesheetTemplate, getStyledFunctionalComponentTemplate, getFunctionalComponentTemplate } from './templates';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('rgt.styledClassComponent', async (uri: Uri) => {
		const { componentName, targetDirectory } = await nameAndPath(uri);
		await generateFiles(componentName, targetDirectory, false, true, true);
	}));

	context.subscriptions.push(commands.registerCommand('rgt.styledClassComponentCSS', async (uri: Uri) => {
		const { componentName, targetDirectory } = await nameAndPath(uri);
		await generateFiles(componentName, targetDirectory, false, true, false);
	}));

	context.subscriptions.push(commands.registerCommand('rgt.styledFunctionalComponent', async (uri: Uri) => {
		const { componentName, targetDirectory } = await nameAndPath(uri);
		await generateFiles(componentName, targetDirectory, true, true, true);
	}));

	context.subscriptions.push(commands.registerCommand('rgt.styledFunctionalComponentCSS', async (uri: Uri) => {
		const { componentName, targetDirectory } = await nameAndPath(uri);
		await generateFiles(componentName, targetDirectory, true, true, false);
	}));

	context.subscriptions.push(commands.registerCommand('rgt.generateComponent', async (uri: Uri) => {
		const { componentName, targetDirectory } = await nameAndPath(uri);
		const isFunctional = (await promptForIsFunctional()) === 'yes (default)';
		const withStylesheet = (await promptForWithStylesheet()) === 'yes (default)';
		const useSCSS = withStylesheet && (await promptForUseSCSS()) === 'SCSS (default)';

		await generateFiles(componentName, targetDirectory, isFunctional, withStylesheet, useSCSS);
	}));
}

async function generateFiles(
	componentName: string,
	targetDirectory: string,
	isFunctional: boolean,
	withStylesheet: boolean,
	useSCSS: boolean
) {
	try {
		await generateComponentCode(componentName, targetDirectory, isFunctional, withStylesheet, useSCSS);
		window.showInformationMessage(`Successfully Generated ${componentName} Component`);
	}
	catch (error) {
		window.showErrorMessage(`Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`);
	}
}

async function generateComponentCode(
	componentName: string,
	targetDirectory: string,
	isFunctional: boolean,
	withStylesheet: boolean,
	useSCSS: boolean
) {
	const componentPath = join(targetDirectory, componentName);

	if (!existsSync(componentPath)) {
		await mkDirP(componentPath);
	}

	componentName = componentName.split('/').pop() as string;

	const tasks = [];

	if (withStylesheet) {
		tasks.push(createStyledComponentTemplate(componentName, componentPath, isFunctional, useSCSS));
		tasks.push(createStylesheetTemplate(componentName, componentPath, useSCSS));
	} else {
		tasks.push(createComponentTemplate(componentName, componentPath, isFunctional));
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

async function createComponentTemplate(componentName: string, targetDirectory: string, isFunctional: boolean) {
	const targetPath = `${targetDirectory}/${componentName}.tsx`;
	if (existsSync(targetPath)) {
		throw Error(`${componentName}.tsx already exists`);
	}

	return new Promise(async (resolve, reject) => {
		writeFile(
			targetPath,
			isFunctional ? getFunctionalComponentTemplate(componentName) : getComponentTemplate(componentName),
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


async function createStyledComponentTemplate(
	componentName: string,
	targetDirectory: string,
	isFunctional: boolean,
	useSCSS: boolean
) {
	const targetPath = `${targetDirectory}/${componentName}.tsx`;
	if (existsSync(targetPath)) {
		throw Error(`${componentName}.tsx already exists`);
	}

	return new Promise(async (resolve, reject) => {
		writeFile(
			targetPath,
			isFunctional ? getStyledFunctionalComponentTemplate(componentName, useSCSS) : getStyledComponentTemplate(componentName, useSCSS),
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

async function nameAndPath(uri: Uri) {
	const componentName = await promptForComponentName();

	let targetDirectory = uri.fsPath;
	if (_.isNil(_.get(uri, 'fsPath')) || !lstatSync(uri.fsPath).isDirectory()) {
		targetDirectory = await promptForTargetDirectory();
	}

	return { componentName, targetDirectory };
}

async function promptForComponentName(): Promise<string> {
	const componentNamePromptOptions: InputBoxOptions = {
		prompt: 'Component Name',
		placeHolder: 'Counter',
	};
	const name = await window.showInputBox(componentNamePromptOptions);
	if (_.isNil(name) || name.trim() === '') {
		throw Error('The component name must not be empty');
	}
	return name;
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

async function promptForIsFunctional(): Promise<string | undefined> {
	const isFunctionalValues: string[] = ['yes (default)', 'no (class-based)'];
	const isFunctionalOptions: QuickPickOptions = {
		placeHolder:
			'Do you want a functional component?',
		canPickMany: false
	};
	return window.showQuickPick(
		isFunctionalValues,
		isFunctionalOptions
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

async function promptForTargetDirectory(): Promise<string> {
	const options: OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Select a folder to create the component in',
		canSelectFolders: true,
	};

	const targetDirectory = await window.showOpenDialog(options).then(uri => {
		if (_.isNil(uri) || _.isEmpty(uri)) {
			return undefined;
		}
		return uri[0].fsPath;
	});

	if (_.isNil(targetDirectory)) {
		throw Error('Please select a valid directory');
	}

	return targetDirectory;
}

// this method is called when your extension is deactivated
export function deactivate() { }
