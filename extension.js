const vscode = require('vscode');
const request = require("request");
var Etcd = require('node-etcd');
/**
 * @param {vscode.ExtensionContext} context
 */
var config = vscode.workspace.getConfiguration();
var etcd_pod = config.get("vscode.pod");

var etcd = new Etcd();
etcd = new Etcd();
etcd = new Etcd(etcd_pod);
 
function activate(context) {
	let command_get = vscode.commands.registerCommand('vscode-etcd.get', async function () {
		var etcd_url = vscode.workspace.getConfiguration().get("vscode.url");

		if (etcd_url.length == 0) {
			AddUrl();
			return;
		}

		vscode.window.showQuickPick(etcd_url)
		const selected_url = await vscode.window.showQuickPick(etcd_url, { placeHolder: 'Select the target url 🎯' });

		if(!selected_url) {
			vscode.window.showInformationMessage('Please, set etcd url. Or select it from list.');
			return;
		}

		request.get(selected_url + '/v2/getpath?key=', function(err, response, body) {
			vscode.workspace.openTextDocument({content: body}).then(document => {
				vscode.window.showTextDocument(document);
				vscode.languages.setTextDocumentLanguage(document, "json");
			});
			vscode.window.showInformationMessage(err);
		})
	});

	let command_update = vscode.commands.registerCommand('vscode-etcd.update', async function () {
		var etcd_pod = vscode.workspace.getConfiguration().get("vscode.pod");

		if (etcd_pod.length == 0) {
			AddPod();
			return;
		}

		vscode.window.showQuickPick(etcd_pod)
		const selected_pod = await vscode.window.showQuickPick(etcd_pod, { placeHolder: 'Select the target pod 🎯' });

		if(!selected_pod) {
			vscode.window.showInformationMessage('Please, set etcd pod. Or select it from list.');
			return;
		}

		etcd = new Etcd(selected_pod);
		vscode.window.showInformationMessage('Updating...');

		let data = vscode.window.activeTextEditor.document.getText();
		var json = JSON.parse(data);
		
		function traverse(object) {
			var item;
			for (var key in object) {
				item = object[key];
				if (key === 'value') {
					if(item){
						ETCDupdate(object['key'], item)
					}
				} else if (typeof item === 'object') {
					traverse(item);
				} else {
					vscode.window.showInformationMessage('Done!');
				}
				
			}
		}	  
		traverse(json);
		function ETCDupdate(key, value) {
			etcd.set(key, value);
		}
	});

	let command_url = vscode.commands.registerCommand('vscode-etcd.add-url', function () {
		AddUrl();
	});

	let command_pod = vscode.commands.registerCommand('vscode-etcd.add-pod', function () {
		AddPod();
	});

	function AddUrl() {
		var etcd_url = vscode.workspace.getConfiguration().get("vscode.url");
		vscode.window.showInputBox({ placeHolder: 'Enter your target url 😉' }).then(value => {
			if (!value) return;
			etcd_url.push(value);
			config.update("vscode.url", etcd_url, vscode.ConfigurationTarget.Global);
		});
	}

	function AddPod() {
		var etcd_pod = vscode.workspace.getConfiguration().get("vscode.pod");
		vscode.window.showInputBox({ placeHolder: 'Enter your target pod 🚀' }).then(value => {
			if (!value) return;
			etcd_pod.push(value);
			config.update("vscode.url", etcd_pod, vscode.ConfigurationTarget.Global);
		});
	}

	context.subscriptions.push(command_get, command_update, command_url, command_pod);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
