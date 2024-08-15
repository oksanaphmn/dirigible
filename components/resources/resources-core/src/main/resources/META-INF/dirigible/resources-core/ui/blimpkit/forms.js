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
blimpkit.directive('bkFieldset', function () {
    /**
     * label: String - Title for the legend.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            label: '@?',
        },
        template: `<fieldset class="fd-fieldset">
            <legend ng-if="label" class="fd-fieldset__legend">{{ label }}</legend>
            <ng-transclude></ng-transclude>
        </fieldset>`,
    }
}).directive('bkFormGroup', function (uuid) {
    /**
     * inline: Boolean - Form items are displayed horizontally.
     * label: String - Text for the group header.
     * compact: Boolean - Header size.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            inline: '<?',
            label: '@',
            compact: '<?',
        },
        link: {
            pre: function (scope) {
                if (scope.label) scope.headerId = `fgh${uuid.generate()}`;
            }
        },
        template: `<div class="fd-form-group" ng-class="{'true': 'fd-form-group--inline'}[inline]" role="group" ng-attr-aria-labelledby="{{headerId}}">
            <bk-form-group-header ng-if="label" header-id="{{ headerId }}" compact="compact">{{ label }}</bk-form-group-header>
            <ng-transclude></ng-transclude>
        </div>`,
    }
}).directive('bkFormGroupHeader', function () {
    /**
     * compact: Boolean - Header size.
     * headerId: String - Id for the header element. Used mostly because of 'aria-labelledby'.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            compact: '<?',
            headerId: '@'
        },
        template: `<div class="fd-form-group__header" ng-class="{'true': 'fd-form-group__header--compact'}[compact]"><h1 id="{{ headerId }}" class="fd-form-group__header-text" ng-transclude></h1></div>`,
    }
}).directive('bkFormItem', function (classNames) {
    /**
     * horizontal: Boolean - If true, items will be displayed horizontally.
     * inList: Boolean - Set to true if the form item is in an fd-list-item element.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            horizontal: '<?',
            inList: '<?',
        },
        link: function (scope) {
            scope.getClasses = () => classNames({
                'fd-form-item--horizontal': scope.horizontal === true,
                'bk-form-item--horizontal': scope.horizontal === true, // see widgets.css
                'fd-list__form-item': scope.inList === true,
            });
        },
        template: '<div class="fd-form-item" ng-class="getClasses()" ng-transclude></div>',
    }
}).directive('bkFormLabel', function (classNames) {
    /**
     * colon: Boolean - Puts a colon at the end of the label.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            colon: '<?',
        },
        link: {
            pre: function (scope, _elem, attrs) {
                scope.getClasses = () => classNames({
                    'fd-form-label--colon': scope.colon === true,
                    'fd-form-label--required': attrs.hasOwnProperty('required'),
                });
            },
        },
        template: '<label class="fd-form-label" ng-class="getClasses()" ng-transclude></label>',
    }
}).directive('bkFormHeader', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    template: '<div class="fd-form-header"><span class="fd-form-header__text" ng-transclude></span></div>',
})).directive('bkFormInputMessage', function (uuid, classNames) {
    /**
     * type: String - The type of message. Possible values are 'error', 'information', 'success' and 'warning'.
     * inactive: Boolean - If the message popover should not be shown.
     * message: String - The message text that will be shown.
     * messageFixed: Boolean - Message css position will be fixed, allowing for use in dialogs.
     */
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@',
            inactive: '<?',
            message: '<?',
            messageFixed: '<?',
        },
        replace: true,
        controller: ['$scope', '$element', function ($scope, $element) {
            $scope.popoverId = `fim${uuid.generate()}`;
            $scope.getClasses = () => {
                if ($scope.inactive === true) {
                    if (!$scope.popoverControl) {
                        $scope.popoverControl = $element[0].querySelector(`[aria-controls="${$scope.popoverId}"]`);
                        $scope.popoverBody = $element[0].querySelector(`#${$scope.popoverId}`);
                    }
                    $scope.popoverControl.setAttribute('aria-expanded', 'false');
                    $scope.popoverBody.setAttribute('aria-hidden', 'true');
                }
                return classNames({
                    [`fd-form-message--${$scope.type}`]: $scope.type,
                })
            };
            $scope.getStyle = function () {
                if ($scope.messageFixed === true) {
                    let pos = $element[0].getBoundingClientRect();
                    return {
                        transition: 'none',
                        transform: 'none',
                        position: 'fixed',
                        top: `${pos.bottom}px`,
                        left: `${pos.left}px`,
                    };
                } else return {};
            };
            this.showMessage = function (show) {
                if ($scope.inactive !== true) {
                    if (!$scope.popoverControl) {
                        $scope.popoverControl = $element[0].querySelector(`[aria-controls="${$scope.popoverId}"]`);
                        $scope.popoverBody = $element[0].querySelector(`#${$scope.popoverId}`);
                    }
                    if (show) {
                        $scope.popoverControl.setAttribute('aria-expanded', 'true');
                        $scope.popoverBody.setAttribute('aria-hidden', 'false');
                    } else {
                        $scope.popoverControl.setAttribute('aria-expanded', 'false');
                        $scope.popoverBody.setAttribute('aria-hidden', 'true');
                    }
                }
            };
        }],
        template: `<div class="fd-popover fd-form-input-message-group" tabindex="-1">
            <div class="fd-popover__control" aria-controls="{{ popoverId }}" aria-expanded="false" aria-haspopup="true" tabindex="-1" ng-transclude></div>
            <div id="{{ popoverId }}" class="fd-popover__body fd-popover__body--no-arrow fd-popover__body--input-message-group" aria-hidden="true" ng-style="getStyle()">
                <div class="fd-form-message" ng-class="getClasses()">{{message}}</div>
            </div>
        </div>`,
    }
});