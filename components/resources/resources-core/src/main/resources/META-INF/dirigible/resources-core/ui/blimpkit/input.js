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
blimpkit.directive('bkInput', function (classNames) {
    /**
     * compact: Boolean - Input size.
     * isHover: Boolean - If the checkbox is in hover state.
     * state: String - You have five options - 'error', 'success', 'warning' and 'information'.
     */
    return {
        restrict: 'E',
        transclude: false,
        require: ['?^^bkInputGroup', '?^^bkFormInputMessage', '?^^bkTokenizer'],
        replace: true,
        scope: {
            compact: '<?',
            isHover: '<?',
            state: '@?',
        },
        link: {
            pre: function (scope, element, attrs, ctrl) {
                if (!attrs.hasOwnProperty('type'))
                    console.error('bk-input error: Inputs must have the "type" HTML attribute');
                else {
                    let forbiddenTypes = ['checkbox', 'radio', 'file', 'image', 'range']; // Should add number to this list.
                    if (forbiddenTypes.includes(attrs.type))
                        console.error('bk-input error: Invalid input type. Possible options are "color", "date", "datetime-local", "email", "hidden", "month", "password", "search", "tel", "text", "time", "url" and "week".');
                }
                function focusoutEvent() {
                    ctrl[1].showMessage(false);
                }
                function focusinEvent() {
                    ctrl[1].showMessage(true);
                }
                if (ctrl[1]) {
                    element.on('focusout', focusoutEvent);
                    element.on('focusin', focusinEvent);
                }
                scope.getClasses = () => {
                    if (ctrl[0]) {
                        if (attrs.hasOwnProperty('disabled') && attrs.disabled === true) ctrl[0].setDisabled(true);
                        else ctrl[0].setDisabled(false);
                    }
                    return classNames({
                        'fd-input--compact': scope.compact === true,
                        'fd-input-group__input': ctrl[0],
                        'fd-tokenizer__input': ctrl[2],
                        'is-hover': scope.isHover === true,
                        [`is-${scope.state}`]: scope.state,
                    })
                };
                function cleanUp() {
                    element.off('focusout', focusoutEvent);
                    element.off('focusin', focusinEvent);
                }
                scope.$on('$destroy', cleanUp);
            },
        },
        template: '<input class="fd-input" ng-class="getClasses()" />',
    }
}).directive('bkInputGroup', function (classNames) {
    /**
     * compact: Boolean - Input size.
     * state: String - You have five options - 'error', 'success', 'warning' and 'information'.
     * focus: Boolean - If the input group is in a focused state.
     * isDisabled: Boolean - If the input group is disabled.
     * isReadonly: Boolean - If the input group is readonly.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            compact: '<?',
            focus: '<?',
            isDisabled: '<?',
            state: '@?',
            isReadonly: '<?',
        },
        controller: ['$scope', '$attrs', function ($scope, $attrs) {
            $scope.disabled = false;
            $scope.getClasses = () => classNames({
                'fd-input--compact': $scope.compact === true,
                'is-hover': $scope.isHover === true,
                'is-focus': $scope.focus === true,
                'is-readonly': $scope.isReadonly === true,
                'is-disabled': $scope.isDisabled || ($attrs.hasOwnProperty('disabled') && $attrs.disabled === true),
                [`is-${$scope.state}`]: $scope.state,
            });

            this.setDisabled = function (disabled) {
                $scope.disabled = disabled;
            };
        }],
        template: '<div class="fd-input-group" ng-class="getClasses()" tabindex="-1" ng-transclude></div>',
    }
}).directive('bkInputGroupAddon', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    controller: ['$scope', function ($scope) {
        $scope.hasButton = false;
        $scope.getClasses = () => $scope.hasButton === true ? 'fd-input-group__addon--button' : undefined;
        this.setButtonAddon = function (hasButton) {
            $scope.hasButton = hasButton;
        };
    }],
    template: '<span class="fd-input-group__addon" ng-class="getClasses()" ng-transclude></span>',
}));