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
blimpkit.directive('bkCheckbox', function (classNames) {
    /**
     * compact: Boolean - Checkbox size.
     * state: String - You have five options - 'error', 'success', 'warning' and 'information'.
     * indeterminate: Boolean - Indeterminate/tri-state.
     * displayMode: Boolean - In Display Mode, the checkbox is replaced by two icons to represent the checked and unchecked states.
     */
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            compact: '<?',
            state: '@?',
            indeterminate: '<?',
            displayMode: '<?',
        },
        link: function (scope, elem, attrs) {
            scope.getClasses = () => {
                if (scope.indeterminate === true) elem[0].indeterminate = true;
                else elem[0].indeterminate = false;
                return classNames({
                    [`is-${scope.state}`]: scope.state,
                    'fd-checkbox--compact': scope.compact === true,
                    'is-disabled': attrs.disabled,
                    'is-display': attrs.displayMode,
                });
            };
        },
        template: '<input type="checkbox" class="fd-checkbox" ng-class="getClasses()">',
    }
}).directive('bkCheckboxLabel', function (classNames) {
    /**
     * compact: Boolean - Checkbox label size.
     * isHover: Boolean - If the checkbox is in hover state.
     * empty: Boolean - If the label has text.
     * wrap: Boolean - By default, the label text will be truncated. Set this to true if you want it to wrap instead.
     * required: Boolean - If the checkbox is required. You can alse use ng-required.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            compact: '<?',
            isHover: '<?',
            empty: '<?',
            wrap: '<?',
        },
        link: function (scope, _elem, attrs) {
            scope.getClasses = () => classNames({
                'fd-checkbox__label--compact': scope.compact === true,
                'fd-checkbox__label--required': attrs.required,
                'is-hover': scope.isHover === true,
                'fd-checkbox__label--wrap': scope.wrap === true,
            });
        },
        template: `<label class="fd-checkbox__label" ng-class="getClasses()">
            <span class="fd-checkbox__checkmark" aria-hidden="true"></span>
            <div ng-if="empty !== true" class="fd-checkbox__label-container"><span class="fd-checkbox__text" ng-transclude></span></div>
        </label>`,
    }
});