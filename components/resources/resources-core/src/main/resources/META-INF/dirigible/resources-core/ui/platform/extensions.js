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
angular.module('platformExtensions', ['ngResource'])
    /*
     * The 'extensionPoints' constant can be used to replace the default extension points from your controller.
     * Here is an example:
     * .constant('extensionPoints', {
     *     perspectives: ["example-perspectives"],
     *     views: ["example-views"],
     *     subviews: ["example-subviews"],
     *     editors: ["example-editors"],
     *     menus: ["example-menus"],
     *     dialogWindows: ["example-dialog-windows"],
     * })
     */
    .constant('extensionPoints', {})
    .factory('Extensions', ['$resource', function ($resource) {
        return {
            get: function (type, extensionPoints = []) {
                let url;
                if (type === 'dialogWindow') {
                    url = '/services/js/resources-core/extension-services/dialog-windows.js';
                } else if (type === 'menu') {
                    url = '/services/js/resources-core/extension-services/menus.js';
                } else if (type === 'perspective') {
                    url = '/services/js/resources-core/extension-services/perspectives.js';
                } else if (type === 'view') {
                    url = '/services/js/resources-core/extension-services/views.js';
                } else if (type === 'subview') {
                    url = '/services/js/resources-core/extension-services/views.js';
                    if (!extensionPoints || extensionPoints.length === 0) extensionPoints = ['platform-subview'];
                } else if (type === 'editor') {
                    url = '/services/js/resources-core/extension-services/editors.js';
                } else {
                    throw new Error('Parameter "type" must be `dialogWindow`, `menu`, `perspective`, `view`, `subview` or `editor`');
                }
                return $resource(url).query({ extensionPoints: extensionPoints.join(',') }).$promise;
            }
        };
    }]);