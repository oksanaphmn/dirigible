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
blimpkit.directive('bkVerticalNav', function (classNames) {
    /**
     * condensed: Boolean - Condensed navigation mode.
     * canScroll: Boolean - Enable/disable scroll navigation support. Default is false.
     */
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            condensed: '<?',
            canScroll: '<?',
        },
        controller: ['$scope', function ($scope) {
            this.isCondensed = function () {
                return $scope.condensed;
            };
            $scope.getClasses = () => classNames('fd-vertical-nav', {
                'fd-vertical-nav--condensed': $scope.condensed === true,
                'fd-vertical-nav--overflow': $scope.canScroll === true,
                'fd-scrollbar': $scope.canScroll === true,
            });
        }],
        template: '<div ng-class="getClasses()" ng-transclude></div>'
    }
}).directive('bkVerticalNavMainSection', () => ({
    restrict: 'E',
    replace: true,
    transclude: true,
    link: function (_scope, _element, attrs) {
        if (!attrs.hasOwnProperty('ariaLabel'))
            console.error('bk-vertical-nav-main-section error: You must set the "aria-label" attribute');
    },
    template: '<nav class="fd-vertical-nav__main-navigation" ng-transclude></nav>'
})).directive('bkVerticalNavUtilitySection', () => ({
    restrict: 'E',
    replace: true,
    transclude: true,
    link: function (_scope, _element, attrs) {
        if (!attrs.hasOwnProperty('ariaLabel'))
            console.error('bk-vertical-nav-utility-section error: You must set the "aria-label" attribute');
    },
    template: '<nav class="fd-vertical-nav__utility-section" ng-transclude></nav>'
})).directive('bkListNavigationItem', function (classNames) {
    /**
     * indicated: Boolean - Navigation item is indicated.
     * expandable: Boolean - The item can expand.
     * isExpanded: Boolean - If the item is expanded or not.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        require: '^^bkVerticalNav',
        scope: {
            indicated: '<?',
            expandable: '<?',
            isExpanded: '<?',
        },
        link: function (scope, _element, _attrs, vnavCtrl) {
            scope.getClasses = () => classNames('fd-list__navigation-item', {
                'fd-list__navigation-item--condensed': vnavCtrl.isCondensed() === true,
                'fd-list__navigation-item--indicated': scope.indicated === true,
                'fd-list__navigation-item--expandable': scope.expandable === true,
                'is-expanded': scope.isExpanded === true,
            });
        },
        template: '<li ng-class="getClasses()" tabindex="0" ng-transclude></li>'
    }
}).directive('bkListNavigationItemPopover', function (classNames) {
    /**
     * isExpanded: Boolean - If the popover is expanded or not.
     */
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            level: '<',
            isExpanded: '<',
        },
        link: {
            post: function (scope) {
                scope.getClasses = () => classNames('fd-popover__body', 'fd-popover__body--no-arrow', {
                    'fd-list__navigation-item-popover--first-level': scope.level === 1,
                    'fd-list__navigation-item-popover--second-level': scope.level === 2,
                });
            },
        },
        template: '<div ng-class="getClasses()" ng-show="isExpanded" ng-transclude></div>'
    }
}).directive('bkListNavigationItemText', () => ({
    restrict: 'A',
    link: function (_scope, element) {
        element.addClass('fd-list__navigation-item-text');
    },
})).directive('bkListNavigationItemText', () => ({
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<span class="fd-list__navigation-item-text" ng-transclude></span>'
})).directive('bkListNavigationItemIndicator', () => ({
    restrict: 'E',
    replace: true,
    template: '<span class="fd-list__navigation-item-indicator"></span>'
})).directive('bkListNavigationItemArrow', function (classNames) {
    /**
     * isExpanded: Boolean - If the item is expanded or not.
     */
    return {
        restrict: 'E',
        replace: true,
        scope: {
            isExpanded: '<?',
        },
        link: {
            pre: function (_scope, _element, attrs) {
                if (!attrs.hasOwnProperty('ariaLabel'))
                    console.error('bk-list-navigation-item-arrow error: You must set the "aria-label" attribute');
            },
            post: function (scope) {
                scope.getClasses = () => classNames('fd-list__navigation-item-arrow', {
                    'is-expanded': scope.isExpanded === true,
                    'sap-icon--navigation-down-arrow': scope.isExpanded === true,
                    'sap-icon--navigation-right-arrow': scope.isExpanded !== true,
                });
            },
        },
        template: '<button ng-class="getClasses()"></button>'
    }
}).directive('bkListNavigationItemIcon', function (classNames) {
    /**
     * glyph: String - Icon class. For example 'sap-icon--home'.
     * svgPath: String - The src path to your svg image.
     * iconSize: String - The size of the item icon. Possible options are include 'lg' and none.
     */
    return {
        restrict: 'E',
        replace: true,
        scope: {
            glyph: '@?',
            svgPath: '@?',
            iconSize: '@?',
        },
        link: function (scope) {
            if (!scope.glyph && !scope.svgPath) {
                console.error('bk-list-navigation-item-icon error: You must provide a glpyh or an svg icon');
            }
            scope.getClasses = () => classNames('fd-list__navigation-item-icon', {
                [scope.glyph]: scope.glyph && !scope.svgPath,
                'bk-icon--svg-lg': scope.iconSize === 'lg',
                'bk-icon--svg sap-icon': scope.svgPath,
            });
        },
        template: '<i role="presentation" ng-class="getClasses()"><ng-include ng-if="svgPath" src="svgPath"></ng-include></i>'
    }
}).directive('bkListNavigationGroupHeader', () => ({
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<li role="listitem" class="fd-list__group-header fd-vertical-nav__group-header"><span class="fd-list__title" ng-transclude></span></li>'
}));