/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors
 * SPDX-License-Identifier: EPL-2.0
 */
angular.module('platformDialogs', [])
    .directive('dialogs', ['messageHub', 'Extensions', 'extensionPoints', function (messageHub, Extensions, extensionPoints) {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            link: function (scope, element) {
                let dialogWindows;
                Extensions.get('dialogWindow', extensionPoints.dialogWindows).then(function (data) {
                    dialogWindows = data;
                });
                let messageBox = element[0].querySelector("#dgIdeAlert");
                let ideDialog = element[0].querySelector("#dgIdeDialog");
                let ideBusyDialog = element[0].querySelector("#dgIdeBusyDialog");
                let ideFormDialog = element[0].querySelector("#dgIdeFormDialog");
                let ideSelectDialog = element[0].querySelector("#dgIdeSelectDialog");
                let ideDialogWindow = element[0].querySelector("#dgIdeDialogWindow");
                let alerts = [];
                let windows = [];
                let dialogs = [];
                let busyDialogs = [];
                let loadingDialogs = [];
                let formDialogs = [];
                let selectDialogs = [];
                element.on('contextmenu', event => event.stopPropagation());
                scope.searchInput = { value: '' };
                scope.activeDialog = null;
                scope.alert = {
                    title: "",
                    message: "",
                    type: "information", // information, error, success, warning
                };
                scope.dialog = {
                    id: null,
                    header: "",
                    subheader: "",
                    title: "",
                    body: [],
                    footer: "",
                    buttons: [],
                    callbackTopic: null,
                    loader: false,
                };
                scope.busyDialog = {
                    id: null,
                    text: '',
                    callbackTopic: '',
                };
                scope.formDialog = {
                    id: null,
                    header: "",
                    subheader: "",
                    title: "",
                    footer: "",
                    buttons: [],
                    loadingMessage: "",
                    loader: false,
                    callbackTopic: null,
                    items: [],
                };
                scope.selectDialog = {
                    title: "",
                    listItems: [],
                    selectedItems: 0,
                    selectedItemId: "",
                    callbackTopic: "",
                    isSingleChoice: true,
                    hasSearch: false
                };
                scope.window = {
                    title: "",
                    dialogWindowId: "",
                    callbackTopic: null,
                    link: "",
                    parameters: "",
                    closable: true,
                };

                scope.showAlert = function () {
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    scope.alert = alerts[0];
                    messageBox.classList.add("fd-message-box--active");
                    scope.activeDialog = 'alert';
                };

                scope.hideAlert = function () {
                    messageBox.classList.remove("fd-message-box--active");
                    alerts.shift();
                    checkForDialogs();
                };

                scope.showDialog = function () {
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    scope.dialog = dialogs[0];
                    ideDialog.classList.add("fd-dialog--active");
                    scope.activeDialog = 'dialog';
                };

                scope.hideDialog = function (buttonId) {
                    if (buttonId && scope.dialog.callbackTopic) messageHub.postMessage(scope.dialog.callbackTopic, buttonId, true);
                    ideDialog.classList.remove("fd-dialog--active");
                    dialogs.shift();
                    checkForDialogs();
                };

                scope.showFormDialog = function () {
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    scope.formDialog = formDialogs[0];
                    ideFormDialog.classList.add("fd-dialog--active");
                    scope.activeDialog = 'form';
                    requestAnimationFrame(function () {
                        if (scope.formDialog.items.length) {
                            for (let i = 0; i < scope.formDialog.items.length; i++) {
                                if (scope.formDialog.items[i].type === 'input' || scope.formDialog.items[i].type === 'textarea') {
                                    let input = ideFormDialog.querySelector(`#${scope.formDialog.items[i].id}`);
                                    if (!scope.formDialog.items[i].visibility || scope.formDialog.items[i].visibility.$isVisible) {
                                        input.focus();
                                        break;
                                    }
                                }
                            }
                        }
                    });
                };

                scope.formDialogAction = function (buttonId) {
                    scope.formDialog.loader = true;
                    messageHub.postMessage(scope.formDialog.callbackTopic, { buttonId: buttonId, formData: scope.formDialog.items }, true);
                };

                scope.hideFormDialog = function (id) {
                    if (id === scope.formDialog.id) {
                        ideFormDialog.classList.remove("fd-dialog--active");
                        formDialogs.shift();
                        checkForDialogs();
                    } else {
                        for (let i = 0; i < formDialogs.length; i++) {
                            if (formDialogs[i].id === id) {
                                formDialogs.splice(i, 1);
                                break;
                            }
                        }
                    }
                };

                scope.showLoadingDialog = function () {
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    scope.dialog = loadingDialogs[0];
                    ideDialog.classList.add("fd-dialog--active");
                    scope.activeDialog = 'dialog';
                };

                scope.hideLoadingDialog = function (id) {
                    if (id === scope.dialog.id) {
                        ideDialog.classList.remove("fd-dialog--active");
                        loadingDialogs.shift();
                        checkForDialogs();
                    } else {
                        for (let i = 0; i < loadingDialogs.length; i++) {
                            if (loadingDialogs[i].id === id) {
                                loadingDialogs.splice(i, 1);
                                break;
                            }
                        }
                    }
                };

                scope.showBusyDialog = function () {
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    scope.busyDialog = busyDialogs[0];
                    ideBusyDialog.classList.add("fd-dialog--active");
                    scope.activeDialog = 'busy';
                };

                scope.hideBusyDialog = function (id, fromUser = false) {
                    if (id === scope.busyDialog.id) {
                        if (fromUser) messageHub.triggerEvent(scope.busyDialog.callbackTopic, true);
                        ideBusyDialog.classList.remove("fd-dialog--active");
                        busyDialogs.shift();
                        checkForDialogs();
                    } else {
                        for (let i = 0; i < busyDialogs.length; i++) {
                            if (busyDialogs[i].id === id) {
                                busyDialogs.splice(i, 1);
                                break;
                            }
                        }
                    }
                };

                scope.itemSelected = function (item) {
                    if (scope.selectDialog.isSingleChoice) {
                        scope.selectDialog.selectedItemId = item;
                        scope.selectDialog.selectedItems = 1;
                    } else {
                        if (item) scope.selectDialog.selectedItems += 1;
                        else scope.selectDialog.selectedItems -= 1;
                    }
                };

                scope.searchChanged = function () {
                    let value = scope.searchInput.value.toLowerCase();
                    if (value === "") scope.clearSearch();
                    else for (let i = 0; i < scope.selectDialog.listItems.length; i++) {
                        if (!scope.selectDialog.listItems[i].text.toLowerCase().includes(value))
                            scope.selectDialog.listItems[i].hidden = true;
                    }
                };

                scope.clearSearch = function () {
                    scope.searchInput.value = "";
                    for (let i = 0; i < scope.selectDialog.listItems.length; i++) {
                        scope.selectDialog.listItems[i].hidden = false;
                    }
                };

                scope.showSelectDialog = function () {
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    scope.selectDialog = selectDialogs[0];
                    ideSelectDialog.classList.add("fd-dialog--active");
                    scope.activeDialog = 'select';
                };

                scope.hideSelectDialog = function (id, action) {
                    if (id === scope.selectDialog.id) {
                        if (action === "select") {
                            if (scope.selectDialog.selectedItems > 0 || scope.selectDialog.selectedItemId !== "")
                                if (scope.selectDialog.isSingleChoice)
                                    messageHub.postMessage(
                                        scope.selectDialog.callbackTopic,
                                        {
                                            selected: scope.selectDialog.selectedItemId
                                        },
                                        true
                                    );
                                else messageHub.postMessage(
                                    scope.selectDialog.callbackTopic,
                                    {
                                        selected: getSelectedItems()
                                    },
                                    true
                                );
                            else return;
                        } else {
                            let selected;
                            if (scope.selectDialog.isSingleChoice) selected = "";
                            else selected = [];
                            messageHub.postMessage(
                                scope.selectDialog.callbackTopic,
                                { selected: selected },
                                true
                            );
                        }
                        ideSelectDialog.classList.remove("fd-dialog--active");
                        element[0].classList.add("dg-hidden");
                        selectDialogs.shift();
                        checkForDialogs();
                    } else {
                        for (let i = 0; i < selectDialogs.length; i++) {
                            if (selectDialogs[i].id === id) {
                                selectDialogs.splice(i, 1);
                                break;
                            }
                        }
                    }
                };

                scope.showWindow = function () {
                    scope.window = windows[0];
                    if (scope.window.link === "") {
                        console.error(
                            "Dialog Window Error: The link property is missing."
                        );
                        windows.shift();
                        checkForDialogs();
                        return;
                    }
                    if (element[0].classList.contains("dg-hidden"))
                        element[0].classList.remove("dg-hidden");
                    ideDialogWindow.classList.add("fd-dialog--active");
                    scope.activeDialog = 'window';
                };

                scope.hideWindow = function () {
                    if (scope.window.callbackTopic) {
                        messageHub.triggerEvent(scope.window.callbackTopic, true);
                        scope.window.callbackTopic = null;
                    }
                    ideDialogWindow.classList.remove("fd-dialog--active");
                    windows.shift();
                    scope.window.link = "";
                    scope.window.parameters = "";
                    scope.window.title = "";
                    scope.window.dialogWindowId = "";
                    scope.window.link = "";
                    scope.window.parameters = "";
                    scope.window.closable = true;
                    checkForDialogs();
                };

                scope.shouldHide = function (item) {
                    if (item.visibility) {
                        for (let i = 0; i < scope.formDialog.items.length; i++) {
                            if (scope.formDialog.items[i].id === item.visibility.id && scope.formDialog.items[i].value === item.visibility.value) {
                                if (item.visibility.hidden) {
                                    item.visibility.$isVisible = true;
                                    return false;
                                } else {
                                    item.visibility.$isVisible = false;
                                    return true;
                                }
                            }
                        }
                        item.visibility.$isVisible = !item.visibility.hidden;
                        return item.visibility.hidden;
                    }
                    return false;
                };

                function checkForDialogs() {
                    scope.activeDialog = null;
                    if (selectDialogs.length > 0) scope.showSelectDialog();
                    else if (formDialogs.length > 0) scope.showFormDialog();
                    else if (dialogs.length > 0) scope.showDialog();
                    else if (alerts.length > 0) scope.showAlert();
                    else if (loadingDialogs.length > 0) scope.showLoadingDialog();
                    else if (busyDialogs.length > 0) scope.showBusyDialog();
                    else if (windows.length > 0) scope.showWindow();
                    else element[0].classList.add("dg-hidden");
                }

                messageHub.onDidReceiveMessage(
                    "ide.alert",
                    function (data) {
                        scope.$apply(function () {
                            let type;
                            if (data.type) {
                                switch (data.type.toLowerCase()) {
                                    case "success":
                                        type = "success";
                                        break;
                                    case "warning":
                                        type = "warning";
                                        break;
                                    case "info":
                                        type = "information";
                                        break;
                                    case "error":
                                        type = "error";
                                        break;
                                    default:
                                        type = "information";
                                        break;
                                }
                            }
                            alerts.push({
                                title: data.title,
                                message: data.message,
                                type: type,
                            });
                            if (!scope.activeDialog && alerts.length < 2) {
                                scope.showAlert();
                            }
                        });
                    },
                    true
                );

                function getDialogBody(body) {
                    if (Array.isArray(body)) return body;
                    return [body];
                }

                messageHub.onDidReceiveMessage(
                    "ide.dialog",
                    function (data) {
                        scope.$apply(function () {
                            dialogs.push({
                                header: data.header,
                                subheader: data.subheader,
                                title: data.title,
                                body: getDialogBody(data.body),
                                footer: data.footer,
                                loader: data.loader,
                                buttons: data.buttons,
                                callbackTopic: data.callbackTopic
                            });
                            if (!scope.activeDialog && dialogs.length < 2) {
                                scope.showDialog();
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.formDialog.show",
                    function (data) {
                        scope.$apply(function () {
                            formDialogs.push({
                                id: data.id,
                                header: data.header,
                                subheader: data.subheader,
                                title: data.title,
                                items: data.items,
                                loadingMessage: data.loadingMessage,
                                loader: false,
                                footer: data.footer,
                                buttons: data.buttons,
                                callbackTopic: data.callbackTopic,
                            });
                            if (!scope.activeDialog && formDialogs.length < 2) {
                                scope.showFormDialog();
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.formDialog.update",
                    function (data) {
                        scope.$apply(function () {
                            if (scope.formDialog && data.id === scope.formDialog.id) {
                                scope.formDialog.items = data.items;
                                if (data.subheader)
                                    scope.formDialog.subheader = data.subheader;
                                if (data.footer)
                                    scope.formDialog.footer = data.footer;
                                if (data.loadingMessage)
                                    scope.formDialog.loadingMessage = data.loadingMessage;
                                scope.formDialog.loader = false;
                            } else {
                                for (let i = 0; i < formDialogs.length; i++) {
                                    if (formDialogs[i].id === data.id) {
                                        formDialogs[i].items = data.items;
                                        if (data.subheader)
                                            formDialogs[i].subheader = data.subheader;
                                        if (data.footer)
                                            formDialogs[i].footer = data.footer;
                                        if (data.loadingMessage)
                                            formDialogs[i].loadingMessage = data.loadingMessage;
                                        formDialogs[i].loader = false;
                                        break;
                                    }
                                }
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.formDialog.hide",
                    function (data) {
                        scope.$apply(function () {
                            scope.hideFormDialog(data.id);
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.loadingDialog.show",
                    function (data) {
                        scope.$apply(function () {
                            loadingDialogs.push({
                                id: data.id,
                                title: data.title,
                                header: '',
                                subheader: '',
                                footer: '',
                                status: data.status,
                                loader: true,
                            });
                            if (!scope.activeDialog && loadingDialogs.length < 2) {
                                scope.showLoadingDialog();
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.loadingDialog.update",
                    function (data) {
                        scope.$apply(function () {
                            if (scope.dialog && data.id === scope.dialog.id) {
                                scope.dialog.status = data.status;
                            } else {
                                for (let i = 0; i < loadingDialogs.length; i++) {
                                    if (loadingDialogs[i].id === data.id) {
                                        loadingDialogs[i].status = data.status;
                                        break;
                                    }
                                }
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.loadingDialog.hide",
                    function (data) {
                        scope.$apply(function () {
                            scope.hideLoadingDialog(data.id);
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.busyDialog.show",
                    function (data) {
                        scope.$apply(function () {
                            busyDialogs.push({
                                id: data.id,
                                text: data.text,
                                callbackTopic: data.callbackTopic,
                            });
                            if (!scope.activeDialog && busyDialogs.length < 2) {
                                scope.showBusyDialog();
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.busyDialog.hide",
                    function (data) {
                        scope.$apply(function () {
                            scope.hideBusyDialog(data.id);
                        });
                    },
                    true
                );

                scope.isRequired = function (visibility = { $isVisible: true }, required = false) {
                    if (visibility.$isVisible === false) return false;
                    return required;
                };

                scope.isValid = function (isValid, item) {
                    if (isValid) {
                        item.error = false;
                    } else {
                        item.error = true;
                    }
                };

                function getSelectedItems() {
                    let selected = [];
                    for (let i = 0; i < scope.selectDialog.listItems.length; i++) {
                        if (scope.selectDialog.listItems[i].selected)
                            selected.push(scope.selectDialog.listItems[i].ownId);
                    }
                    return selected;
                }

                function getSelectDialogList(listItems) {
                    return listItems.map(
                        function (item, index) {
                            return {
                                "id": `idesdl${index}`,
                                "ownId": item.id,
                                "text": item.text,
                                "hidden": false,
                                "selected": false
                            };
                        }
                    );
                }

                messageHub.onDidReceiveMessage(
                    "ide.selectDialog",
                    function (data) {
                        scope.$apply(function () {
                            selectDialogs.push({
                                title: data.title,
                                listItems: getSelectDialogList(data.listItems),
                                selectedItems: 0,
                                callbackTopic: data.callbackTopic,
                                isSingleChoice: data.isSingleChoice,
                                hasSearch: data.hasSearch
                            });
                            if (!scope.activeDialog && selectDialogs.length < 2) {
                                scope.showSelectDialog();
                            }
                        });
                    },
                    true
                );

                function getDialogParams(params) {
                    if (params) {
                        params['container'] = 'dialog';
                        params['perspectiveId'] = perspective.id;
                    } else {
                        params = {
                            container: 'layout',
                            perspectiveId: perspective.id,
                        };
                    }
                    return JSON.stringify(params);
                }

                messageHub.onDidReceiveMessage(
                    "ide.embedded.dialogWindow",
                    function (msg) {
                        scope.$apply(function () {
                            windows.push({
                                title: msg.data.serviceData.label,
                                dialogWindowId: msg.data.serviceData.id,
                                callbackTopic: msg.data.callbackTopic,
                                link: msg.data.serviceData.link,
                                params: getDialogParams(msg.data.params),
                                closable: msg.data.closable,
                            });
                            if (!scope.activeDialog && windows.length < 2) {
                                scope.showWindow();
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.dialogWindow",
                    function (data) {
                        scope.$apply(function () {
                            if (data.serviceData) {
                                windows.push({
                                    title: data.serviceData.label,
                                    dialogWindowId: data.dialogWindowId,
                                    callbackTopic: data.callbackTopic,
                                    link: data.serviceData.link,
                                    params: getDialogParams(data.params),
                                    closable: data.closable,
                                });
                                if (!scope.activeDialog && windows.length < 2) {
                                    scope.showWindow();
                                }
                            } else {
                                let found = false;
                                for (let i = 0; i < dialogWindows.length; i++) {
                                    if (dialogWindows[i].id === data.dialogWindowId) {
                                        found = true;
                                        windows.push({
                                            title: dialogWindows[i].label,
                                            dialogWindowId: dialogWindows[i].id,
                                            callbackTopic: data.callbackTopic,
                                            link: dialogWindows[i].link,
                                            params: getDialogParams(data.params),
                                            closable: data.closable,
                                        });
                                        break;
                                    }
                                }
                                if (found) {
                                    if (!scope.activeDialog && windows.length < 2) {
                                        scope.showWindow();
                                    }
                                } else console.error(
                                    `Dialog Window Error: There is no window dialog with such id: ${data.dialogWindowId}`
                                );
                            }
                        });
                    },
                    true
                );

                messageHub.onDidReceiveMessage(
                    "ide.dialogWindow.close",
                    function (data) {
                        scope.$apply(function () {
                            if (data.dialogWindowId === scope.window.dialogWindowId) {
                                if (windows.length > 1 && windows[1].dialogWindowId === data.dialogWindowId) windows.splice(1, 1);
                                scope.hideWindow();
                            } else {
                                for (let i = 0; i < windows.length; i++) {
                                    if (windows[i].dialogWindowId === data.dialogWindowId) {
                                        windows.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        });
                    },
                    true
                );
            },
            templateUrl: '/services/web/resources-core/ui/templates/ideDialogs.html'
        }
    }]);