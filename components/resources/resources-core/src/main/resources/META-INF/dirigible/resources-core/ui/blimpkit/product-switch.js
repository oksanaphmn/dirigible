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
blimpkit.directive('bkProductSwitch', function (classNames, $injector) {
    /**
     * btnAriaLabel: String - Text for the button aria-label
     * align: String - Relative position of the popover. Same as on fd-popover-body. Default is 'bottom-right'.
     * size: String - Size of the product switch. Possible options are 'large' (default), 'medium' and 'small'.
     * type: String - State of the button. Same as on 'fd-button'. Default is 'transparent'.
     * noArrow: Boolean - If the popup should have an arrow. Default is false.
     */
    if (!$injector.has('bkPopoverDirective') || !$injector.has('bkButtonDirective')) {
        console.error('bk-product-switch requires the bk-button and bk-popover widgets to be loaded.');
        return {};
    }
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            btnAriaLabel: '@?',
            align: '@?',
            size: '@?',
            type: '@?',
            noArrow: '<?',
        },
        link: function (scope) {
            if (!scope.btnAriaLabel)
                console.error('bk-product-switch error: Must have the "btn-aria-label" attribute');
            scope.getClasses = () => classNames('fd-product-switch__body', {
                'fd-product-switch__body--col-3': scope.size === 'medium',
                'fd-product-switch__body--mobile': scope.size === 'small',
            });
        },
        template: `<div class="fd-product-switch"><bk-popover>
            <bk-popover-control>
                <bk-button type="{{ type || 'transparent' }}" glyph="sap-icon--grid" aria-label="{{btnAriaLabel}}">
                </bk-button>
            </bk-popover-control>
            <bk-popover-body align="{{ align || 'bottom-right' }}" no-arrow="noArrow">
                <div ng-class="getClasses()">
                    <ul class="fd-product-switch__list" ng-transclude></ul>
                </div>
            </bk-popover-body>
        </bk-popover></div`
    }
}).directive('bkProductSwitchItem', function (classNames) {
    /**
     * selected: Boolean - Selects the item.
     * title: String - Product title.
     * subtitle: String - Product subtitle.
     * glyph: String - Icon class.
     * iconSrc: String - URL to the icon.
     */
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            selected: '<?',
            title: '@',
            subtitle: '@?',
            glyph: '@?',
            iconSrc: '@?',
        },
        link: function (scope) {
            scope.getClasses = () => classNames('fd-product-switch__item', {
                'selected': scope.selected,
            });
        },
        template: `<li ng-class="getClasses()" tabindex="0">
            <i ng-if="glyph" class="fd-product-switch__icon" ng-class="glyph" role="presentation"></i>
            <div ng-if="iconSrc" class="fd-product-switch__icon sap-icon bk-center"><img ng-src="{{iconSrc}}" alt="{{title}}" width="24" height="24"></div>
            <div class="fd-product-switch__text">
                <div class="fd-product-switch__title">{{title}}</div>
                <div ng-if="subtitle" class="fd-product-switch__subtitle">{{subtitle}}</div>
            </div>
        </li>`
    }
});