// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function divide_file(editor){
	// Get the content of the active file
	const document = editor.document;
	const content = document.getText();
	const lines = content.split('\n'); 

	functions = []
	temp_function = ""; 

	line_numbers = []; 
	let prev = 1;
	
	for(let i=0;i<lines.length;++i){
		const line  = lines[i]; 
		console.log(line)

		if(line.includes("def") || line.includes("__name__")){ 
			functions.push(temp_function);  
			line_numbers.push([prev,i]);
			prev = i+1;
			temp_function = "";
		}
		
		if(temp_function.length){
			temp_function += '\n'+line;
		} else{
			temp_function = line;
		}
	} 

	functions.push(temp_function);
	line_numbers.push([prev,lines.length]);


	return {file_parts:functions,line_numbers:line_numbers};
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "summarizer" is now active!');
 
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('summarizer.helloWorld', function () {
		// The code you place here will be executed every time your command is executed 

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const {file_parts,line_numbers} = divide_file(editor);
			 

			for(let i=0;i<file_parts.length;++i){
				console.log(`Part ${i+1}`); 
				console.log(`From ${line_numbers[i][0]} to ${line_numbers[i][1]}`); 
				console.log(file_parts[i]);
			} 
			const customLines = [
				{ line: '#Custom line 1\n#Custom lines custom lines\n#custom lines'},
				{ line: '#Custom line 2\n#Custom lines custom lines\n#custom lines'}, 
				{ line: '#Custom line 3\n#Custom lines custom lines\n#custom lines'},  
				{ line: '#Custom line 4\n#Custom lines custom lines\n#custom lines'}, 
				{ line: '#Custom line 5\n#Custom lines custom lines\n#custom lines'}
			];
			
			// Create a TextEditorEdit object to make changes to the editor
			const edit = new vscode.WorkspaceEdit(); 

			for(let i=0;i<customLines.length;++i){
				let prev = 0; 
				if(i-1>=0){
					prev = line_numbers[i-1][1];
				}
				edit.insert(document.uri, new vscode.Position(prev, 0), customLines[i].line + '\n');
			}
			
			// Apply the edit to the editor
			vscode.workspace.applyEdit(edit);
		}
		
	
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from AMAN BEDI v1.2');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
