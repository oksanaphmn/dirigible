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
blimpkit.directive('bkStepInput', function (classNames) {
    /**
     * compact: Boolean - Input size.
     * inputId: String - The input id.
     * min: Number - Minimum input value.
     * max: Number - Maximum input value.
     * step: Number - Input step.
     * state: String - You have five options - 'error', 'success', 'warning' and 'information'.
     * isFocus: Boolean - The input will have a focus outline. This will not focus the input automatically.
     * isReadonly: Boolean - Sets the input to readonly mode.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        require: '?ngModel',
        scope: {
            compact: '<?',
            inputId: '@',
            min: '=?',
            max: '=?',
            step: '=?',
            placeholder: '@?',
            name: '@?',
            state: '@?',
            isFocus: '<?',
            isReadonly: '<?',
        },
        link: function (scope, element, attrs, ngModel) {
            const input = element[0].querySelector(`input`);
            scope.value;
            let valueWatch;
            if (ngModel) {
                valueWatch = scope.$watch('value', function (value) {
                    ngModel.$setViewValue(value);
                    ngModel.$validate();
                });
                ngModel.$render = function () {
                    scope.value = ngModel.$viewValue;
                }
            }
            scope.getInputClasses = function () {
                if (scope.compact === true) return 'fd-input--compact';
            };
            scope.getButtonClasses = function () {
                if (scope.compact === true) return 'fd-button--compact';
            };
            scope.getClasses = () => classNames({
                'fd-step-input--compact': scope.compact === true,
                'is-disabled': attrs.hasOwnProperty('disabled') && attrs.disabled === true,
                'is-readonly': scope.isReadonly === true,
                'is-focus': scope.isFocus === true,
                [`is-${scope.state}`]: scope.state,
            });
            scope.stepDown = function () {
                input.stepDown();
                scope.value = Number(input.value);
            };
            scope.stepUp = function () {
                input.stepUp();
                scope.value = Number(input.value);
            };
            function cleanUp() {
                if (ngModel) valueWatch();
            }
            scope.$on('$destroy', cleanUp);
        },
        template: `<div class="fd-step-input" ng-class="getClasses()"><button aria-label="Step down" class="fd-button fd-button--transparent fd-step-input__button" ng-class="getButtonClasses()" tabindex="-1" type="button" ng-click="stepDown()"><i class="sap-icon--less"></i></button>
<input ng-attr-id="{{inputId}}" class="fd-input fd-input--no-number-spinner fd-step-input__input" ng-class="getClasses(true)" type="number" ng-attr-name="{{name}}" placeholder="{{placeholder}}" ng-model="value" ng-attr-max="{{max}}" ng-attr-min="{{min}}" ng-attr-step="{{step}}" ng-readonly="isReadonly === true"/>
<button aria-label="Step up" class="fd-button fd-button--transparent fd-step-input__button" ng-class="getButtonClasses()" tabindex="-1" type="button" ng-click="stepUp()"><i class="sap-icon--add"></i></button></div>`,
    }
});