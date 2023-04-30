// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');

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

function format(data,maxCharsPerLine=80){
	const words = data.split(' ');
	let line = '';
	const lines = [];
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		if (line.length + word.length <= maxCharsPerLine) {
		line += word + ' ';
		} else {
		lines.push('#'+line.trim());
		line = word + ' ';
		}
	}
	if (line.length > 0) {
		lines.push('#'+line.trim());
	}
	return lines.join('\n');
} 
// Function needs to modify to get a particular field
async function get_summary(code){ 
	// needs work
	// const options = {
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		'Authorization': 'Bearer <OPEN_API_KEY>'
	// 	  },
	// 	data: {
	// 		'model': 'gpt-3.5-turbo',
	// 		'messages':[{"role":"user","content":`summarize this code snippet \n${code}`}]
	// 	}		
	// }
	// try{
	// 	const response = await axios.post('https://api.openai.com/v1/chat/completions')  
	// 	console.log(response) 
	// } catch(err){
	// 	console.log(err)
	// } 
    // random api endpoint to get a text
	const {data} = await axios.get('https://baconipsum.com/api/?type=meat-and-filler&paras=1&format=text'); 
	return format(data);
} 
// Function needs to modify to get a particular field as of above function
function get_summaries(file){
	let promises = [] 

	for(let i=0;i<file.length;++i){
		promises.push(get_summary(file[i]));
	} 
	return Promise.all(promises);
}

/**
 * @param {vscode.ExtensionContext} context
 */
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "summarizer" is now active!');
 
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('summarizer.summarize', async function () {
		// The code you place here will be executed every time your command is executed 

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const {file_parts,line_numbers} = divide_file(editor);

			const summaries = await get_summaries(file_parts);

			// Create a TextEditorEdit object to make changes to the editor
			const edit = new vscode.WorkspaceEdit(); 

			for(let i=0;i<summaries.length;++i){
				let prev = 0; 
				if(i-1>=0){
					prev = line_numbers[i-1][1];
				}
				edit.insert(document.uri, new vscode.Position(prev, 0), summaries[i]+ '\n');
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
