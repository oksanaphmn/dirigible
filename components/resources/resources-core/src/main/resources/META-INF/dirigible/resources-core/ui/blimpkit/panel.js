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
blimpkit.directive('bkPanel', function () {
    /**
     * expanded: Boolean - Whether the panel is expanded or not
     * fixed: Boolean - Whether the panel is expandable or not. Defaults to false.
     * compact: Boolean - Panel size
     * expandedChange: Function - A callback called when the Expand button is clicked
     */
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            expanded: '<',
            fixed: '<?',
            compact: '<?',
            expandedChange: '&?'
        },
        controller: ['$scope', 'classNames', function ($scope, classNames) {
            $scope.expanded = !!$scope.expanded;

            this.isFixed = () => $scope.fixed;
            this.isExpanded = () => $scope.expanded;
            this.isCompact = () => $scope.compact;
            this.getContentId = () => $scope.contentId;
            this.getTitleId = () => $scope.titleId;

            this.setContentId = (id) => {
                $scope.contentId = id;
            }

            this.setTitleId = (id) => {
                $scope.titleId = id;
            }

            this.toggleExpanded = function () {
                $scope.expanded = !$scope.expanded;

                if ($scope.expandedChange) {
                    $scope.expandedChange({ expanded: $scope.expanded });
                }
            }

            $scope.getClasses = () => classNames('fd-panel', {
                'fd-panel--compact': $scope.compact === true,
                'fd-panel--fixed': $scope.fixed === true,
            });
        }],
        template: '<div ng-class="getClasses()" ng-transclude></div>'
    }
}).directive('bkPanelHeader', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<div class="fd-panel__header" ng-transclude></div>'
})).directive('bkPanelExpand', function ($injector) {
    if (!$injector.has('bkButtonDirective')) {
        console.error('bk-panel-expand requires the bk-button widget to be loaded.');
        return {};
    }
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        require: '^^bkPanel',
        link: function (scope, _element, _attrs, panelCtrl) {
            scope.isFixed = () => panelCtrl.isFixed();
            scope.isCompact = () => panelCtrl.isCompact();
            scope.isExpanded = () => panelCtrl.isExpanded();
            scope.getContentId = () => panelCtrl.getContentId();
            scope.getTitleId = () => panelCtrl.getTitleId();
            scope.toggleExpanded = function () {
                panelCtrl.toggleExpanded();
            };
            scope.getExpandButtonIcon = function () {
                return panelCtrl.isExpanded() ? 'sap-icon--slim-arrow-down' : 'sap-icon--slim-arrow-right';
            };
        },
        template: `<div ng-show="!isFixed()" class="fd-panel__expand">
        <bk-button ng-click="toggleExpanded()" glyph="{{ getExpandButtonIcon() }}" type="transparent" compact="isCompact() || false" class="fd-panel__button"
            aria-haspopup="true" aria-expanded="{{ isExpanded() }}" aria-controls="{{ getContentId() }}" aria-labelledby="{{ getTitleId() }}"
            aria-label="expand/collapse panel"></bk-button>
        </div>`
    }
}).directive('bkPanelTitle', (uuid) => ({
    restrict: 'A',
    require: '^^bkPanel',
    link: function (_scope, element, attrs, panelCtrl) {
        element.addClass('fd-panel__title');

        let id = attrs.id;
        if (!id) {
            id = `pt-${uuid.generate()}`;
            element[0].setAttribute('id', id);
        }

        panelCtrl.setTitleId(id);
    }
})).directive('bkPanelContent', (uuid) => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    require: '^bkPanel',
    link: function (scope, element, attrs, panelCtrl) {
        scope.isHidden = function () {
            return !panelCtrl.isFixed() && !panelCtrl.isExpanded();
        };

        let id = attrs.id;
        if (!id) {
            id = `ph-${uuid.generate()}`;
            element[0].setAttribute('id', id);
        }

        panelCtrl.setContentId(id);
    },
    template: '<div role="region" class="fd-panel__content" aria-hidden="{{ isHidden() }}" ng-transclude></div>'
}));