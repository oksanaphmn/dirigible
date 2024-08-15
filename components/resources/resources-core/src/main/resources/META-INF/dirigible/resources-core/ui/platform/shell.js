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
angular.module('platformShell', ['ngCookies', 'platformUser', 'platformBrand', 'platformExtensions', 'platformTheming', 'platformMessageHub'])
    .value('shellState', {
        perspectiveInternal: {
            id: '',
            label: ''
        },
        perspectiveListeners: [],
        set perspective(newData) {
            this.perspectiveInternal = newData;
            for (let l = 0; l < this.perspectiveListeners.length; l++) {
                this.perspectiveListeners[l](newData);
            }
        },
        get perspective() {
            return this.perspectiveInternal;
        },
        registerStateListener: function (listener) {
            this.perspectiveListeners.push(listener);
        }
    })
    .config(function config($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);
    }).directive('shellHeader', ['$cookies', '$http', 'branding', 'theming', 'User', 'Extensions', 'messageHub', 'extensionPoints', 'shellState', function ($cookies, $http, branding, theming, User, Extensions, messageHub, extensionPoints, shellState) {
        return {
            restrict: 'E',
            replace: true,
            link: {
                pre: function (scope) {
                    scope.menuClick = function (item) {
                        if (item.action === 'openView') {
                            messageHub.openView(item.id, item.data);
                        } else if (item.action === 'openPerspective') {
                            messageHub.openPerspective(item.link);
                        } else if (item.action === 'openDialogWindow') {
                            messageHub.showDialogWindow(item.dialogId);
                        } else if (item.action === 'open') {
                            window.open(item.data, '_blank');
                        } else if (item.event) {
                            messageHub.postMessage(item.event, item.data, true);
                        }
                    };
                }, post: function (scope, element) {
                    scope.themes = [];
                    scope.perspectiveId = shellState.perspective.id;
                    shellState.registerStateListener(function (data) {
                        scope.perspectiveId = data.id;
                        scope.collapseMenu = false;
                    });
                    scope.branding = branding;
                    scope.currentTheme = theming.getCurrentTheme();
                    scope.user = User.get();
                    scope.menus = {};
                    scope.systemMenus = {
                        help: undefined,
                        window: undefined
                    };
                    scope.menu = [];
                    scope.collapseMenu = false;

                    Extensions.get('menu', extensionPoints.menus).then(function (menus) {
                        for (let i = 0; i < menus.length; i++) {
                            if (!menus[i].systemMenu) {
                                scope.menus[menus[i].perspectiveId] = {
                                    include: menus[i].include,
                                    items: menus[i].items
                                }
                            } else {
                                if (menus[i].id === 'help') {
                                    scope.systemMenus.help = menus[i].menu;
                                } else if (menus[i].id === 'window') {
                                    scope.systemMenus.window = menus[i].menu;
                                }
                            }
                        }
                    });

                    let thresholdWidth = 0;
                    const resizeObserver = new ResizeObserver((entries) => {
                        if (scope.collapseMenu && element[0].offsetWidth > thresholdWidth) {
                            return scope.$apply(() => scope.collapseMenu = false);
                        } else if (entries[0].contentRect.width === 0) {
                            thresholdWidth = element[0].offsetWidth;
                            scope.$apply(() => scope.collapseMenu = true);
                        }
                    });
                    resizeObserver.observe(element.find('#spacer')[0]);

                    messageHub.onDidReceiveMessage(
                        'ide.themesLoaded',
                        function () {
                            scope.themes = theming.getThemes();
                        },
                        true
                    );

                    scope.setTheme = function (themeId, name) {
                        scope.currentTheme.id = themeId;
                        scope.currentTheme.name = name;
                        theming.setTheme(themeId);
                    };

                    scope.isScrollable = function (items) {
                        if (items) {
                            for (let i = 0; i < items.length; i++)
                                if (items[i].items) return false;
                        }
                        return true;
                    };

                    scope.resetAll = function () {
                        messageHub.showDialogAsync(
                            `Reset ${scope.branding.brand}`,
                            ['This will clear all settings, open tabs and cache.', `${scope.branding.brand} will then reload.`, 'Do you wish to continue?'],
                            [{
                                id: 'btnConfirm',
                                type: 'emphasized',
                                label: 'Yes',
                            }, {
                                id: 'btnCancel',
                                type: 'transparent',
                                label: 'No',
                            }],
                        ).then(function (msg) {
                            if (msg.data === "btnConfirm") {
                                messageHub.showBusyDialog(
                                    'ideResetDialogBusy',
                                    'Resetting',
                                    'ide.dialog.reset.all.done'
                                );
                                localStorage.clear();
                                theming.reset();
                                $http.get('/services/js/resources-core/services/clear-cache.js').then(function () {
                                    for (let cookie in $cookies.getAll()) {
                                        if (cookie.startsWith('DIRIGIBLE')) {
                                            $cookies.remove(cookie, { path: '/' });
                                        }
                                    }
                                    location.reload();
                                }, function (error) {
                                    console.log(error);
                                    messageHub.hideBusyDialog('ideResetDialogBusy');
                                    messageHub.showAlertError('Failed to reset', 'There was an error during the reset process. Please refresh manually.');
                                });
                            }
                        });
                    };

                    scope.logout = function () {
                        location.replace('/logout');
                    };
                }
            },
            templateUrl: '/services/web/resources-core/ui/templates/shellHeader.html',
        };
    }]).directive('submenu', function () {
        return {
            restrict: "E",
            replace: false,
            scope: {
                sublist: '<',
                menuHandler: '&',
            },
            link: function (scope) {
                scope.menuHandler = scope.menuHandler();
                scope.isScrollable = function (index) {
                    for (let i = 0; i < scope.sublist[index].items.length; i++)
                        if (scope.sublist[index].items[i].items) return false;
                    return true;
                };
            },
            template: `<fd-menu-item ng-repeat-start="item in sublist track by $index" ng-if="!item.items" has-separator="::item.divider" title="{{ ::item.label }}" ng-click="::menuHandler(item)"></fd-menu-item>
            <fd-menu-sublist ng-if="item.items" has-separator="::item.divider" title="{{ ::item.label }}" can-scroll="::isScrollable($index)" ng-repeat-end><submenu sublist="::item.items" menu-handler="::menuHandler"></submenu></fd-menu-sublist>`,
        };
    }).directive('perspectiveContainer', function (Extensions, extensionPoints, shellState) {
        /**
         * condensed: Boolean - If the side navigation should show both icons and labels
         */
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                condensed: '<?',
            },
            link: {
                pre: function (scope) {
                    scope.perspectives = [];
                    Extensions.get('perspective', extensionPoints.perspectives).then(function (response) {
                        for (let i = 0; i < response.length; i++) {
                            if (response[i].label) {
                                scope.perspectives.push(response[i]);
                            }
                        }
                        if (scope.perspectives.length) {
                            scope.activeId = scope.perspectives[0].id;
                            shellState.perspective = {
                                id: scope.perspectives[0].id,
                                label: scope.perspectives[0].label
                            };
                        }
                    });
                    scope.getIcon = function (icon) {
                        if (icon) return icon;
                        return '/services/web/resources/images/unknown.svg';
                    };
                    scope.switchPerspective = function (id, label) {
                        scope.activeId = id;
                        shellState.perspective = {
                            id: id,
                            label: label
                        };
                    };
                },
            },
            template: `<div class="dg-main-container">
                <fd-vertical-nav class="dg-sidebar" condensed="condensed" can-scroll="true">
                    <fd-vertical-nav-main-section aria-label="main navigation">
                        <fd-list aria-label="Perspective list">
                            <fd-list-navigation-item ng-repeat="perspective in perspectives track by $index" ng-click="switchPerspective(perspective.id, perspective.label)" title="{{::perspective.label}}">
                                <fd-list-navigation-item-icon icon-size="lg" svg-path="{{getIcon(perspective.icon)}}"></fd-list-navigation-item-icon>
                                <span fd-list-navigation-item-text>{{::perspective.label}}</span>
                                <fd-list-navigation-item-indicator ng-if="perspective.id === activeId"></fd-list-navigation-item-indicator>
                            </fd-list-navigation-item>
                        </fd-list>
                    </fd-vertical-nav-main-section>
                </fd-vertical-nav>
                <iframe ng-repeat="perspective in perspectives track by $index" ng-show="perspective.id === activeId" title="{{::perspective.label}}" ng-src="{{::perspective.link}}" loading="lazy">
                Loading....
                </iframe>
            </div>`
        }
    }).directive('statusBar', ['messageHub', function (messageHub) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope) {
                scope.busy = '';
                scope.message = '';
                scope.caret = '';
                scope.error = '';
                messageHub.onDidReceiveMessage(
                    'ide.status.busy',
                    function (data) {
                        scope.$apply(function () {
                            scope.busy = data.message;
                        });
                    },
                    true
                );
                messageHub.onDidReceiveMessage(
                    'ide.status.message',
                    function (data) {
                        scope.$apply(function () {
                            scope.message = data.message;
                        });
                    },
                    true
                );
                messageHub.onDidReceiveMessage(
                    'ide.status.error',
                    function (data) {
                        scope.$apply(function () {
                            scope.error = data.message;
                        });
                    },
                    true
                );
                messageHub.onDidReceiveMessage(
                    'ide.status.caret',
                    function (data) {
                        scope.$apply(function () {
                            scope.caret = data.text;
                        });
                    },
                    true
                );
                scope.cleanStatusMessages = function () {
                    scope.message = null;
                };
                scope.cleanErrorMessages = function () {
                    scope.error = null;
                };
            },
            templateUrl: '/services/web/resources-core/ui/templates/ideStatusBar.html'
        }
    }]);