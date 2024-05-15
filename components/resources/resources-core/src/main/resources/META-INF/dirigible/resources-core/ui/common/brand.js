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
angular.module('platformBrand', [])
    .constant('branding', brandingInfo)
    .directive('brandTitle', ['branding', function (branding) {
        return {
            restrict: 'A',
            transclude: false,
            replace: true,
            link: function (scope) {
                scope.name = branding.name;
                scope.perspective = 'Shell';
            },
            template: '<title>{{::perspective.name || "Loading..."}} | {{::name}}</title>'
        };
    }]).directive('brandIcon', ['branding', function (branding) {
        return {
            restrict: 'A',
            transclude: false,
            replace: true,
            link: function (scope) {
                scope.icon = branding.icons.faviconIco;
            },
            template: `<link rel="icon" type="image/x-icon" ng-href="{{::icon}}">`
        };
    }]);