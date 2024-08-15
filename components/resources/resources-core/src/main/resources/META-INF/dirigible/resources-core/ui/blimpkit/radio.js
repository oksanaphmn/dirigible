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
blimpkit.directive('bkRadio', function (classNames) {
    /**
     * compact: Boolean - Radio size.
     * state: String - You have five options - 'error', 'success', 'warning' and 'information'.
     */
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            compact: '<?',
            state: '@?',
        },
        link: function (scope, _elem, attrs) {
            scope.getClasses = () => classNames({
                'fd-radio--compact': scope.compact === true,
                'is-disabled': attrs.hasOwnProperty('disabled') && attrs.disabled === true,
                'is-readonly': attrs.hasOwnProperty('readonly') && attrs.readonly === true,
                [`is-${scope.state}`]: scope.state,
            });
        },
        template: '<input type="radio" class="fd-radio" ng-class="getClasses()">',
    }
}).directive('bkRadioLabel', function (classNames) {
    /**
     * wrap: Boolean - Text should wrap instead of truncate.
     * topAlign: Boolean - Radio button will be aligned at the top left corner when the label spans multiple lines.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            wrap: '<?',
            topAlign: '<?',
        },
        link: function (scope) {
            scope.getClasses = () => classNames({
                'fd-radio__label--wrap': scope.wrap === true,
                'fd-radio__label--wrap-top-aligned': scope.topAlign === true,
            });
        },
        template: '<label class="fd-radio__label" ng-class="getClasses()"><span class="fd-radio__text" ng-transclude></span></label>',
    }
});