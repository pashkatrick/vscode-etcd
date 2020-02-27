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
	let command_get = vscode.commands.registerCommand('vscode-etcd.get', function () {
		var etcd_url = vscode.workspace.getConfiguration().get("vscode.url");
		if(!etcd_url) vscode.window.showInformationMessage('Please, set etcd url');
		request.get(etcd_url + '/v2/getpath?key=', function(err, response, body) {
			vscode.workspace.openTextDocument({content: body}).then(document => {
				vscode.window.showTextDocument(document);
				vscode.languages.setTextDocumentLanguage(document, "json");
			});
			vscode.window.showInformationMessage(err);
		})
	});

	let command_update = vscode.commands.registerCommand('vscode-etcd.update', function () {
		var etcd_pod = vscode.workspace.getConfiguration().get("vscode.pod");
		etcd = new Etcd(etcd_pod);
		vscode.window.showInformationMessage('Updating...');
		// ###
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
				}
			}
		}	  
		traverse(json);
		function ETCDupdate(key, value) {
			etcd.set(key, value);
		}
		// ###
		// vscode.window.showInformationMessage('Done!');
	});

	let command_url = vscode.commands.registerCommand('vscode-etcd.set-url', function () {
		vscode.window.showInputBox().then(value => {
			if (!value) return;
			config.update("vscode.url", value, vscode.ConfigurationTarget.Global);
		});
	});

	let command_pod = vscode.commands.registerCommand('vscode-etcd.set-pod', function () {
		vscode.window.showInputBox().then(value => {
			if (!value) return;
			config.update("vscode.pod", value, vscode.ConfigurationTarget.Global);
		});
	});

	context.subscriptions.push(command_get, command_update, command_url, command_pod);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
