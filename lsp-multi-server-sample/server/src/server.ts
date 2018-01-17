/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import {
	createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind, Position, WorkspaceChange
} from 'vscode-languageserver';

// Creates the LSP connection
let connection = createConnection(ProposedFeatures.all);
// Create a manager for open text documents

let documents = new TextDocuments();

// The workspace folder this server is operating on
let workspaceFolder: string;

documents.onDidOpen((event) => {
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Document opened: ${event.document.uri}`);
})
documents.listen(connection);

connection.onInitialize((params) => {
	workspaceFolder = params.rootUri;
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Started and initialize received`);
	return {
		capabilities: {
			textDocumentSync: {
				openClose: true,
				change: TextDocumentSyncKind.None
			},
			codeActionProvider: true,
			executeCommandProvider: {
				commands: [
					'lsp-mulit-server-sample.insertWorkspaceFolder'
				]
			}
		}
	}
});

connection.onExecuteCommand((params) => {
	if (params.command === 'lsp-mulit-server-sample.insertWorkspaceFolder') {
		const [uri, line] = params.arguments
		const workspaceChange = new WorkspaceChange()

		workspaceChange.getTextEditChange(uri).insert(Position.create(line, 0), `${workspaceFolder}\n`);
		connection.workspace.applyEdit(workspaceChange.edit);
	}
})
connection.onCodeAction((params) => {
	return [{
		title: 'Insert workspace folder name',
		command: 'lsp-mulit-server-sample.insertWorkspaceFolder',
		arguments: [params.textDocument.uri, params.range.start.line]
	}]
})
connection.listen();
