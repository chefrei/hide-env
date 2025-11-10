// Import necessary modules from the VS Code API and other libraries.
import * as vscode from 'vscode';
import { minimatch } from 'minimatch';
import * as path from 'path';

// This array will hold the glob patterns read from the .hide file.
let hidePatterns: string[] = [];

// Define the decoration type for hiding text.
// It uses a CSS-like style to make the text invisible and shows '******' instead.
const hideDecorationType = vscode.window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hides the original text
    after: {
        contentText: '******', // Displays this text after the hidden part
        color: '#888' // Sets the color of the placeholder text
    }
});

/**
 * This is the main function of the extension. It's called when the extension is activated.
 * @param context The extension context provided by VS Code.
 */
export async function activate(context: vscode.ExtensionContext) {
    // Find and read the .hide file to load the patterns on startup.
    await findAndReadHideFile();
    // Apply the decorations to all currently visible editors.
    updateAllVisibleEditors();

    // Register a listener that triggers when the active text editor changes.
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                // If there's a new active editor, apply decorations to it.
                applyDecorations(editor);
            }
        })
    );

    // Register a listener that triggers when the content of a text document changes.
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            // Check if the change happened in the currently active editor.
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                // Re-apply decorations to reflect the changes.
                applyDecorations(vscode.window.activeTextEditor);
            }
        })
    );

    // Create a file system watcher to monitor changes to any .hide file in the workspace.
    const watcher = vscode.workspace.createFileSystemWatcher('**/.hide');

    // A helper function to reload patterns and update editors.
    const reloadAndApply = async () => {
        await findAndReadHideFile();
        updateAllVisibleEditors();
    };

    // Register listeners for file watcher events.
    watcher.onDidChange(reloadAndApply); // When a .hide file is changed.
    watcher.onDidCreate(reloadAndApply); // When a .hide file is created.
    watcher.onDidDelete(reloadAndApply); // When a .hide file is deleted.

    // Add the watcher to the extension's subscriptions to ensure it's disposed of properly.
    context.subscriptions.push(watcher);
}

/**
 * Finds and reads the .hide file in the workspace to populate the hidePatterns array.
 */
async function findAndReadHideFile() {
    hidePatterns = []; // Clear existing patterns before reading again.

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        // If there's no open workspace, there's nothing to do.
        return;
    }

    // Search for .hide files in the workspace, excluding node_modules, and limit to 1 result.
    const hideFiles = await vscode.workspace.findFiles('**/.hide', '**/node_modules/**', 1);

    if (hideFiles.length === 0) {
        // If no .hide file is found, do nothing.
        return;
    }

    const hideFileUri = hideFiles[0];
    try {
        // Read the content of the found .hide file.
        const content = await vscode.workspace.fs.readFile(hideFileUri);
        const text = Buffer.from(content).toString('utf8');
        const lines = text.split(/\r?\n/);

        // Process each line to extract valid patterns.
        hidePatterns = lines
            .map(line => line.trim()) // Remove leading/trailing whitespace.
            .filter(line => line.length > 0 && !line.startsWith('#')); // Ignore empty lines and comments.

    } catch (error) {
        // If the file can't be read, fail silently to not disrupt the user.
    }
}

/**
 * Applies the hiding decorations to a given text editor based on the loaded patterns.
 * @param editor The text editor to apply decorations to.
 */
function applyDecorations(editor: vscode.TextEditor) {
    const document = editor.document;
    const filePath = document.fileName;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

    if (!workspaceFolder) {
        // If the file is not part of a workspace, clear decorations and exit.
        editor.setDecorations(hideDecorationType, []);
        return;
    }

    const relativePath = vscode.workspace.asRelativePath(filePath, false);
    const baseName = path.basename(filePath);

    // Determine if the current file should have its content hidden.
    let shouldHide = false;
    for (const pattern of hidePatterns) {
        // Mimic .gitignore behavior: if a pattern contains a slash, match it against the relative path.
        // Otherwise, match it against the file's base name.
        const matchTarget = pattern.includes('/') ? relativePath : baseName;
        const isMatch = minimatch(matchTarget, pattern, { dot: true });
        
        if (isMatch) {
            shouldHide = true;
            break; // Exit the loop as soon as a match is found.
        }
    }

    if (shouldHide) {
        const decorations: vscode.Range[] = [];
        const text = document.getText();
        const lines = text.split(/\r?\n/);

        // Iterate over each line to find values to hide.
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // This regex finds content that follows an equals sign (=) or a colon (:).
            const match = line.match(/(?:=|:)\s*(.*)/);
            
            if (match && match[1] !== undefined) {
                const originalValue = match[1];
                const valueStartIndexInLine = line.indexOf(originalValue);

                let valueToInspect = originalValue;
                // If the value ends with a comma (common in JSON), trim it for inspection.
                if (valueToInspect.endsWith(',')) {
                    valueToInspect = valueToInspect.slice(0, -1);
                }

                let startOffset = 0;
                let endOffset = 0;

                // Check for surrounding quotes and adjust offsets to not hide the quotes themselves.
                if ((valueToInspect.startsWith('"') && valueToInspect.endsWith('"')) || (valueToInspect.startsWith('‘') && valueToInspect.endsWith('’'))) {
                    startOffset = 1;
                    endOffset = 1;
                }

                const finalStartPos = valueStartIndexInLine + startOffset;
                const finalEndPos = valueStartIndexInLine + valueToInspect.length - endOffset;

                // Ensure the calculated range is valid before creating a decoration.
                if (finalStartPos < finalEndPos) {
                    const range = new vscode.Range(i, finalStartPos, i, finalEndPos);
                    decorations.push(range);
                }
            }
        }
        // Apply all found decorations to the editor.
        editor.setDecorations(hideDecorationType, decorations);
    } else {
        // If the file doesn't match any pattern, ensure no decorations are applied.
        editor.setDecorations(hideDecorationType, []);
    }
}

/**
 * A utility function to apply decorations to all currently visible text editors.
 */
function updateAllVisibleEditors() {
    vscode.window.visibleTextEditors.forEach(editor => {
        applyDecorations(editor);
    });
}

/**
 * This function is called when the extension is deactivated.
 * It's responsible for cleaning up any resources.
 */
export function deactivate() {
    // Clear all decorations from all visible editors to clean up the UI.
    vscode.window.visibleTextEditors.forEach(editor => {
        editor.setDecorations(hideDecorationType, []);
    });
}