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
angular.module('platformTheming', ['platformMessageHub'])
    .provider('theming', function ThemingProvider() {
        this.$get = ['$http', 'messageHub', function editorsFactory($http, messageHub) {
            let theme = JSON.parse(localStorage.getItem('DIRIGIBLE.theme') || '{}');
            let themes = [];

            function processThemeResponse(response) {
                themes = response.data;
                if (!theme.version) {
                    setTheme('quartz-light');
                } else {
                    for (let i = 0; i < themes.length; i++) {
                        if (themes[i].id === theme.id) {
                            if (themes[i].version !== theme.version) {
                                setThemeObject(themes[i]);
                                break;
                            }
                        }
                    }
                }
                messageHub.triggerEvent('ide.themesLoaded', true);
            }

            $http.get('/public/js/theme/resources.js/themes')
                .then(function (response) {
                    processThemeResponse(response);
                }, function (response) {
                    console.error('platform-theming: could not get themes', response);
                    if (response.status === 404) {
                        $http.get('/services/js/theme/resources.js/themes')
                            .then(function (response) {
                                processThemeResponse(response);
                            }, function (response) {
                                console.error('platform-theming: could not get themes', response);
                            });
                    }
                });

            function setTheme(themeId, sendEvent = true) {
                for (let i = 0; i < themes.length; i++) {
                    if (themes[i].id === themeId) {
                        setThemeObject(themes[i], sendEvent);
                    }
                }
            }

            function setThemeObject(themeObj, sendEvent = true) {
                localStorage.setItem(
                    'DIRIGIBLE.theme',
                    JSON.stringify(themeObj),
                )
                theme = themeObj;
                if (sendEvent) messageHub.triggerEvent('ide.themeChange', true);
            }

            return {
                setTheme: setTheme,
                getThemes: function () {
                    return themes.map(
                        function (item) {
                            return {
                                'id': item['id'],
                                'name': item['name']
                            };
                        }
                    );
                },
                getCurrentTheme: function () {
                    return {
                        id: theme['id'] || 'quartz-light',
                        name: theme['name'] || 'Quartz Light',
                    };
                },
                reset: function () {
                    // setting sendEvent to false because of the reload caused by Golden Layout
                    setTheme('quartz-light', false);
                }
            }
        }];
    })
    .factory('Theme', ['theming', function (_theming) { // Must be injected to set defaults
        let theme = JSON.parse(localStorage.getItem('DIRIGIBLE.theme') || '{}');
        return {
            reload: function () {
                theme = JSON.parse(localStorage.getItem('DIRIGIBLE.theme') || '{}');
            },
            getLinks: function () {
                return theme.links || [];
            },
            getType: function () {
                return theme.type || 'light';
            }
        }
    }]).directive('theme', ['Theme', 'messageHub', '$document', function (Theme, messageHub, $document) {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            link: function (scope) {
                scope.links = Theme.getLinks();
                if (Theme.getType() === 'dark') {
                    $document[0].body.classList.add('bk-dark');
                } else $document[0].body.classList.add('bk-light');
                messageHub.onDidReceiveMessage(
                    'ide.themeChange',
                    function () {
                        scope.$apply(function () {
                            Theme.reload();
                            scope.links = Theme.getLinks();
                            if (Theme.getType() === 'dark') {
                                $document[0].body.classList.add('bk-dark');
                                $document[0].body.classList.remove('bk-light');
                            } else {
                                $document[0].body.classList.add('bk-light');
                                $document[0].body.classList.remove('bk-dark');
                            }
                        });
                    },
                    true
                );
            },
            template: '<link type="text/css" rel="stylesheet" ng-repeat="link in links" ng-href="{{ link }}">'
        };
    }]);