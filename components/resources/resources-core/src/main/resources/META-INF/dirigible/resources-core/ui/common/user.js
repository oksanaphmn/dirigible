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
angular.module('platformUser', []).factory('User', ['$http', function ($http) {
    return {
        get: function () {
            const user = { name: undefined };
            $http({
                url: '/services/js/resources-core/services/user-name.js',
                method: 'GET'
            }).then(function (data) {
                user.name = data.data;
            });
            return user;
        }
    };
}]);