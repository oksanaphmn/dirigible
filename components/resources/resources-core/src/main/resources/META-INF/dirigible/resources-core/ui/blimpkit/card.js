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
blimpkit.directive('bkCard', function (classNames) {
    /**
     * cardType: String - This can be 'object' | 'standard' | 'list' | 'table' to indicate the card type
     * compact: Boolean - Whether to apply compact mode
     */
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            cardType: '@?',
            compact: '<?'
        },
        controller: ['$scope', function ($scope) {
            $scope.getClasses = () => classNames('fd-card', {
                'fd-card--object': $scope.cardType === 'object',
                'fd-card--table': $scope.cardType === 'table',
                'fd-card--compact': $scope.compact === true
            });
        }],
        template: '<div ng-class="getClasses()" role="region" ng-transclude></div>',
    }
}).directive('bkCardHeader', function (classNames) {
    /**
     * interactive: Boolean - Whether card header is interactive. Defaults to true 
     */
    return {
        restrict: 'EA',
        replace: true,
        transclude: {
            'title': 'bkCardTitle',
            'subtitle': '?bkCardSubtitle',
            'status': '?bkCardStatus',
            'avatar': '?bkAvatar'
        },
        scope: {
            interactive: '<?'
        },
        link: function (scope, _element, _attributes, _controller, $transclude) {
            if (scope.interactive === undefined)
                scope.interactive = true;

            scope.isSubtitleFilled = () => { return $transclude.isSlotFilled('subtitle') };

            scope.getClasses = () => classNames('fd-card__header', {
                'fd-card__header--non-interactive': !scope.interactive
            });
        },
        template: `<a ng-class="getClasses()">
            <ng-transclude></ng-transclude>
            <ng-transclude ng-transclude-slot="avatar"></ng-transclude>
            <div class="fd-card__header-text">
                <div class="fd-card__title-area">
                    <ng-transclude ng-transclude-slot="title"></ng-transclude>
                    <ng-transclude ng-transclude-slot="status"></ng-transclude>
                </div>
                <div ng-if="isSubtitleFilled()" class="fd-card__subtitle-area" ng-transclude="subtitle">
                </div>
            </div>
        </a>`,
    }
}).directive('bkCardTitle', () => ({
    restrict: 'EA',
    replace: false,
    transclude: true,
    template: '<div class="fd-card__title" ng-transclude></div>',
})).directive('bkCardSubtitle', () => ({
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: '<div class="fd-card__subtitle" ng-transclude></div>',
})).directive('bkCardStatus', function (classNames) {
    /**
     * status: String - One of 'negative', 'critical', 'positive' or 'informative'
     * isCounter: Boolean - When the card is if the 'counter' type
     */
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            status: '@',
            isCounter: '<?'
        },
        link: function (scope) {
            const statuses = ['negative', 'critical', 'positive', 'informative'];

            scope.getClasses = () => classNames('fd-object-status', {
                [`fd-object-status--${scope.status}`]: scope.status && statuses.includes(scope.status),
                'fd-card__counter': scope.isCounter === true
            });
        },
        template: '<span ng-class="getClasses()" ng-transclude></span>',
    }
}).directive('bkCardContent', () => ({
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: '<div class="fd-card__content" role="group" ng-transclude></div>',
}));