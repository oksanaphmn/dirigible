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
blimpkit.directive('bkToken', function (classNames) {
    /**
     * label: String - The text of the token.
     * compact: Boolean - Whether the token is compact.
     * isSelected: Boolean - Enable selected mode.
     * isHover: Boolean - Enable hover mode.
     * isFocus: Boolean - Enable focus mode.
     * isReadonly: Boolean - Whether the token is read only.
     * closeAriaLabel: String - Aria label for the close button.
     * closeClicked: Function - A callback called when the close button has been clicked.
     */
    return {
        restrict: 'EA',
        replace: true,
        require: '?^^bkTokenizer',
        scope: {
            label: '@',
            compact: '<?',
            isSelected: '<?',
            isHover: '<?',
            isFocus: '<?',
            isReadonly: '<?',
            closeAriaLabel: '@?',
            closeClicked: '&'
        },
        link: function (scope, element, attrs, tokenizerCtrl) {
            if (tokenizerCtrl) {
                tokenizerCtrl.addToken(element);

                scope.$on('$destroy', function () {
                    tokenizerCtrl.removeToken(element);
                });
            }

            scope.getClasses = () => classNames('fd-token', {
                'fd-token--compact': scope.compact === true,
                'fd-token--readonly': scope.isReadonly === true,
                'fd-token--selected': scope.isSelected === true,
                'is-focus': scope.isFocus === true,
                'is-hover': scope.isHover === true,
                'fd-token--disabled': attrs.hasOwnProperty('disabled'),
            });

            scope.isVisible = () => tokenizerCtrl ? tokenizerCtrl.isTokenVisible(element) : true;
        },
        template: `<span ng-show="isVisible()" ng-class="getClasses()" role="button" tabindex="0">
            <span class="fd-token__text">{{label}}</span>
            <button ng-if="!isReadonly" class="fd-token__close" aria-label="{{closeAriaLabel}}" ng-click="closeClicked()"></button>
        </span>`
    }
}).directive('bkTokenIndicator', () => ({
    /**
     * suffix: String - The text after the number of hidden tokens.
     */
    restrict: 'EA',
    replace: true,
    require: '^^bkTokenizer',
    scope: { suffix: '@?' },
    link: function (scope, _element, _attr, tokenizerCtrl) {
        scope.getNumberOfHiddenTokens = () => {
            scope.numberOfHiddenTokens = tokenizerCtrl.getNumberOfHiddenTokens();
            return scope.numberOfHiddenTokens;
        };
    },
    template: '<span ng-show="getNumberOfHiddenTokens() > 0" class="fd-tokenizer__indicator">{{ numberOfHiddenTokens }} {{ suffix || "more" }}</span>'
}));