// Copyright (c) 2022 Siemens

import _ from 'lodash';
import appCtxService from 'js/appCtxService';
import _awTableService from 'js/awTableService';
import _soaSvc from 'soa/kernel/soaService';
import uwPropertySvc from 'js/uwPropertyService';
import cdm from 'soa/kernel/clientDataModel';
import messageSvc from 'js/messagingService';
import eventBus from 'js/eventBus';
import AwPromiseService from 'js/awPromiseService';
import AwHttpService from 'js/awHttpService';
import fmsUtils from 'js/fmsUtils';
import browserUtils from 'js/browserUtils';
import modelPropSvc from 'js/modelPropertyService';
var exports = {};
/**
 * Function: fGetDebugLevel
 * Description: This function generates a list of debug levels with detailed properties for each level. 
 *              It can be used to populate a dropdown or for any other UI-related purpose.
 * 
 * Parameters:
 * @param {any} data - Input data that can be used for further processing which store entire object of this page
 * 
 * Returns:
 * @returns {Array} debugLevelList - An array of objects where each object represents a debug level with:
 *  - uid: A unique identifier (index in the array).
 *  - propDisplayValue: The display value for the debug level (e.g., "Error", "Warning").
 *  - dispValue: Same as propDisplayValue (can be used interchangeably).
 *  - propInternalValue: Internal value of the debug level (same as propDisplayValue here).
 * 
 */
export let fGetDebugLevel = function (data) {
    console.log("fgetDebugLevel", data); // Log the input data for debugging.
    try {
        // Define the different debug levels.
        let debugLevel = ["Error", "Warning", "Info", "Debug", "Trace"];

        // Initialize an array to store the list of debug levels.
        var debugLevelList = [];

        // Populate the debugLevelList with detailed information about each debug level.
        for (var i = 0; i < debugLevel.length; i++) {
            var temp = {
                uid: i, // Unique identifier.
                propDisplayValue: debugLevel[i], // Display value.
                dispValue: debugLevel[i], // Another display value (could be for different UI bindings).
                propInternalValue: debugLevel[i] // Internal value, same as display value here.
            };
            debugLevelList.push(temp); // Add the object to the list.
        }

        console.log(debugLevelList); // Log the generated list for debugging.

        // Return the complete list of debug levels.
        return debugLevelList;
    } catch (error) {
        console.log("error fgetDebugLevel function", error);
    }
};
/**
 * Function: fSetSelection
 * Description: This function sets the `dbValue` for the given output type or debug level selection. 
 *              These `dbValue`s are passed to the Execution SOA for further processing. 
 *              Additionally, it updates the application state using the provided `data.dispatch` method.
 * 
 * Parameters:
 * @param {Object} selectedobj - The selected object containing the `propInternalValue` property to be set as the `dbValue`.
 * @param {Object} value - An object where the `dbValue` property is updated based on the selected object's internal value.
 * @param {Object} data - The application state object. Used to dispatch changes in state.
 * 
 * Returns:
 * @returns {void} - The function performs its operations and does not return a value.
 * 
 * Example Usage:
 * fSetSelection(selectedDebugLevel, someValueObject, appData);
 * 
 * Notes:
 * - Ensure that `selectedobj` contains a valid `propInternalValue` property.
 * - This function handles errors gracefully by logging them to the console.
 */
export let fSetSelection = function (selectedobj, value, data) {
    try {
        console.log("fSetSelection", selectedobj, value);
        value.dbValue = selectedobj.propInternalValue;
        data.dispatch({ path: 'data', value: data });
        return;
    } catch (error) {
        console.log(error)
    }
}
/**
 * Function: fGetOutputTypeList
 * Description: This function generates a list of output types based on the provided `useCaseType`. 
 *              Each output type is represented as an object containing display and internal values. 
 *              The list is typically used for UI components like dropdown menus or selection boxes.
 * 
 * Parameters:
 * @param {Object} data - The input object containing `useCaseType`, which determines the available output types.
 *                        - `data.useCaseType` (string): Determines the list of output types. 
 *                          - "Import": Provides a limited list of output types.
 *                          - Other values: Provides a more comprehensive list of output types.
 * 
 * Returns:
 * @returns {Array} outputTypesList - An array of objects, where each object represents an output type with:
 *  - `propDisplayValue`: The human-readable name of the output type.
 *  - `dispValue`: A duplicate of `propDisplayValue` (useful for UI binding).
 *  - `propInternalValue`: The internal value associated with the output type.
 * 
 * Example Usage:
 * let outputTypeList = fGetOutputTypeList({ useCaseType: "Import" });
 */
export let fGetOutputTypeList = function (data) {
    console.log("fgetOutputTypeList", data);
    try {
        let outputTypes; // Array to store display names of output types.
        let outputTypeRealValue; // Array to store corresponding internal values.

        // Dynamically assign values based on useCaseType
        if (data.useCaseType === "Import") {
            // Output types specific to the "Import" use case.
            outputTypes = ["XML", "JSON", "SYSLOG"];
            outputTypeRealValue = ["GENERIC", "JSON", "SYSLOG"];
        } else {
            // Output types for Export use cases.
            outputTypes = ["Generic", "JSON", "Qlik", "Report Driven", "Type Driven", "SYSLOG"];
            outputTypeRealValue = ["GENERIC", "JSON", "JSON_QLIK", "REPORT", "TYPEBASED", "SYSLOG"];
        }
        var outputTypesList = [];
        // Populate the outputTypesList array with objects containing display and internal values.
        for (var i = 0; i < outputTypes.length; i++) {
            var temp = {
                propDisplayValue: outputTypes[i],
                dispValue: outputTypes[i],
                propInternalValue: outputTypeRealValue[i]
            };
            outputTypesList.push(temp);
        }
        //  console.log(outputTypesList);
        // Return the complete list of output types.
        return outputTypesList;
    } catch (error) {
        console.log(" Error fgetOutputTypeList", error);
    }
}
/**
 * Helper function for fCommentLine
 * Toggles HTML comments (<!-- -->) for selected text in the editor.
 * @param {string} content - The current editor content.
 * @param {object} selection - The selected text range (line numbers).
 * @returns {string} - The updated content with HTML comments toggled.
 */
//toggleComment
export let toggleComment = function (editor, selection) {
    if (!editor || typeof editor.executeEdits !== 'function') {
        console.error("Editor instance is not valid or does not support executeEdits.");
        return;
    }

    const content = editor.getModel().getValue();
    const lines = content.split('\n');
    const startLineNumber = selection.startLineNumber;
    const endLineNumber = selection.endLineNumber;

    const selectedLines = lines.slice(startLineNumber - 1, endLineNumber);
    const selectedText = selectedLines.join('\n').trim();

    if (!selectedText) return;

    const isCommented = selectedText.startsWith('<!--') && selectedText.endsWith('-->');
    const newText = isCommented
        ? selectedText.replace(/^<!--\s*/, '').replace(/\s*-->$/, '')
        : `<!-- ${selectedText} -->`;

    // Define the range as a plain object with start and end properties
    const range = {
        startLineNumber: startLineNumber,
        startColumn: 1,
        endLineNumber: endLineNumber,
        endColumn: lines[endLineNumber - 1].length + 1
    };

    editor.executeEdits("toggleComment", [
        {
            range: range,
            text: newText,
            forceMoveMarkers: true,
        }
    ]);

    return editor.getModel().getValue();
};
/**
 * Function: fCommentLine
 * Description: This function toggles comments on selected lines of content in an editor. 
 *              It updates the editor's content and ensures the appropriate state (Input XML or Use Case) is dispatched.
 * 
 * Parameters:
 * @param {Object} data - Contains the editor reference and the state properties to update.
 *                        - `data.eventData.editorRef`: Holds references to the editor and selected content.
 *                        - `data.editorInputXML`: State for input XML content.
 *                        - `data.editorUseCase`: State for use case content.
 * @param {boolean} isInputxml - Determines whether the operation applies to Input XML(Import) =>(`true`) or Export => (`false`).
 * 
 * Returns:
 * @returns {void} - The function updates state and does not return a value.
 * 
 * 
 * Notes:
 * - Ensure `data.eventData.editorRef` contains a valid reference to the editor and selected content.
 * -`toggleComment` is expected to handle the actual commenting logic.
 */
export let fCommentLine = function (data, isInputxml) {
    console.log("data", data);
    console.log("Inputxml", isInputxml);
    // const monacoInstance = data.eventData.editorRef.monacoEditorInstance;

    var updateContents = toggleComment(
        data.eventData.editorRef.referenceEditor, // Reference to the editor instance.
        data.eventData.editorRef.selectedContents // Currently selected contents in the editor.
    );
    console.log("updateContents", updateContents);
    // Update the appropriate state and dispatch changes based on `isInputxml`.
    if (isInputxml) {
        data.editorInputXML.dbValue = updateContents;
        data.dispatch({ path: 'data', value: data });
    } else {
        data.editorUseCase.dbValue = updateContents;
        data.dispatch({ path: 'data', value: data });
    }
}
/**
 * Function: fValidateActiveView
 * Description: This function validates whether the current user's role is allowed to access a specific active view. 
 *              It checks the user's role against a predefined preference and updates the state accordingly. 
 *              If the user does not have the required role, they are redirected to the home page, and an error message is displayed.
 * 
 * Parameters:
 * @param {Object} data - The application state object, which includes:
 *                        - `data.validateActiveView`: A state property that is updated to indicate if the active view is valid.
 *                        - `data.dispatch`: A function to dispatch updates to the application state.
 * 
 * Behavior:
 * - Fetches the current user's role from the application context (`appCtxService`).
 * - Retrieves the allowed roles from the `EzXchange_Allowed_Admin_Role` preference.
 * - Compares the user's role with the allowed roles.
 * - Updates the `validateActiveView` state and, if unauthorized:
 *   - Redirects the user to the home page.
 *   - Displays an error message.
 * 
 * Returns:
 * @returns {void} - The function updates state and does not return a value.
 * 
 * Example Usage:
 * await fValidateActiveView(dataObject);
 */
export let fValidateActiveView = function (data) {
    console.log("enter into Active view funtion", data)
    try {
        let userrole = appCtxService.ctx.userSession.props.role_name.dbValue;
        console.log("Currrent User role: ", userrole);
        let preferencevalue = appCtxService.ctx.preferences.EzXchange_Allowed_Admin_Role;
        console.log("Preference value: ", preferencevalue);
        if (preferencevalue) {
            if (preferencevalue.includes(userrole)) {
                data.validateActiveView.dbValue = true;
                data.dispatch({ path: 'data', value: data });
            } else {
                data.validateActiveView.dbValue = false;
                data.dispatch({ path: 'data', value: data });
                const url = browserUtils.getBaseURL() + "#/showHome";
                console.log("current url", url)
                window.location.assign(url);
                messageSvc.showError("User doesn't have access to view the Module, contact administrator")
            }
        } else {
            data.validateActiveView.dbValue = false;
            data.dispatch({ path: 'data', value: data });
            const url = browserUtils.getBaseURL() + "#/showHome";
            console.log("current url", url)
            window.location.assign(url);
            messageSvc.showError("User doesn't have access to view the Module, contact administrator")
        }
    } catch (error) {
        messageSvc.showError(error)
        console.log("error inside fValidateActiveView:", error);
    }
 
}
 
/**
 * Function: fGetUseCaseList
 * Description: Retrieves a list of use cases from a specified EzXChange Export Folder from Teamcenter (Folders are handle by preference). It uses a query service to 
 *              locate the folder, extract its dataset, and classify the use cases and related input XML files.
 * 
 * Parameters:
 * @param {Object} data - The application state object, which includes properties for dispatching updates.
 * @param {string} name - The name of the directory to query for use cases.
 * 
 * Behavior:
 * - Executes a saved query to locate a folder by its name and type.
 * - Retrieves the folder's UID and its contents (use case IDs).
 * - Fetches details about the use cases, including properties and metadata.
 * - Separates input XML files from other use cases for further processing.
 * - Updates the application state with the retrieved data.
 * 
 * Returns:
 * @returns {Promise<void>} - Asynchronous function; does not return a value directly.
 * 
 * Notes:
 * - This function relies on external services (`_soaSvc` and `cdm`) for querying and retrieving data.
 * - Ensure that `appCtxService` and `browserUtils` are properly initialized in the environment.
 */
export let fGetUseCaseList = async function (data, name) {
    try {
        console.log("fLoadUseCaseList", data);
        let useCaseUids;
        let directoryUid;
        let useCaseVM = [];
        let propsToLoad = [];
        let uids = [];
        let list = [];
        let useList_arr = [];
        let inputXml_arr = [];
        let listofUsecase = [];

        //Directory name is passed as a parameter, make sure preference value should be single

        let directoryName = name
        // Query to locate the folder by name and type
        var inputQuery = {
            inputCriteria:
                [{
                    queryNames: ["General..."]
                }]
        }
        // Execute the saved query to find the folder
        var reponse = await _soaSvc.postUnchecked('Query-2010-04-SavedQuery', 'findSavedQueries', inputQuery).then(async function (outputQuery) {
            var saveQueries = {
                uid: outputQuery.savedQueries[0].uid,
                type: outputQuery.savedQueries[0].type
            }
            var executeQuery = {
                query: saveQueries,
                entries: ["Name", "Type"],
                values: [directoryName, "Folder"]
            }
            var soa = await _soaSvc.postUnchecked('Query-2006-03-SavedQuery', 'executeSavedQuery', executeQuery).then(async function (outputQuery) {
                console.log(outputQuery)
                return outputQuery;
            });
            return soa;
        });
        //Folder Uid and type
        directoryUid = {
            uid: reponse.objects[0].uid,
            type: reponse.objects[0].type
        }
        data.DirectoryUid = directoryUid;
        data.dispatch({ path: 'data', value: data });//
        useCaseUids = reponse.objects[0].props.contents.dbValues
        console.log("useCaseUids", useCaseUids);
        // Handle case where no use cases are found
        if (useCaseUids.length == 0) {
            data.dispatch({ path: 'data.loadedObjectsVMO.dbValue', value: false });////if useCaseuids doesn't return by soa means if incase table store any existence usecase data means it will clear it.
            return;
        } else {
            data.dispatch({ path: 'data.loadedObjectsVMO.dbValue', value: true });
        }

        // Retrieve each use case object and prepare for property loading
        for (var caseId = 0; caseId < useCaseUids.length; caseId++) {
            var temp = cdm.getObject(useCaseUids[caseId])
            var vmo = {
                uid: temp.uid,
                type: temp.type
            }
            useCaseVM.push(temp);
            uids.push(vmo)
        }
        // Get properties to load
        let props = useCaseVM[0].modelType.propertyDescriptorsMap
        if (props) {
            for (const key in props) {
                if (props.hasOwnProperty(key)) {
                    // Push the name property to the namesArray
                    propsToLoad.push(props[key].name);
                }
            }
            //input for getProperties
            let getProps = {
                objects: uids,
                attributes: propsToLoad
            }
            let propsSoa = await _soaSvc.postUnchecked('Core-2006-03-DataManagement', 'getProperties', getProps).then(async function (outputQuery) {
                console.log(outputQuery)
                return outputQuery;
            });
            var vPlain = propsSoa.plain;
            for (var i = 0; i < vPlain.length; i++) {
                var temp = vPlain[i];
                list.push(propsSoa.modelObjects[temp])
            }
        }
        //Get usecase viewmodel object from export directory
        console.log("userCaseVM", list);
        for (let index = 0; index < list.length; index++) {
            let temp = list[index].props.object_name.dbValues[0];
            useList_arr.push(temp); // Just push the value of temp into useList_arr

            // Separating import input XML from query output result
            if (temp.includes("_input")) {
                inputXml_arr.push(list[index]); // Use the dynamic key correctly

            } else {
                listofUsecase.push(list[index]); // Push non-input items into listofUsecase
            }
        }
        data.useCaseList = listofUsecase;//list of usecase
        data.usecaseName = useList_arr;//list usecase Name
        data.useCaseInputXml = inputXml_arr;//input xml for import tab
        data.dispatch({ path: 'data', value: data });
    } catch (error) {
        console.log("get usecase file", error)
    }
}
/**
 * Function: fLoadUseCaseList
 * Description: Loads a list of use cases and processes them based on whether they are part of the "Import" type.
 *              It organizes the use cases in a splm table structure, adding relevant properties and handling cases
 *              where input XML references are missing.
 *
 * Parameters:
 * @param {Object} data - The application state object that contains various properties such as `loadedObjectsVMO`, 
 *                        `useCaseInputXml`, and `useCaseType`.
 * @param {Array} useCaseList - List of use case objects retrieved from the EzXChange export, import directory.
 * 
 * Behavior:
 * - Checks if the data is loaded and the `useCaseType` is "Import".
 * - Iterates over the `useCaseList` to create table objects for each use case.
 * - Adds various properties (e.g., file, description) to each table object.
 * - Handles missing input XML references by adding a separate list for such objects.
 * 
 * Returns:
 * @returns {Object} - The result containing:
 *    - `list`: The list of processed use case table objects.
 *    - `totalFound`: The total count of processed use case objects.
 */
export let fLoadUseCaseList = async function (data, useCaseList) {

    console.log("useCaseList inside fLoadUseCaseList function", useCaseList)
    let useCaseTableObj = [];
    let result;
    let column = ["file", "description"];
    let inputXmlwithoutReference = [];
    //Check whether in import tab 
    if (data.loadedObjectsVMO.dbValue == true) {
        for (let index = 0; index < useCaseList.length; index++) {
            // useCaseName.push(useCaseVM[index].props.object_name.dbValues[0]);
            // Initialize an empty object
            if (!useCaseList[index].props?.ref_list?.dbValues[0]) {
                continue;
            }
            var mainObject = {
                uid: 1 + index,
                props: {}
            };
            // Use a for loop to iterate over the firstRow and column arrays
            for (let i = 0; i < column.length; i++) {
                let obj = {
                    type: "STRING",
                    hasLov: false,
                    isArray: false,
                    displayValue: useCaseList[index].props.object_name.dbValues[0],
                    uiValue: useCaseList[index].props.object_name.dbValues[0],
                    value: useCaseList[index].props.object_name.dbValues[0],
                    propertyName: column[i],
                    propertyDisplayName: column[i],
                    isEnabled: true,
                    isPropertyModifiable: true,
                    modelObjects: useCaseList[index]
                };
                if (column[i] === "description") {
                    obj.displayValue = useCaseList[index].props.object_desc.dbValues[0];
                    obj.uiValue = useCaseList[index].props.object_desc.dbValues[0];
                    obj.value = useCaseList[index].props.object_desc.dbValues[0];
                } else if (column[i] === "IsPublished") {
                    obj.type = "STRING"
                    obj.displayValue = ""
                    obj.uiValue = ""
                    obj.value = ""
                    obj.propertyName = column[i]
                    obj.propertyDisplayName = column[i]
                }
                ///Adding inputXml object for import tab
                if (data.useCaseInputXml.length > 0 && data.useCaseType == "Import") {//for export this if condition will not execute
                    var objectName = useCaseList[index].props.object_name.dbValues[0] //use for compare purpose
                    var inputObject = data.useCaseInputXml.find(item => {
                        // Split and compare only the first part of the object name
                        return item.props.object_name.dbValues[0].split('_')[0] === objectName;
                    });
                    if (inputObject) {
                        //adding inputxml object in table for each
                        obj.inputXmlObject = inputObject; // Set the matched object
                    } else {
                        obj.inputXmlObject = null;
                    }
                } else {
                    obj.inputXmlObject = null;
                }
                // Add the object to the props object with a dynamic key
                mainObject.props[column[i]] = obj;
            }
            //if input xml does not contain named reference
            if (!mainObject.props.file?.inputXmlObject?.props?.ref_list?.dbValues[0] && data.useCaseType == "Import") {
                inputXmlwithoutReference.push(mainObject);
            }
            useCaseTableObj.push(mainObject);
        }
        console.log("useCaseTableObj", useCaseTableObj);
        if (inputXmlwithoutReference) {
            console.log("inputXmlwithoutReference", inputXmlwithoutReference);
        }
        result = {
            list: useCaseTableObj,
            totalFound: useCaseTableObj.length
        }
        return result
    }
    else {
        // Return an empty result if no data is loaded
        console.log("no object get from the folder function: fLoadUseCaseList ");
        result = {
            list: useCaseTableObj,
            totalFound: useCaseTableObj.length
        }
        return result
    }
}

/**
 * Function: hidePopup
 * Description: Hides a popup by calling the `hide` method on the popup API.
 * 
 * Parameters:
 * @param {Object} subPanelContext - The context object containing the popup API.
 */
export let hidePopup = function (subPanelContext) {
    console.log('from hide-popup subPanelContext: ', subPanelContext);
    subPanelContext.popupApi.hide();
};
/**
 * Function: fsetInputName
 * Description: Sets the input name in the data object based on the `Usecasename` property.
 * 
 * Parameters:
 * @param {Object} data - The application state object containing `inputName` and `Usecasename` properties.
 */
export let fsetInputName = function (data) {
    console.log('from hide-popup subPanelContext: ', data);
    data.inputName.dbValue = data.Usecasename.dbValue
    data.dispatch({ path: 'data', value: data });
};

/**
 * Function: fValidate
 * Description: Validates a usecase content by sending a request to the server (SOA) and processes any errors or success messages.
 * 
 * Parameters:
 * @param {Object} data - The data object containing various properties such as selected use case, input XML, etc.
 * @param {string} typeofusecase - The type of the use case (e.g., "ImportUsecase").
 * @param {boolean} isInputXml - Whether the validation is for an Input XML.
 * @param {string} url - The URL for the SOA service.
 * 
 * Behavior:
 * - Sends a validation request to the server (via SOA).
 * - Handles server response and processes any validation errors or success messages.
 * - Updates the UI accordingly with error or success messages and manages button states.
 */
export let fValidate = async function (data, typeofusecase, isInputXml, url) {
    let folderUid = data.DirectoryUid;
    console.log("Imodelobject: ", folderUid, data);
    let folderUid_arr = [];
    let errorMessage = "";
    let input = null;
    let nameOfUsecase = null;
    folderUid_arr.push(folderUid);
    try {
        nameOfUsecase = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.object_name.dbValues[0];
        if (nameOfUsecase) {
            input = {
                inputData: {
                    usecaseObject: {
                        name: nameOfUsecase,
                        type: typeofusecase,
                    },
                    extraData: {
                        input_xml: {
                            valueType: "StringType",
                            isArray: false,
                            referenceValue: folderUid_arr
                        },
                        execute_non_published_usecase: {
                            valueType: "StringType",
                            isArray: false,
                            stringValue: ["true"],
                            referenceValue: folderUid_arr
                        }
                    }
                }
            };
            // If it's input XML, update the input object with the XML data
            if (isInputXml) {
                nameOfUsecase = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.object_name.dbValues[0];
                input.inputData.usecaseObject.name = nameOfUsecase;
                input.inputData.extraData.input_xml["stringValue"] = [data.editorInputXML.dbValue];
                await floadSavedata(data, url, true, true)//saving usecase config before validating inputxml
            }
            console.log("input for validate soa", input);
            var soa = await _soaSvc.postUnchecked('EzXchange-2015-07-EzXchangeService', 'validateUsecase', input).then(function (output) {
                console.log("Inside soa calling: ", output);
                return output;
            });
            console.log("Validate return: ", soa);
            // Check if partialErrors is present and has the expected structure
            if (soa?.ServiceData?.partialErrors?.[0]?.errorValues?.[0]?.message) {
                errorMessage = soa.ServiceData.partialErrors[0].errorValues[0].message;
            }
            // Check if modelObjects exists and use its message or equivalent property
            else if (soa?.ServiceData?.modelObjects?.[0]?.message) {
                errorMessage = soa.ServiceData.modelObjects[0].message;
            }
            if (errorMessage) {
                var errors = soa.ServiceData.partialErrors[0].errorValues;
                console.log("errormessage is : ", errorMessage);
                for (let i = 0; i < errors.length; i++) {
                    var errorcode = errors[i].code;  // Updated to use correct error value for this loop
                    var errorlevel = errors[i].level;
                    var errormessage = errors[i].message;

                    // Concatenate error details with a newline
                    errorMessage += "Error Code : " + errorcode + ", Level : " + errorlevel + ", Message : " + errormessage + "\n";
                }
                console.log("Final error message: ", errorMessage);
            } else {
                if (isInputXml) {
                    messageSvc.showInfo("Input XML Validated Succesfully.");
                } else {
                    messageSvc.showInfo("Usecase XML Validated Succesfully.");
                }
                data.dispatch({ path: 'data.btnInputDisable.dbValue', value: true });//if usecase validate sucess input button will be enabled
            }
        } else {
            messageSvc.showError("Before Validate Select Usecase");
            data.dispatch({ path: 'data.btnInputDisable.dbValue', value: false });
        }
        if (typeofusecase === "ImportUsecase") {
            data.editorOutput.dbValue = errorMessage;
            data.dispatch({ path: 'data', value: data });
            if (data.eventData.editorRef.monacoEditorInstance) {
                const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[2]; // Get the active editor model
                if (editor) {
                    editor.setValue(errorMessage); // Set the editor's value to an empty string
                }
            }
        } else {
            data.editorOutput.dbValue = errorMessage;
            data.dispatch({ path: 'data', value: data });
            if (data.eventData.editorRef.monacoEditorInstance) {
                const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
                if (editor) {
                    editor.setValue(errorMessage); // Set the editor's value to an empty string
                }
            }
        }

        if (errorMessage != "") {//if its contain error input button should be disabled
            data.dispatch({ path: 'data.btnInputDisable.dbValue', value: false });
        }

    } catch (error) {
        console.log("validate error", error);
        messageSvc.showError("Selected usecase then validate or Save the usecase before validate");
    }
}

/**
 * Function: checkBoxRendererfn
 * Description: Renders a checkbox in a table cell for each row and binds the state (checked/unchecked) based on a property value. 
 * It also attaches an event listener to update the corresponding value when the checkbox state is changed.
 * 
 * Parameters:
 * @param {Object} vmo - The ViewModel Object (vmo) representing the row in the table, containing the properties like 'markup_status'.
 * @param {HTMLElement} containerElem - The HTML element to which the checkbox will be appended.
 * 
 * Behavior:
 * - Creates a checkbox and sets its initial state based on the 'markup_status' property.
 * - Attaches an event listener to update the value when the checkbox is changed.
 * - Appends the checkbox to the table cell and the cell to the container.
 * - Renderering CheckBox in splm table{Publish}  Both publish and unpublish handled by this.
 */
export let checkBoxRendererfn = function (vmo, containerElem) {
    // Access the property value
    var prop = vmo.props.description.modelObjects.props.markup_status.dbValues[0];
    // console.log("ffffff", vmo);
    // console.log("containerElem", containerElem);

    // Custom cell template
    var cell = document.createElement('div');
    cell.className = 'aw-splm-tableCellTop';
    cell.style.overflow = 'hidden'; // Prevent scrollbars
    cell.style.display = 'flex'; // Ensure proper layout

    // Create checkbox
    var x = document.createElement("INPUT");
    x.setAttribute("type", "checkbox");
    x.className = 'aw-base-icon aw-type-icon aw-splm-tableIcon';
    x.target = '_blank';

    // Check the value of 'prop' and tick the checkbox if necessary
    x.checked = (prop && prop.length > 0); // Tick if prop has a value

    // Add event listener to handle checkbox state change
    x.addEventListener('change', function () {
        // Call a function on checkbox state change which if user select the checkbox or unselect the checkbox
        handleCheckboxChange(x.checked, vmo);
    });

    // Add checkbox to the cell
    cell.appendChild(x);

    // Add cell to container
    containerElem.appendChild(cell);
};

/**
 * Function: handleCheckboxChange
 * Description: Handles the checkbox state change event and updates the 'markup_status' property on the server based on whether the checkbox is checked or unchecked.
 * 
 * Parameters:
 * @param {boolean} isChecked - The current state of the checkbox (true for checked, false for unchecked).
 * @param {Object} vmo - The ViewModel Object (vmo) that contains the data to be updated.
 * 
 * Behavior:
 * - Updates the 'markup_status' property of the associated object to "Released" if checked, or an empty string if unchecked.
 * - Calls the SOA service to set the new property value on the server.
 * Helper function for checkBoxRendererfn
 */
async function handleCheckboxChange(isChecked, vmo) {
    console.log(`Checkbox ${isChecked ? 'selected' : 'unselected'}:`, vmo);
    let values = isChecked ? "Released" : "";

    let uids = {
        uid: vmo.props.file.modelObjects.uid,
        type: vmo.props.file.modelObjects.type
    };
    //input for set propeties SOA
    var setProps = {
        info:
            [{
                object: uids,
                vecNameVal:
                    [{
                        name: "markup_status",
                        values: [values]
                    }]
            }]
    }
    await fSetPropertiesSOA(setProps);
}

//Publish the usecase by using setProperties SOA
export let fSetPropertiesSOA = async function (vmo) {
    console.log("soa", vmo)
    await _soaSvc.postUnchecked('Core-2010-09-DataManagement', 'setProperties', vmo).then(function (outputProps) {
        console.log("outputProps", outputProps);
    });
}
/**
 * Function: loadedobject
 * Description: Prepares and publishes a list of use cases by updating their 'markup_status' property to the specified value. 
 * The function processes each use case in the given array, constructs the required structure for updating the property, and sends the update request via SOA.
 * 
 * Parameters:
 * @param {Array} loadObjectsToPublish - An array of objects representing the use cases to be published, each containing the necessary properties (e.g., 'uid', 'type').
 * @param {string} valueforPublish - The value to set for the 'markup_status' property (e.g., "Released" for publishing).
 * 
 * Behavior:
 * - Iterates over the provided use cases, constructs the data structure needed to update the 'markup_status' property.
 * - Sends the update request to the server (via SOA) for each use case.
 */
async function loadedobject(loadObjectsToPublish, valueforPublish) {
    let useCasetoPublish = [];
    for (let load = 0; load < loadObjectsToPublish.length; load++) {
        let tag = {
            uid: loadObjectsToPublish[load].props.file.modelObjects.uid,
            type: loadObjectsToPublish[load].props.file.modelObjects.type
        }
        let temp =
        {
            object: tag,
            vecNameVal:
                [{
                    name: "markup_status",
                    values: [valueforPublish]
                }]
        }
        useCasetoPublish.push(temp);
    }
    let vmo = {
        info: useCasetoPublish
    }
    await fSetPropertiesSOA(vmo);
}

/**
 * Function: fPublishUseCase
 * Description: Publishes or unpublishes use cases in the SPLM table based on the state of the 'publishAll' checkbox. 
 * It updates the 'markup_status' property of the selected use cases to "Released" for publishing or clears the value for unpublishing.
 * 
 * Parameters:
 * @param {Object} data - The data object containing properties and states for the operation. It includes:
 *   - `data.dataProviders.useCaseProvider.viewModelCollection.loadedVMObjects`: Array of use cases currently loaded in the table.
 *   - `data.publishAll.dbValue`: Boolean indicating whether all use cases should be published or unpublished.
 * 
 * Behavior:
 * - Checks the state of the 'publishAll' checkbox.
 * - Filters the use cases based on their current 'markup_status' value:
 *   - For publishing, selects use cases with `markup_status` as `null`.
 *   - For unpublishing, selects use cases with `markup_status` as "Released".
 * - Calls the `loadedobject` function to update the `markup_status` property for the selected use cases.
 * - Reloads the SPLM table after the operation is completed.
 * - Logs an error message in case of failure.
 */
export let fPublishUseCase = async function (data) {
    console.log("fPublishUseCase", data);
    let objectToLoad_arr = [];
    try {
        let loadObjectsToPublish = data.dataProviders.useCaseProvider.viewModelCollection.loadedVMObjects;
        //If checkBox true all usecase in splm table will be published
        if (data.publishAll.dbValue) {
            //remove the already published usecase
            for (let objects = 0; objects < loadObjectsToPublish.length; objects++) {
                if (loadObjectsToPublish[objects].props.file.modelObjects.props.markup_status.dbValues[0] === null) {
                    objectToLoad_arr.push(loadObjectsToPublish[objects]);
                }
            }
            let publish = "Released"
            await loadedobject(objectToLoad_arr, publish);
            eventBus.publish('ezXChangeGridTable.plTable.reload');
            objectToLoad_arr = [];

        } else {
            for (let objects = 0; objects < loadObjectsToPublish.length; objects++) {
                if (loadObjectsToPublish[objects].props.file.modelObjects.props.markup_status.dbValues[0] === "Released") {
                    objectToLoad_arr.push(loadObjectsToPublish[objects]);
                }
            }
            let unPublish = ""
            await loadedobject(objectToLoad_arr, unPublish);
            eventBus.publish('ezXChangeGridTable.plTable.reload');
            objectToLoad_arr = [];
        }
    } catch (error) {
        console.log("Publish Soa Failed", error);
    }
}


/**
 * Function: fDeleteUseCase
 * Description: Deletes selected use cases from the SPLM table. It handles both removing relations (e.g., from a folder) and deleting the use case objects.
 * 
 * Parameters:
 * @param {Object} data - The data object containing the required context and selected use cases.
 * 
 * Steps:
 * 1. Checks if any use case is selected.
 * 2. Constructs delete requests for relations and objects.
 * 3. Sends SOA calls to delete relations and objects.
 * 4. Displays success or error messages based on the operation outcome.
 * 5. Refreshes the table to reflect the changes.
 */
export let fDeleteUseCase = async function (data) {
    console.log("data: ", data);
    data.subPanelContext.dataProviders.useCaseProvider.selectedObjects
    // DirectoryUid=folder uid and type
    if (data.subPanelContext.dataProviders.useCaseProvider.selectedObjects.length > 0) {
        let primaryObj = data.DirectoryUid;
        let selectedDeleteObj = data.subPanelContext.dataProviders.useCaseProvider.selectedObjects;
        let deleteObjects = [];
        let deleteObjectsTags = [];
        //Multiple delete's
        for (const obj of selectedDeleteObj) {
            const { file } = obj.props;
            const { modelObjects, inputXmlObject } = file;

            const createDump = (object) => ({
                relationType: "contents",
                primaryObject: primaryObj,
                secondaryObject: {
                    uid: object.uid,
                    type: object.type
                }
            });

            const addToDeleteLists = (object) => {
                deleteObjects.push(createDump(object));
                deleteObjectsTags.push({ uid: object.uid, type: object.type });
            };

            // Add modelObjects to delete lists
            addToDeleteLists(modelObjects);

            // If inputXmlObject exists, add it to delete lists
            if (inputXmlObject) {
                addToDeleteLists(inputXmlObject);
            }
        }
        //input for delete relation(usecase) from table soa
        let deleteRel =
        {
            input: deleteObjects
        }
        // Delete relations and objects
        try {
            var soa = await _soaSvc.postUnchecked('Core-2006-03-DataManagement', 'deleteRelations', deleteRel).then(function (outputRel) {
                console.log("outputProps", outputRel);
                return outputRel
            });

            //input for delete usecase
            let deleteObj = {
                objects: deleteObjectsTags
            }
            var responseDelete = await _soaSvc.postUnchecked('Core-2006-03-DataManagement', 'deleteObjects', deleteObj).then(function (outputdel) {
                console.log("outputProps", outputdel);
                return outputdel
            });
            messageSvc.showInfo("Selected usecase was deleted");
            eventBus.publish('ezXChangeGridTable.plTable.reload');
        } catch (error) {
            var error_text = messageSvc.getSOAErrorMessage(error)
            messageSvc.showError(error_text)
        }
    } else {
        messageSvc.showError("Usecase was not selected");
    }

}
/**
 * Function: updateInputEditor
 * Description: Updates the input XML editor content to a default message when no input XML file or named reference is present.
 * 
 * Parameters:
 * @param {Object} data - Data object containing editor references and states.
 */
async function updateInputEditor(data) {
    data.editorInputXML.dbValue = "This usecase does not contain input xml file or this usecase does not cantain named reference, so add new content here..";
    data.dispatch({ path: 'data', value: data });
    if (data.eventData.editorRef.monacoEditorInstance) {
        const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
        if (editor) {
            editor.setValue("This usecase does not contain input xml file or this usecase does not cantain named reference, so add new content here.."); // Set the editor's value to an empty string
        }
    }
}
/**
 * Function: fGetContentofUsecase
 * Description: Fetches and populates the content of a selected use case (e.g., XML files) into the editor. Handles multiple file mappings and updates the editor accordingly.
 * 
 * Parameters:
 * @param {Object} data - Data object containing the selected use case and editor states.
 * @param {string} typeofusecase - Indicates the type of use case being processed (e.g., "ImportUsecase").
 */
export let fGetContentofUsecase = async function (data, typeofusecase) {
    try {
        let inputXmlTag = null;

        //passing inputXml object tag to SOA input
        if (typeofusecase === "ImportUsecase" && data.dataProviders.useCaseProvider.selectedObjects[0].props?.file?.inputXmlObject != null) {
            var uidForInputXml = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject.props.ref_list.dbValues[0]
            if (uidForInputXml) {
                inputXmlTag =
                {
                    uid: uidForInputXml,
                    type: "ImanFile"
                }
            } else {  //if inputXml usecase does not contain named reference.
                await updateInputEditor(data);
            }
        } else if (typeofusecase === "ImportUsecase" && data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject == null) {
            //if usecase config does not contain input file editor instance should be clear.
            await updateInputEditor(data);
        }
        //
        const fileTag = {
            uid: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.ref_list.dbValues[0],
            type: "ImanFile"
        };
        const fileInput = {
            files: [fileTag, inputXmlTag]
        };

        // Fetching tickets via SOA service
        const soaResponse = await _soaSvc.postUnchecked('Core-2006-03-FileManagement', 'getFileReadTickets', fileInput);
        console.log("SOA response from getFileReadTickets:", soaResponse)
        if (!soaResponse || !soaResponse.tickets) {
            throw new Error("Invalid SOA response or missing tickets.");
        }
        const modelObjects = soaResponse.tickets[0]; // First array: Model objects
        const ticketValues = soaResponse.tickets[1]; // Second array: Corresponding ticket values

        // Map each model object to its corresponding ticket
        const mappedData = modelObjects.map((modelObj, index) => ({
            modelObject: modelObj.props.original_file_name.dbValues[0],
            ticket: ticketValues[index]
        }));
        console.log("tickets mapp", mappedData);
        // Map tickets to fetch promises and resolve them in parallel
        const fileContents = await Promise.all(
            ticketValues.map(ticket => fetchFileContent(ticket))
        );
        console.log("file contents", fileContents);
        // Combine XML content with mapped data
        const enrichedMappedData = mappedData.map((item, index) => ({
            ...item, // Spread original mapped data
            xmlText: fileContents[index]?.xmlText || null, // Attach corresponding XML content
        }));

        console.log("Enriched Mapped Data:", enrichedMappedData);
        // Populate editors based on content
        if (typeofusecase === "ImportUsecase") {
            for (let i = 0; i < enrichedMappedData.length; i++) {
                if (enrichedMappedData[i].xmlText === null) {
                    enrichedMappedData[i].xmlText = "  ";
                }
                if (enrichedMappedData[i].modelObject.includes("_input")) {
                    data.editorInputXML.dbValue = enrichedMappedData[i].xmlText;
                    data.dispatch({ path: 'data', value: data });
                    if (data.eventData.editorRef.monacoEditorInstance) {
                        const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
                        if (editor) {
                            editor.setValue(enrichedMappedData[i].xmlText); // Set the editor's value to an empty string
                        }
                    }
                } else {
                    data.editorUseCase.dbValue = enrichedMappedData[i].xmlText;
                    data.dispatch({ path: 'data', value: data });
                    if (data.eventData.editorRef.monacoEditorInstance) {
                        const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[0]; // Get the active editor model
                        if (editor) {
                            editor.setValue(enrichedMappedData[i].xmlText); // Set the editor's value to an empty string
                        }
                    }
                }

            }
        } else {
            data.editorUseCase.dbValue = enrichedMappedData[0].xmlText;
            data.dispatch({ path: 'data', value: data });
            if (data.eventData.editorRef.monacoEditorInstance) {
                const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[0]; // Get the active editor model
                if (editor) {
                    editor.setValue(enrichedMappedData[0].xmlText); // Set the editor's value to an empty string
                }
            }
            data.dispatch({ path: 'data.btnInputDisable.dbValue', value: false }); //swtiching each usecase make sure input button should be disable
        }
    } catch (error) {
        console.error("Error in fGetContentofUsecase:", error);
    }
};


/**
 * Helper Function: fetchFileContent
 * Description: Fetches the content of a file using the provided ticket, making a request to the FMS service.
 * 
 * Parameters:
 * @param {string} ticket - The FMS ticket for accessing the file.
 * 
 * Returns:
 * @returns {Promise<Object|null>} A promise that resolves with an object containing the XML content as `xmlText` or `null` in case of errors.
 */
async function fetchFileContent(ticket) {
    const url = `${browserUtils.getBaseURL()}fms/fmsdownload/${fmsUtils.getFilenameFromTicket(ticket)}?ticket=${ticket}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch file. Status: ${response.status}`);
            return null;
        }
        const xmlText = await response.text();
        console.log("Fetched XML content successfully:", xmlText);
        return { xmlText };
    } catch (error) {
        console.error("Error fetching or parsing XML file:", error);
        return null;
    }
}

/**
 * Function:floadSavedata
 * Description: Function to save data related to use cases or input XML. Handles creation of new input XML files if not attached to named reference,
 * updates existing usecase, if input xml not for an usecase this operation will also execute and commits changes using SOA services.
 * 
 * @param {Object} data - The data object containing details of selected use case and editor content.
 * @param {String} url - The server URL for upload operations.
 * @param {Boolean} isInputXml - A flag indicating if the operation is for an input XML file.
 * @param {Boolean} popUpBlock - A flag to control whether to display popup messages or not.
 */
export let floadSavedata = async function (data, url, isInputXml, popUpBlock) {
    console.log("floadSavedata", data, url)
    try {
        let contents = null;
        let selectedobjUId = null;
        let filename = null;
        let datasetsTag = null;
        let referenceName = null;
        selectedobjUId = data.dataProviders.useCaseProvider.selectedObjects[0].uid;//again have to selected after save.
        if (isInputXml) {
            //if usecase config does not contain input xml file, then it create new input file
            if (data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject == null) {
                try {
                    var UID = data.dataProviders.useCaseProvider.selectedObjects[0].uid;//for after selection the usecase config
                    var fileName = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.object_name.dbValues[0];
                    var filedesc = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.object_name.dbValues[0];
                    var folder = data.DirectoryUid;
                    fileName += "_input.xml";
                    contents = data.editorInputXML.dbValue;

                    const FileBlob = new Blob([contents], { type: 'application/xml' });
                    await callSOA(folder, fileName, filedesc, FileBlob, url);
                    //After Updating the selected object with inputXmlObject so it will load they modelobject.
                    eventBus.publish('ezXChangeGridTable.plTable.reload');
                    data.dataProviders.useCaseProvider.selectionModel.setSelection(UID);
                    return
                } catch (error) {
                    console.log("inside loadSaveData function while creating new inputxml file getting error", error)
                    return
                }//if input xml created without xml in named references
            } else if (!data.dataProviders.useCaseProvider.selectedObjects[0]?.props?.file?.inputXmlObject?.props?.ref_list?.dbValues[0]) {
                contents = data.editorInputXML.dbValue;
                filename = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.object_name.dbValues[0];
                filename += "_input.xml" //input xml uscase file name
                //inside selected object of usecase dataprovider contain usecase config object and also the input xml object for export tab it won't applicable, inputXmlObject will defined as null.
                datasetsTag = {
                    uid: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject.uid,//input xml uscase tag
                    type: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject.type
                }
                referenceName = "Text"
            } else {
                //If InputXml became true and it as hold input xml
                contents = data.editorInputXML.dbValue;
                filename = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject.props.ref_list.uiValues[0]//input xml uscase file name
                //inside selected object of usecase dataprovider contain usecase config object and also the input xml object for export tab it won't applicable, inputXmlObject will defined as null.
                datasetsTag = {
                    uid: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject.uid,//input xml uscase tag
                    type: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject.type
                }
                referenceName = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.inputXmlObject?.props?.ref_names?.dbValues[0];
            }
        } else {
            //This block only for useconfig in export
            contents = data.editorUseCase.dbValue;

            filename = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.ref_list.uiValues[0];//input xml uscase file name
            datasetsTag = {
                uid: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.uid,
                type: data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.type//uscase config tag
            }
            referenceName = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.ref_names.dbValues[0];// usecase config reference name
        }
        let getDatasetWrite =
        {
            inputs:
                [{
                    dataset: datasetsTag,
                    createNewVersion: false,
                    datasetFileInfos:
                        [{
                            fileName: filename,
                            namedReferencedName: referenceName,
                            isText: true,
                            allowReplace: true
                        }]
                }]
        }
        //This soa serivces will get the fms ticket for the selected object
        var info = await _soaSvc.postUnchecked('Core-2006-03-FileManagement', 'getDatasetWriteTickets', getDatasetWrite).then(async function (output) {
            console.log("getDatasetWriteTicketsSOA", output)
            return output;
        });
        let formData1 = new FormData();
        console.log("commitinfo", info)
        var value = info.commitInfo[0].datasetFileTicketInfos[0].ticket;//ticket
        //converting the content for the editor into binary form
        const fileBlob = new Blob([contents], { type: 'application/xml' });
        console.log('Blob:', fileBlob);
        let filedata = fileBlob;
        updateFormData(formData1, "fmsTicket", value);
        updateFormData(formData1, "fmsFile", filedata);
        console.log("Formdata: ", formData1);
        await uploadFiles(formData1, url);
        //commit dataset
        var commitInput = {
            commitInput: [{
                dataset: datasetsTag,
                createNewVersion: true,
                datasetFileTicketInfos: [{
                    datasetFileInfo: {
                        fileName: info.commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.fileName,
                        namedReferencedName: info.commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.namedReferencedName,
                        isText: info.commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.isText,
                        allowReplace: info.commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.allowReplace
                    },
                    ticket: value
                }]
            }]
        };
        var commitsoa = await _soaSvc.postUnchecked('Core-2006-03-FileManagement', 'commitDatasetFiles', commitInput).then(function (output) {
            console.log("commit soa calling ", output);
            return output;

        });
        eventBus.publish('ezXChangeGridTable.plTable.reload');
        data.dataProviders.useCaseProvider.selectionModel.setSelection(selectedobjUId);//again have to selected after save.
        //Disable save button 
        /// data.dispatch({ path: 'data.btnSaveDisable.dbValue', value: false });
        if (popUpBlock) {
            return;
        }
        if (isInputXml) {
            messageSvc.showInfo("Input XML Saved Succesfully.");
        } else {
            messageSvc.showInfo("Usecase XML Saved Succesfully.");
        }
    } catch (error) {
        messageSvc.showError("No usecase Selected")
        console.log("Save Soa error", error);
    }
}
/**
 * Function to validate whether all selected objects are ready to be published.
 * It checks the markup status of each object in the array, and if all are valid,
 * it updates the state to allow publishing.
 * 
 * @param {Array} vmo - The array of objects to validate, typically containing metadata for files.
 * @param {Object} data - The data object containing the publishAll flag and dispatch function.
 */
export let fValidatetoPublishAll = async function (vmo, data) {
    console.log("fValidatetoPublishAll", vmo);
    if (!vmo || !Array.isArray(vmo)) {
        return;
    }
    let allValid = vmo.every(obj => {
        const markupStatus = obj?.props?.file?.modelObjects?.props?.markup_status?.dbValues?.[0];
        return markupStatus !== null;
    });
    console.log(allValid)
    if (allValid) {
        data.publishAll.dbValue = true;
        data.dispatch({ path: 'data', value: data });
    } else {
        data.publishAll.dbValue = false;
        data.dispatch({ path: 'data', value: data });
    }
};

/**
 * Function to clear the output editor's content both in the data object and in the Monaco Editor instance.
 * It updates the value and triggers reactivity in the system.
 * 
 * @param {Object} data - The data object containing the output editor's state and reference to the Monaco editor.
 * @param {number} index - The index of the output editor model in the Monaco editor instance to clear.
 */
export let fClearOutputEditor = async function (data, index) {
    console.log("editorClear", data);
    // Clearing the dbValue in the data object for the output editor
    data.editorOutput.dbValue = '';
    data.editorOutput.valueUpdated = true;
    data.editorOutput.displayValueUpdated = true;

    // Dispatch the updated data object to trigger reactivity
    data.dispatch({ path: 'data.editorOutput', value: data.editorOutput });

    console.log("data after clearing: ", data);
    // Update the Monaco Editor instance directly
    if (data.eventData.editorRef.monacoEditorInstance) {
        const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[index]; // Get the output editor model here
        if (editor) {
            editor.setValue(''); // Set the editor's value to an empty string
        } else {
            console.log("Target editor is not found..");
        }
    } else {
        console.log("No instance found.");
    }
};
/**
 * Function:fCreateTextBox
 * Description: Function to create text box and LOV (List of Values) properties based on provided criteria. It categorizes the criteria into two arrays: textBoxNodes and lovNodes, then processes 
 * each to generate ViewModel Properties (VMProps) for the UI.
 *
 * @param {Object} value - The input value containing the criteria that need to be processed.
 * @param {Object} data - The data object used to update the UI and dispatch events.
 * @returns {Object} - An object containing two arrays: textBox (for text input properties) 
 *                     and lov (for LOV properties).
 */
export let fCreateTextBox = async function (value, data) {
    try {


        console.log("initializeVMPData", value);
        const { criterias } = value;
        const textBoxNodes = [];
        const lovNodes = [];
        const vmpArray = [];
        const vmpLOVArray = [];

        // Categorize criterias into textBoxNodes and lovNodes
        criterias.forEach((criteria) => {
            (criteria.name === "property_set" ? lovNodes : textBoxNodes).push(criteria);
        });

        // Process textBoxNodes into vmo
        textBoxNodes.forEach((node) => {
            node.criterias.forEach((vmo) => {
                const vmProp = modelPropSvc.createViewModelProperty({
                    displayName: vmo.key,
                    type: 'STRING',
                    isEditable: true,
                    isRequired: vmo.isMandatory,
                    dbValue: '',
                    dispValue: vmo.key,
                    labelPosition: 'PROPERTY_LABEL_AT_SIDE',
                });
                uwPropertySvc.setRenderingHint(vmProp, 'textbox');
                vmpArray.push(vmProp);
            });
        });
        console.log("textBox", vmpArray);
        // Process lovNodes into vmo
        lovNodes[0]?.criterias.forEach((node) => {
            vmpLOVArray.push({
                propDisplayValue: node.name,
                propDisplayDescription: node.name,
                dispValue: node.name,
                propInternalValue: node.name,
            });
        });
        if (vmpLOVArray.length > 0) {
            data.dispatch({ path: 'data.hidePropertySet.dbValue', value: true });
        }
        return {
            textBox: vmpArray,
            lov: vmpLOVArray,
        };
    } catch (error) {
        console.log("inside textbox creation", error);
    }
};
/**
 * Function:fDispatch
 * Description: Registering the lovnode and textbox in ctx service, because these data from input popup to get those data we registor in ctx
 *
 * @param {Object} data - The data object used to update the UI and dispatch events.
 */
export let fDispatch = async function (data, subpanelContext) {
    console.log("dispatch subpanel", data);
    appCtxService.registerCtx("UserInputPopUp", data);
}
/**
 * Function:fGetRuntimeConfiguration
 * Description: Function to retrieve the runtime configuration for a specific use case.
 * It communicates with the backend service to get the configuration based on the selected use case and debug level.
 * The function processes the response and handles any errors, updating the UI with the appropriate data or error message.
 * Moreover, this function data(textbox Node, lovNodes and ) passing to fCreateTextBox function based on this input popup is rendering
 *
 * @param {Object} data - The data object containing the context of the popup and information for the operation.
 * @param {Object} subpanelContext - The context of the sublocation, which includes the selected use case and debug level.
 */
export let fGetRuntimeConfiguration = async function (data, subpanelContext) {
    try {
        let errorMessage = null;
        console.log("fGetRuntimeConfiguration", data, subpanelContext)
        var usecasename = subpanelContext.dataProviders.useCaseProvider.selectedObjects[0].props.file.value;
        var debuglevel = subpanelContext.debugLevel.dbValue;
        let input = {
            inputData: {
                usecaseObject: {
                    name: usecasename,
                    type: "ExportUsecase",
                },
                extraData: {
                    debug_level: {
                        valueType: "StringType",
                        isArray: false,
                        stringValue: [debuglevel]
                    },
                    execute_non_published_usecase: {
                        valueType: "StringType",
                        isArray: false,
                        stringValue: ["true"]
                    }
                }
            }
        };
        var getruntimeconfigsoa = await _soaSvc.postUnchecked('EzXchange-2015-07-EzXchangeService', 'getRuntimeConfiguration', input).then(function (output) {
            console.log("Inside execute soa: ", output);
            return output;
        });
        // Check if partialErrors is present and has the expected structure
        if (getruntimeconfigsoa?.ServiceData?.partialErrors?.[0]?.errorValues?.[0]?.message) {
            errorMessage = getruntimeconfigsoa.ServiceData.partialErrors[0].errorValues[0].message;
        }
        // Check if modelObjects exists and use its message or equivalent property
        else if (getruntimeconfigsoa?.ServiceData?.modelObjects?.[0]?.message) {
            errorMessage = getruntimeconfigsoa.ServiceData.modelObjects[0].message;
        }
        if (errorMessage) {
            var errors = getruntimeconfigsoa.ServiceData.partialErrors[0].errorValues;
            console.log("errormessage is : ", errorMessage);
            for (let i = 0; i < errors.length; i++) {
                var errorcode = errors[i].code;  // Updated to use correct error value for this loop
                var errorlevel = errors[i].level;
                var errormessage = errors[i].message;

                // Concatenate error details with a newline
                errorMessage += "Error Code : " + errorcode + ", Level : " + errorlevel + ", Message : " + errormessage + "\n";
            }
            console.log("Final error message: ", errorMessage);
        } else {
            console.log("return from runtime soa: ", getruntimeconfigsoa);
            return await fCreateTextBox(getruntimeconfigsoa, data);//return textbox,property set,root uid object
        }
        //updating error message in output editor
        subpanelContext.editorOutput.dbValue = errorMessage;
        subpanelContext.dispatch({ path: 'subpanelContext', value: subpanelContext });
        if (subpanelContext.eventData.editorRef.monacoEditorInstance) {
            const editor = subpanelContext.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
            if (editor) {
                editor.setValue(errorMessage); // Set the editor's value to an empty string
            }
        }
    } catch (error) {
        console.log("runtimeconfiguration soa error", error);
        messageSvc.showError("Select Usecase before excuting input operation");
    }
}
/**
 * Function: fExecution
 * Description: Executes a specified use case and handles the output, including saving it to a file or displaying it in the UI. 
 * The function processes the input parameters, interacts with the SOA service, and handles the returned data (e.g., saving the result in a file, updating UI with output).
 * 
 * Parameters:
 * @param {Object} data - The data object containing context and configuration for the use case execution. It includes:
 *   - `data.dataProviders.useCaseProvider.selectedObjects`: Array of selected use cases for execution.
 *   - `data.outputType.dbValue`: The output format for the execution (e.g., JSON, XML).
 *   - `data.debugLevel.dbValue`: Debug level setting for the use case execution.
 *   - `data.editorInputXML.dbValue`: The XML input for use cases requiring XML processing (for import use cases).
 *   - `data.folderlocation`: Folder handle where the output file will be saved.
 *   - `data.outputFileLocation_EXP.dbValue`: Folder location for saving output file.
 *   - `data.eventData.editorRef.monacoEditorInstance`: Editor reference to update the editor with the execution result.
 * 
 * Behavior:
 * - Validates that required parameters like `usecasename`, `outputtype`, and `debuglevel` are provided before proceeding with execution.
 * - Creates a structured input (`executeinput`) with necessary data like `usecaseObject`, `debuglevel`, `PublishedStatus`, etc., based on the provided configuration.
 * - If the use case is of type "ImportUsecase", the XML input is added to the request data.
 * - Retrieves user input (e.g., properties like `vmpArray`, `property_set`, `obj_uids`) and adds them to the input data.
 * - If the execution is successful:
 *   - Saves the output data to the specified file (if the `outputFileLocation_EXP` is provided).
 *   - If the output format is supported, a file is created or overwritten in the specified directory, and the output is written into that file.
 *   - Updates the editor in the UI with the output data if no file save is required.
 * - If the execution results in an error:
 *   - Logs the error messages with error code, level, and message.
 *   - Updates the editor with the error details and shows the error message.
 *   - Handles errors gracefully by updating the UI with an appropriate message.
 * 
 * Error Handling:
 * - Handles various errors like missing parameters, SOA service failures, and file save issues.
 * - Provides detailed error messages and logs to help identify the issue.
 */
export let fExecution = async function (data, typeofusecase) {
    let ExecuteErrorMsg = "";
    // Retrieve user input context from appCtxService.
    let useInput = appCtxService.getCtx('UserInputPopUp');
    console.log("useInput", useInput);
    console.log("inside execute usecase: ", data);

    let usecasename = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.value; // usecasename from selected objects
    let outputtype = data.outputType.dbValue; // usecase type
    let debuglevel = data.debugLevel.dbValue; // debuglevel
    let markup_status = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.modelObjects.props.markup_status.dbValues[0]; //Publish status from selected usecase
    console.log("Markup_status: ", markup_status);
    var isPublished = 0;
    if (markup_status === null) {
        isPublished = 0;
    } else {
        isPublished = 1;
    }
    console.log("isPublished: ", isPublished);
    console.log("usecasename: ", usecasename);
    //Soa Input
    var executeinput = {
        input: {
            inputData: [{
                usecaseObject: {
                    name: usecasename,
                    type: typeofusecase,
                },
                isObjectBased: false,
                usecaseInput: {
                    UsecaseType: {
                        isArray: false,
                        valueType: "StringType",
                        stringValue: [data.useCaseType]
                    },
                    debug_level: {
                        isArray: false,
                        valueType: "StringType",
                        stringValue: [debuglevel]
                    },
                    PublishedStatus: {
                        isArray: false,
                        valueType: "IntegerType",
                        integerValue: [isPublished]
                    },
                    output_flag: {
                        isArray: false,
                        valueType: "StringType",
                        stringValue: [outputtype]
                    },
                    execute_non_published_usecase: {
                        isArray: false,
                        valueType: "StringType",
                        stringValue: ["true"]
                    }
                }
            }]
        }
    };
    //These data for import tab 
    if (typeofusecase === "ImportUsecase") {
        executeinput.input.inputData[0].usecaseInput["input_xml"] = {
            valueType: "StringType",
            isArray: false,
            stringValue: [data.editorInputXML.dbValue],
            referenceValue: [data.DirectoryUid]
        }
    }
    //These data get from ctx.
    if (useInput) { ///Adding userInput in export tab
        if (useInput.vmpArray.length > 0) {
            let textBox_arr = useInput.vmpArray;
            for (let index = 0; index < textBox_arr.length; index++) {
                var temp = {
                    isArray: false,
                    valueType: "StringType",
                    stringValue: [textBox_arr[index].dbValue]
                }
                executeinput.input.inputData[0].usecaseInput[textBox_arr[index].propertyName] = temp;
            }
        }
        if (useInput.property_set.dbValue != null) {//processing property set value 
            var temp1 = {
                isArray: false,
                valueType: "StringType",
                stringValue: [useInput.property_set.dbValue]
            }
            executeinput.input.inputData[0].usecaseInput[useInput.property_set.propertyName] = temp1;
        }
        if (useInput.obj_uids.dbValue != null) { //processing root objects uid's
            var temp2 = {
                isArray: false,
                valueType: "StringType",
                stringValue: [useInput.obj_uids.dbValue]
            }
            executeinput.input.inputData[0].usecaseInput[useInput.obj_uids.propertyName] = temp2;
        }
    }
    var soa = await _soaSvc.postUnchecked('EzXchange-2015-07-EzXchangeService', 'executeUsecase', executeinput).then(function (output) {
        console.log("Inside execute soa: ", output);
        return output;
    });
    console.log("Execute Soa return: ", soa);
    var soaOutput = soa.output;
    console.log("Execute Soa return data length: ", soaOutput.length);
    if (soaOutput.length > 0) {
        var outputData = soa.output[0].xmlData;
        if (data.outputFileLocation_EXP?.dbValue != null) {
            let file = data.outputFileLocation_EXP.dbValue; // folder name
            const directyhandle = data.folderlocation;
            console.log("directory handle object: ", directyhandle);
            try {
                let format = data.outputType.dbValue;
                let ext = format === "JSON" || format === "JSON_QLIK" ? ".json" :
                    format === "SYSLOG" ? ".syslog" : ".xml";

                // Prompt the user to select a folder
                let fileName = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.value;
                let downloadFileName = `${fileName}_${Date.now()}${ext}`; //download name 
                console.log("downloadFileName", downloadFileName);
                // Create or overwrite a file in the selected directory
                const fileHandle = await directyhandle.getFileHandle(downloadFileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(outputData);
                await writable.close();
                data.dispatch({ path: 'data.editorOutput.dbValue', value: `Output of use case is written to this file: ${downloadFileName},Inside in this folder: ${file}` });
                if (data.eventData.editorRef.monacoEditorInstance) {
                    const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
                    if (editor) {
                        editor.setValue(`Output of use case is written to this file: ${downloadFileName},Inside in this folder: ${file}`); // Set the editor's value to an empty string
                    }
                }
                data.folderlocation = "";
                data.outputFileLocation_EXP.dbValue = null;
                data.dispatch({ path: 'data', value: data });
                //alert("File saved successfully!");
            } catch (err) {
                console.error("Error saving file:", err);
            }
        } else {
            if (typeofusecase === "ImportUsecase") {
                data.editorOutput.dbValue = outputData;
                data.dispatch({ path: 'data', value: data });
                if (data.eventData.editorRef.monacoEditorInstance) {
                    const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[2]; // Get the active editor model
                    if (editor) {
                        editor.setValue(outputData); // Set the editor's value to an empty string
                    }
                }
            } else {
                data.editorOutput.dbValue = outputData;
                data.dispatch({ path: 'data', value: data });
                if (data.eventData.editorRef.monacoEditorInstance) {
                    const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
                    if (editor) {
                        editor.setValue(outputData); // Set the editor's value to an empty string
                    }
                }
            }
        }
    } else {//if contents error
        var errors = soa.ServiceData?.partialErrors[0]?.errorValues;
        for (let i = 0; i < errors.length; i++) {
            var errorcode = errors[i].code;  // Updated to use correct error value for this loop
            var errorlevel = errors[i].level;
            var errormessage = errors[i].message;

            // Concatenate error details with a newline
            ExecuteErrorMsg += "Error Code : " + errorcode + ", Level : " + errorlevel + ", Message : " + errormessage + "\n";
        }
        console.log("Final error message: ", ExecuteErrorMsg);
        if (typeofusecase === "ImportUsecase") {
            data.editorOutput.dbValue = ExecuteErrorMsg;
            data.dispatch({ path: 'data', value: data });
            if (data.eventData.editorRef.monacoEditorInstance) {
                const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[2]; // Get the active editor model
                if (editor) {
                    editor.setValue(ExecuteErrorMsg); // Set the editor's value to an empty string
                }
            }
        } else {
            data.editorOutput.dbValue = ExecuteErrorMsg;
            data.dispatch({ path: 'data', value: data });
            if (data.eventData.editorRef.monacoEditorInstance) {
                const editor = data.eventData.editorRef.monacoEditorInstance.getModels()[1]; // Get the active editor model
                if (editor) {
                    editor.setValue(ExecuteErrorMsg); // Set the editor's value to an empty string
                }
            }
        }

    }

}
/**
 * Function: updateFormData
 * Description: Updates the provided FormData object with the given key and value.
 * 
 * Parameters:
 * @param {FormData} formdata1 - The FormData object to be updated.
 * @param {string} key - The key (field name) to be appended to the FormData.
 * @param {string|Blob} value - The value to be associated with the key (can be a string or a file Blob).
 * 
 * Behavior:
 * - Appends the key and value to the provided FormData object.
 */
function updateFormData(formdata1, key, value) {
    console.log("Inside updateformdata: ", formdata1);
    if (formdata1) {
        formdata1.append(key, value);
    }
    console.log(formdata1);
};
/**
 * Function: uploadFiles
 * Description: Uploads files using a POST request to the specified URL with FormData.
 * 
 * Parameters:
 * @param {FormData} fromData - The FormData object containing files to be uploaded.
 * @param {string} url - The URL to which the files will be uploaded.
 * 
 * Returns:
 * - Promise that resolves with the result of the upload.
 */
export let uploadFiles = async function (fromData, url) {
    // user need write the post logic
    let deferred = AwPromiseService.instance.defer();
    AwHttpService.instance.post(url, fromData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        console.log("resoponse: ", response);
        // custom logic to process the response logic
    }).then(result => {
        deferred.resolve(result);
    }).catch(error => {
        deferred.reject(error);
    });
    console.log("returning: ", deferred.promise);
    return deferred.promise;
};

/**
 * Function: callSOA
 * Description: Calls a SOA (Service-Oriented Architecture) service to create datasets and upload files.
 * 
 * Parameters:
 * @param {string} folder - The folder where the dataset will be attached (Primary object).
 * @param {string} filename - The name of the file to be uploaded.
 * @param {string} filedesc - The description of the file to be uploaded.
 * @param {Blob} filedata - The Blob representing the file content.
 * @param {string} url - The URL to which the file will be uploaded.
 * 
 * Behavior:
 * - Calls SOA to create a dataset.
 * - Uploads the file after dataset creation.
 * - Commits the dataset file to the server after uploading.
 */
async function callSOA(folder, filename, filedesc, filedata, url) {
    console.log("Inside SOA CAll");
    console.log("inside the soa and the folder value is: ", folder);
    let name = filename.split(".");
    var datasetname = name[0];
    console.log("datasetname: ", datasetname);
    var input = {
        "input": [{
            "clientId": datasetname,
            "container": folder,
            "relationType": "contents",
            "description": filedesc,
            "datasetFileInfos": [{
                "fileName": filename,
                "isText": true,
                "namedReferenceName": "Text"
            }],
            "name": datasetname,
            "type": "Text"
        }]
    };
    var soa = await _soaSvc.postUnchecked('Core-2010-04-DataManagement', 'createDatasets', input).then(function (output) {
        console.log("Inside soa calling: ", output);
        return output;
    });
    console.log("outside");
    console.log(soa);
    let formData1 = new FormData();
    var value = soa.datasetOutput[0].commitInfo[0].datasetFileTicketInfos[0].ticket;
    updateFormData(formData1, "fmsFile", filedata);
    updateFormData(formData1, "fmsTicket", value);
    console.log("Formdata: ", formData1);
    console.log("fmsurl: ", url)
    await uploadFiles(formData1, url);
    var commitinput = {
        "commitInput": [{
            "dataset": soa.datasetOutput[0].commitInfo[0].dataset,
            "createNewVersion": true,
            "datasetFileTicketInfos": [{
                "datasetFileInfo": {
                    "clientId": soa.datasetOutput[0].clientId,
                    "fileName": soa.datasetOutput[0].commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.fileName,
                    "namedReferencedName": soa.datasetOutput[0].commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.namedReferenceName,
                    "isText": soa.datasetOutput[0].commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.isText,
                    "allowReplace": soa.datasetOutput[0].commitInfo[0].datasetFileTicketInfos[0].datasetFileInfo.allowReplace
                },
                "ticket": value
            }]
        }]
    };
    var commitsoa = await _soaSvc.postUnchecked('Core-2006-03-FileManagement', 'commitDatasetFiles', commitinput).then(function (output) {
        console.log("Inside commit soa calling: ", output);
        return output;
    });
    console.log("commitsoa: ", commitsoa);
    // location.reload(true); // This will force the page to reload from the server
};
/**
 * Function: fCreateusecase
 * Description: Creates a new use case and uploads it to the specified Folder. 
 * If the use case type is 'Import', it also creates and uploads an additional Input XML file. 
 * Ensures that the use case name is unique before proceeding with the creation process.
 * 
 * Parameters:
 * @param {Object} data - The data object containing use case details and settings. It includes:
 *   - `data.subPanelContext.DirectoryUid`: The folder UID where the use case will be stored.
 *   - `data.Usecasename.dbValue`: The name of the use case.
 *   - `data.description.dbValue`: The description of the use case.
 *   - `data.inputName.dbValue`: The input file name for the use case.
 *   - `data.subPanelContext.usecaseName`: Array of existing use case names to check for duplicates.
 *   - `data.subPanelContext.useCaseType`: The type of use case, used to determine if an additional input file should be created.
 * @param {string} url - The URL to which the files will be uploaded.
 * 
 * Behavior:
 * - Checks if the use case name already exists in the list of existing use cases.
 *   - If it does, an error message is shown.
 *   - If not, the use case is created with the provided details and uploaded.
 * - If the use case type is 'Import', an additional input file is created with the suffix "_input.xml" and uploaded.
 * - The `callSOA` function is called to create and upload the use case and the input file (if applicable).
 * - The event bus is used to notify that the operation is complete and triggers a table reload.
 */
export let fCreateusecase = async function (data, url) {

    console.log(data);
    console.log("need to add actions");
    var folder = data.subPanelContext.DirectoryUid;
    console.log("return from ezxchange folder: ", folder);
    var filename = data.Usecasename.dbValue;
    var filedesc = data.description.dbValue;
    var inputfile = data.inputName.dbValue;
    let usecasearray = data.subPanelContext.usecaseName;
    if (usecasearray.includes(filename)) {
        messageSvc.showError("Usecase Name Already Exists...Try another name");
    } else {
        filename += ".xml";
        console.log("filename: ", filename);
        console.log("file desc: ", filedesc);
        const FileBlob = new Blob([], { type: 'application/xml' });
        await callSOA(folder, filename, filedesc, FileBlob, url);
        eventBus.publish('aw.complete');
        if (data.subPanelContext.useCaseType === 'Import') {
            inputfile += "_input.xml";
            console.log("inputfilename: ", inputfile);
            const inputFileBlob = new Blob([], { type: 'application/xml' });
            await callSOA(folder, inputfile, "", inputFileBlob, url);
            eventBus.publish('aw.complete');
        }
    }
    eventBus.publish('ezXChangeGridTable.plTable.reload');
};
/**
 * Function: fImportingUseCase
 * Description: Handles the import of XML files from the user's local system. 
 * Creates a file input dialog to allow the user to select multiple files. Each selected file is 
 * validated and uploaded to the specified folder via the SOA service. If files already exist 
 * in the use case, they are skipped. The function provides feedback on the number of successful 
 * and failed imports.
 *
 * Parameters:
 * @param {Object} data - The data object containing the folder location and use case details.
 *   - `data.DirectoryUid`: The folder UID where the files should be uploaded.
 *   - `data.usecaseName`: List of existing use case names to check if the file already exists.
 * @param {string} url - The URL used for uploading the files.
 *
 * Behavior:
 * - Triggers a file input dialog allowing the user to select multiple XML files.
 * - Validates the file names to ensure they do not conflict with existing use case names.
 * - Reads each file as a binary (ArrayBuffer), uploads them to the specified folder, and tracks the number of successful and failed imports.
 * - Displays success or error messages based on the result of the imports.
 * - Reloads the table after the operation is completed.
 */
export let fImportingUseCase = async function (data, url) {
    console.log("Inside Importing Usecase: ", data);

    // Create a file input element dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xml'; // Restrict file selection to XML files
    fileInput.style.display = 'none'; // Hide the file input element
    fileInput.multiple = true; // Allow multiple files to be selected

    // Trigger the file input dialog when the function is called
    fileInput.click();
    var folder = data.DirectoryUid;
    console.log("folder uid tags", folder);

    // Handle file selection
    fileInput.addEventListener('change', async function (event) {
        const selectedFiles = event.target.files;

        if (selectedFiles.length > 0) {
            console.log(`Selected ${selectedFiles.length} file(s):`);

            let importedFilesCount = 0; // To track how many files have been imported successfully
            let totalFiles = selectedFiles.length; // Total files selected for import
            let filesFailedToImport = 0; // To track failed imports (files that couldn't be uploaded)

            // Iterate over the selected files
            for (let i = 0; i < selectedFiles.length; i++) {
                const selectedFile = selectedFiles[i];
                const filename = selectedFile.name; // Store the filename
                var filenametemp = filename.split(".");
                console.log('Selected file:', filename);
                var usecaselists = data.usecaseName;
                console.log("current datasets", usecaselists);

                if (!usecaselists.includes(filenametemp[0])) {
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        // File content as an ArrayBuffer (binary)
                        const fileContent = e.target.result;
                        console.log('File content (binary):', fileContent);

                        // Create a Blob from the ArrayBuffer (binary data)
                        const fileBlob = new Blob([fileContent], { type: 'application/xml' });
                        console.log('Blob:', fileBlob);

                        try {
                            // Call SOA and upload the file as a Blob
                            const soaResponse = await callSOA(folder, filename, "", fileBlob, url); // Pass the file as a Blob
                            console.log("soaResponse: ", soaResponse);

                            // Increment the counter for successful imports
                            importedFilesCount++;

                            // If it's the last file and we have finished importing, show success message
                            if (importedFilesCount + filesFailedToImport === totalFiles) {
                                if (importedFilesCount === totalFiles) {
                                    messageSvc.showInfo("All files imported successfully.");
                                } else {
                                    messageSvc.showError(`${filesFailedToImport} files failed to import.`);
                                }
                                eventBus.publish('ezXChangeGridTable.plTable.reload');
                            }
                        } catch (error) {
                            // Handle error (file failed to upload)
                            console.error("Error uploading file:", error);
                            filesFailedToImport++;

                            // If it's the last file and we have finished processing all, show error message
                            if (importedFilesCount + filesFailedToImport === totalFiles) {
                                messageSvc.showError(`${filesFailedToImport} files failed to import.`);
                                eventBus.publish('ezXChangeGridTable.plTable.reload');
                            }
                        }
                    };

                    // Read the file as binary (ArrayBuffer)
                    reader.readAsArrayBuffer(selectedFile);
                } else {
                    console.log("Skipping file as it already exists in the Usecases");
                    filesFailedToImport++;

                    // If it's the last file and we have finished processing all, show error message
                    if (importedFilesCount + filesFailedToImport === totalFiles) {
                        messageSvc.showError(`${filesFailedToImport} files failed to import.`);
                        eventBus.publish('ezXChangeGridTable.plTable.reload');
                    }
                }
            }

        } else {
            console.log("No files selected");
            messageSvc.showError("No files were selected");
        }
    });

    // Trigger reload event if no file was selected or event is fired
    eventBus.publish('ezXChangeGridTable.plTable.reload');
};

/**
 * Function: fDownloadOutputFile
 * Description: Downloads a file (XML/JSON/SYSLOG) to the user's local system. 
 * Prompts the user to select a folder and saves the output file with the appropriate extension.
 *
 * Parameters:
 * @param {Object} data - The data object containing the output file information.
 *   - `data.outputType.dbValue`: The format of the output (JSON, SYSLOG, XML).
 *   - `data.dataProviders.useCaseProvider.selectedObjects[0].props.file.value`: The name of the file to be downloaded.
 *   - `data.editorOutput.dbValue`: The content to be saved in the output file.
 *
 * Behavior:
 * - Prompts the user to select a folder where the file should be saved.
 * - Saves the output content in the selected folder with an appropriate file extension based on the output type.
 * - Displays a success message once the file is saved.
 */
export let fDownloadOutputFile = async function (data) {
    console.log("dd", data)
    try {
        let format = data.outputType.dbValue;
        let ext = format === "JSON" || format === "JSON_QLIK" ? ".json" :
            format === "SYSLOG" ? ".syslog" : ".xml";

        // Prompt the user to select a folder
        let fileName = data.dataProviders.useCaseProvider.selectedObjects[0].props.file.value;
        let downloadFileName = `${fileName}_${Date.now()}${ext}`;
        console.log("downloadFileName", downloadFileName);
        const dirHandle = await window.showDirectoryPicker();
        console.log("dirHandle", dirHandle)
        // Create or overwrite a file in the selected directory
        const fileHandle = await dirHandle.getFileHandle(downloadFileName, { create: true });
        const writable = await fileHandle.createWritable();
        // XML Content
        //  var cc=
        const xmlContent = data.editorOutput.dbValue
        // Write content to the file
        await writable.write(xmlContent);
        await writable.close();

        alert("File saved successfully!");
    } catch (err) {
        console.error("Error saving file:", err);
    }

}
/**
 * Function: fgetfilepath
 * Description: Prompts the user to select a directory and sets the location for the output file in the data object.
 * 
 * Parameters:
 * @param {Object} data - The data object containing the location details.
 *   - `data.folderlocation`: Stores the folder handle selected by the user.
 *   - `data.outputFileLocation_EXP`: Contains the location of the output file.
 *
 * Behavior:
 * - Prompts the user to select a folder.
 * - Sets the folder location in the `data.folderlocation` field and updates the `outputFileLocation_EXP` with the directory name.
 */
export let fgetfilepath = async function (data) {
    console.log("datas inside filepath:", data);
    try {
        // Prompt the user to select a folder
        const dirHandle = await window.showDirectoryPicker();
        console.log("Directory Handle: ", dirHandle);

        // Example of retrieving the directory path (browser environments might limit access to actual paths)
        const directoryName = dirHandle.name;
        console.log("Selected Directory Name: ", directoryName);
        data.folderlocation = dirHandle;
        data.outputFileLocation_EXP.dbValue = directoryName;
        data.outputFileLocation_EXP.dispValue = directoryName;
        data.outputFileLocation_EXP.uiValue = directoryName;
        data.dispatch({ path: 'data', value: data });

    } catch (err) {
        console.error("Error selecting directory:", err);
        alert("Failed to select a directory.");
    }
};
/**
 * Function: fvalidateContent
 * Description: Validates the XML content in the editor. Checks for errors such as invalid XML declaration,
 * mismatched tags, and other structural issues. Displays error markers in the Monaco editor for invalid content.
 *
 * Parameters:
 * @param {Object} data - The data object containing editor information.
 *   - `data.eventData.editorRef.monaco`: The Monaco editor instance used for validation.
 * @param {string} content - The XML content to be validated.
 *
 * Behavior:
 * - Validates the XML declaration format if present.
 * - Checks the XML structure using the XMLValidator.
 * - Verifies matching opening and closing tags.
 * - Marks errors in the Monaco editor using `monaco.MarkerSeverity.Error` for invalid content.
 */
export let fvalidateContent = async function (data, content) {
    try {
        let monaco = data.eventData.editorRef.monaco;
        console.log("content: ", content);
        if (!monaco) {
            console.error("Monaco instance is not available for validation.");
            return;
        } else {
            const markers = [];
            const filteredContent = content.replace(/<Sequence>[\s\S]*?<\/Sequence>/, "");
            const parser = new DOMParser();
            const parsedXML = parser.parseFromString(filteredContent, "application/xml");
 
            // Check for parsing errors
            const parseError = parsedXML.getElementsByTagName("parsererror");
            if (parseError.length > 0) {
                console.log("XML Parsing Error Detected:");
                const errorText = parseError[0].textContent;
                console.log(errorText);
 
            } else {
                console.log("No core XML parsing errors detected.");
 
                // Additional validation for unexpected text content
                const elements = parsedXML.getElementsByTagName("*");
                let hasInvalidText = false;
 
                for (let i = 0; i < elements.length; i++) {
                    const node = elements[i];
                    // Check for unexpected text content
                    if (node.childNodes.length > 1) {
                        for (let j = 0; j < node.childNodes.length; j++) {
                            const child = node.childNodes[j];
                            if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim() !== "") {
                                const invalidText = child.nodeValue.trim();
                                const textIndex = content.indexOf(invalidText);
                                if (textIndex !== -1) {
                                    // Calculate line and column number
                                    const lines = content.substring(0, textIndex).split("\n");
                                    const lineNumber = lines.length;
                                    const startcolumn = lines[lines.length - 1].length + 1;
                                    const endColumn = startcolumn + invalidText.length - 1
                                    console.log(
                                        `Invalid text content found: "${invalidText}" in <${node.tagName}> at line ${lineNumber}, column ${startcolumn}, end column ${endColumn}`
                                    );
                                    hasInvalidText = true;
                                    markers.push({
                                        severity: monaco.MarkerSeverity.Error,
                                        startLineNumber: lineNumber,
                                        startColumn: startcolumn,
                                        endLineNumber: lineNumber,
                                        endColumn: endColumn,
                                        message: `Invalid text content found: "${invalidText}" at line ${lineNumber}`,
                                    });
                                }
 
                            }
                        }
                    }
                }
 
                if (!hasInvalidText) {
                    console.log("XML structure and content are valid.");
                }
 
            }
            // Apply markers to the Monaco editor
            const model = data.eventData.editorRef.monacoEditorInstance.getModels()[0];
            if (model) {
                monaco.editor.setModelMarkers(model, 'validation', markers);
                if (markers.length > 0) {
                    console.log("Validation complete: Errors highlighted in Monaco editor.");
                } else {
                    console.log("Validation complete: No errors to highlight.");
                }
            } else {
                console.error("Editor model is not available.");
            }
 
        }
    } catch (error) {
        console.error("An error occurred during validation:", error);
    }
};
export default exports = {
    fsetInputName,
    fCommentLine,
    fLoadUseCaseList,
    fGetUseCaseList,
    fCreateusecase,
    hidePopup,
    checkBoxRendererfn,
    fValidate,
    fGetDebugLevel,
    fGetOutputTypeList,
    handleCheckboxChange,
    fSetPropertiesSOA,
    callSOA,
    fImportingUseCase,
    fDeleteUseCase,
    fGetContentofUsecase,
    floadSavedata,
    fPublishUseCase,
    fValidatetoPublishAll,
    fClearOutputEditor,
    fGetRuntimeConfiguration,
    fCreateTextBox,
    fSetSelection,
    fExecution,
    fDispatch,
    fDownloadOutputFile,
    fgetfilepath,
    fvalidateContent,
    fValidateActiveView
}





