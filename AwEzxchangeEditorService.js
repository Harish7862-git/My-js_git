// Copyright (c) 2021 Siemens
 
/**
 * @module js/AwEzxchangeEditorService
 */
import _ from 'lodash';
import MonacoEditor from 'react-monaco-editor';
 
export const srcEditorConfigUpdate = (editorRef, update, config, value, monacoConfig) => {
    let fileConfig = Object.assign({}, config);
 
    if (!fileConfig.editorValue) {
        fileConfig.editorValue = monacoConfig?.editorValue;
    }
 
    const content = _.isObject(value) ? { ...value } : value;
    const defaultConfig = {
        language: 'text',
        options: {
            domReadOnly: true, // setting domReadonly=true adds a DOM attribute of readOnly when the editor is ready only.
            readOnly: false,
            wordWrap: 'off',
            lineNumbers: 'on',
            automaticLayout: false,
            minimap: {},
            fontFamily: 'monospace'
        }
    };
    const fileTypeLanguageMap = {
        js: 'javascript',
        txt: 'text',
        ts: 'typescript'
    };
    if (monacoConfig?.defaultValue) {
        fileConfig.defaultValue = monacoConfig?.defaultValue;
    }
 
    fileConfig = _.defaultsDeep(fileConfig, defaultConfig);
    if (config && content && !_.isEmpty(config) && !_.isEmpty(content)) {
        const fileContent = content.data ? content.data : content;
        const fileType = content.config && content.config.url ? content.config.url.split('.').pop() : null;
        fileConfig.language = fileType && fileTypeLanguageMap[fileType.toLowerCase()] !== undefined ? fileTypeLanguageMap[fileType] : fileType || monacoConfig?.language || config.language;
        fileConfig.height = config.height ? config.height + 'px' : 'inherit';
        fileConfig.width = config.width ? config.width + 'px' : 'inherit';
        fileConfig.theme = config.theme;
        if (!monacoConfig?.defaultValue || fileContent !== monacoConfig?.editorValue) {
            fileConfig.defaultValue = fileType === 'json' && _.isObject(fileContent) ? JSON.stringify(fileContent, null, 4) : fileContent;
            fileConfig.editorValue = fileConfig.defaultValue;
        }
 
        if (value !== fileConfig.editorValue) {
            if (typeof update === 'function') {
                update(fileConfig.editorValue);
            }
            fileConfig.value = fileConfig.editorValue;
        } else if (editorRef && value !== monacoConfig?.renderValue) {
            const editorModels = editorRef?.getModels();
            let currentModel;
            if (editorModels.length === 1) {
                currentModel = editorModels[0];
            } else {
                for (const model of editorModels) {
                    if (model._languageId === fileConfig.language) {
                        currentModel = model;
                        break;
                    }
                }
            }
            currentModel.setValue(fileConfig.editorValue);
        }
    }
    fileConfig.renderValue = fileConfig.editorValue || monacoConfig?.renderValue;
    return fileConfig;
};
 
// The main Monaco Editor render function
export const awSourceEditorRenderFunction = (props) => {
    const { name, viewModel } = props;
    const monacoConfig = viewModel.data.monacoConfig;
 
    const handleSelectionChange = (editor) => {
        const selection = editor.getSelection(); // Get the current selection
        const selectionState = {
            startLineNumber: selection.startLineNumber,
            endLineNumber: selection.endLineNumber,
        };
        viewModel.dispatch({ path: 'data.selectedContents', value: selectionState });
    };
 
    const mount = (editorRef, monaco) => {
        viewModel.dispatch({ path: 'data.monacoEditorInstance', value: monaco.editor });
        viewModel.dispatch({ path: 'data.referenceEditor', value: editorRef });
        viewModel.dispatch({ path: 'data.monaco', value: monaco });
 
        // Ensure Monaco editor is ready and valid
        /* const editorInstance = monaco.editor;
        if (editorInstance && editorInstance.constructor.name === 'IStandaloneCodeEditor') {
            console.log('Monaco Editor is valid and ready.');
 
            // Example: Set markers for highlighting
            const markers = [
                {
                    severity: monaco.MarkerSeverity.Info, // You can also use Error or Warning
                    startLineNumber: 2,   // Start of the range
                    startColumn: 1,       // Start of the range (column)
                    endLineNumber: 3,     // End of the range
                    endColumn: 10,        // End of the range (column)
                    message: 'This is a custom highlight',
                    code: 'highlight-01', // Custom code for tracking
                },
            ];
 
            // Set markers to the model
            editorInstance.setModelMarkers(editorInstance.getModel(), 'owner', markers);
        } else {
            console.error('Monaco Editor instance is invalid or not ready.');
        } */
 
        // Handle other editor events as needed
        editorRef.onDidChangeCursorSelection(() => handleSelectionChange(editorRef));
    };
 
    const onChange = (newContents, e) => {
        if (typeof props?.update === 'function') {
            props?.update(newContents);
        }
        monacoConfig.editorValue = newContents;
        monacoConfig.renderValue = newContents === '' ? 'null' : newContents;
    };
 
    return monacoConfig?.renderValue && (
        <MonacoEditor
            editorDidMount={mount}
            {...monacoConfig}
            onChange={onChange}
        ></MonacoEditor>
    );
};
 