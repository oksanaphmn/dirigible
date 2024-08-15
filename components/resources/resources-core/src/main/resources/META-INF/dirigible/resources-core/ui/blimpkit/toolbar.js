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
blimpkit.directive('bkToolbar', function (classNames) {
    /**
     * type: String - The type of the toolbar. One of 'transparent', 'auto', 'info' or 'solid' (default value)
     * compact: Boolean - Applies compact style to the toolbar and all elements inside it.
     * hasTitle: Boolean - Should be used whenever a title is required. This is incompatible iwht "compact" size.
     * noBottomBorder: Boolean - Removes the bottom border of the toolbar
     * active: Boolean - Enables active and hover states
     */
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            type: '@?',
            compact: '<?',
            hasTitle: '<?',
            noBottomBorder: '<?',
            active: '<?'
        },
        link: function (scope) {
            const types = ['transparent', 'auto', 'info', 'solid'];
            if (scope.hasTitle === true && scope.compact === true) console.error("bk-toolbar: There cannot be a title in compact mode!");
            scope.getClasses = () => classNames('fd-toolbar', {
                'fd-toolbar--title': scope.hasTitle === true,
                'fd-toolbar--clear': scope.noBottomBorder === true,
                'fd-toolbar--active': scope.active === true,
                'is-compact': scope.compact === true,
                [`fd-toolbar--${scope.type}`]: types.includes(scope.type),
            });
        },
        template: '<div ng-class="getClasses()" ng-transclude></div>'
    }
}).directive('bkToolbarTitle', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    template: '<h4 class="fd-title fd-title--h4 fd-toolbar__title" ng-transclude></h4>'
})).directive('bkToolbarSpacer', function (classNames) {
    /**
     * fixedWidth: Number|String - The fixed with of the spacer. Could be any valid css width value or number in pixels.  
     */
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            fixedWidth: '@'
        },
        link: function (scope) {
            scope.getClasses = () => classNames('fd-toolbar__spacer', {
                'fd-toolbar__spacer--fixed': scope.fixedWidth !== undefined,
            });

            scope.getStyles = function () {
                if (scope.fixedWidth !== undefined) {
                    let width = scope.fixedWidth;
                    return { width: Number.isFinite(width) ? `${width}px` : width };
                }
            };
        },
        template: '<div ng-class="getClasses()" ng-style="getStyles()" ng-transclude></div>'
    }
}).directive('bkToolbarSeparator', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<span class="fd-toolbar__separator" ng-transclude></span>'
})).directive('bkToolbarOverflow', () => ({
    restrict: 'EA',
    transclude: true,
    template: `<bk-popover>
        <bk-popover-control>
            <bk-button glyph="sap-icon--overflow" type="transparent" aria-label="Toolbar overflow"></bk-button>
        </bk-popover-control>
        <bk-popover-body align="bottom-right">
            <div class="fd-toolbar__overflow" ng-transclude></div>
        </bk-popover-body>
    </bk-popover>`
})).directive('bkToolbarOverflowLabel', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<label class="fd-label fd-toolbar__overflow-label" ng-transclude></label>'
}));