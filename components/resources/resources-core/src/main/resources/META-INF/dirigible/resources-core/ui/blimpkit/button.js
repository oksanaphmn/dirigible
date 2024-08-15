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
blimpkit.factory('bkButtonConfig', function (uuid, classNames) {
    return {
        getConfig: function () {
            return {
                transclude: false,
                require: '?^^bkInputGroupAddon',
                replace: true,
                scope: {
                    label: '@',
                    compact: '<?',
                    badge: '@?',
                    glyph: '@?',
                    disabledFocusable: '<?',
                    toggled: '<?',
                    type: '@?',
                    instructions: '@?',
                    isMenu: '<?',
                    arrowDirection: '@?',
                    isOverflow: '<?',
                    isSplit: '<?',
                    inGroup: '<?',
                    inMsgStrip: '<?',
                    nested: '<?',
                },
                link: {
                    pre: function (scope) {
                        if (scope.instructions)
                            scope.buttonId = `b${uuid.generate()}`;
                    },
                    post: function (scope, _element, attrs, ctrl) {
                        if (!scope.label && scope.glyph && !attrs.hasOwnProperty('ariaLabel'))
                            console.error('bk-button error: Icon-only buttons must have the "aria-label" attribute');
                        scope.getArrowClass = function () {
                            switch (scope.arrowDirection) {
                                case 'up':
                                    return 'sap-icon--slim-arrow-up';
                                case 'left':
                                    return 'sap-icon--slim-arrow-left';
                                case 'right':
                                    return 'sap-icon--slim-arrow-right';
                                default:
                                    return 'sap-icon--slim-arrow-down';
                            }
                        };
                        scope.getClasses = () => {
                            if (scope.disabledFocusable === true && (!scope.instructions || scope.instructions === '')) {
                                console.error('bk-button error: when using the "focusable disabled" state, you must provide a description using the "instructions" attribute.');
                            }
                            if (ctrl) ctrl.setButtonAddon(true);
                            return classNames('fd-button', {
                                'fd-button--menu': scope.isMenu === true,
                                'fd-button--compact': scope.compact === true,
                                'fd-toolbar__overflow-button': scope.isOverflow === true,
                                [`fd-button--${scope.type}`]: scope.type,
                                'fd-input-group__button': ctrl,
                                'fd-message-strip__close': scope.inMsgStrip === true,
                                'fd-button--toggled': scope.toggled === true,
                                'is-disabled': scope.disabledFocusable === true,
                                'fd-button--nested': scope.nested === true,
                            });
                        };
                        scope.getTextClasses = () => classNames({
                            'fd-button-split__text--compact': scope.compact === true && scope.isSplit === true,
                            'fd-button-split__text': scope.isSplit === true && scope.compact !== true,
                            'fd-button__text': scope.isSplit !== true,
                        });
                    }
                },
                innerTemplate: `<i ng-if="glyph" ng-class="glyph" role="presentation"></i>
                <span ng-if="label" ng-class="getTextClasses()">{{ label }}</span>
                <span ng-if="badge" class="fd-button__badge">{{ badge }}</span>
                <i ng-if="isMenu" ng-class="getArrowClass()"></i>
                <p ng-if="instructions" aria-live="assertive" class="fd-button__instructions" id="{{ uuid }}">{{ instructions }}</p>`,
            };
        }
    };
}).directive('bkButton', function (bkButtonConfig) {
    let buttonConfig = bkButtonConfig.getConfig();
    buttonConfig['restrict'] = 'A';
    buttonConfig['template'] = `<a ng-class="getClasses()"" ng-attr-aria-disabled="{{ disabledFocusable === true ? true : undefined }}" aria-pressed="{{ toggled === true }}" ng-attr-aria-describedby="{{ instructions ? buttonId : undefined }}">${buttonConfig.innerTemplate}</a>`;
    return buttonConfig;
}).directive('bkButton', function (bkButtonConfig) {
    /**
     * label: String - Button text.
     * compact: Boolean - Button size.
     * badge: String/Number - Used for showing a badge inside the button.
     * glyph: String - Icon class/classes.
     * disabledFocusable: Boolean - Set the disabled but focusable state. This must always be used with the 'instructions' attribute.
     * toggled: Boolean - Set the toggle state.
     * type: String - 'emphasized', 'transparent', 'ghost', 'positive', 'negative' and 'attention'. If not specified, normal state is assumed.
     * instructions: String - Short description when the button is disabled. It should contain the reason and what needs to be done to enable it. This is for screen readers.
     * isMenu: Boolean - Adds an arrow to the button.
     * arrowDirection: String - Direction of the menu arrow. Possible options are "up", "left", "right" and "down" (default).
     * isOverflow: Boolean - Used when the button is in a toolbar overflow popover.
     * isSplit: Boolean - (Internal use) If the button is part of a split button.
     * inGroup: Boolean - If the button is inside an bk-input-group-addon element.
     * inMsgStrip: Boolean - If the button is inside a message strip (see bk-message-strip).
     * nested: Boolean - Nested button mode.
     */
    let buttonConfig = bkButtonConfig.getConfig();
    buttonConfig['restrict'] = 'E';
    buttonConfig['template'] = `<button ng-class="getClasses()" ng-attr-aria-disabled="{{ disabledFocusable === true ? true : undefined }}" aria-pressed="{{ toggled === true }}" ng-attr-aria-describedby="{{ instructions ? buttonId : undefined }}">${buttonConfig.innerTemplate}</button>`;
    return buttonConfig;
}).directive('bkSegmentedButton', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    link: function (_scope, _element, attrs) {
        if (!attrs.hasOwnProperty('ariaLabel'))
            console.error('bk-segmented-button error: You should provide a description of the group using the "aria-label" attribute');
    },
    template: '<div class="fd-segmented-button" role="group" ng-transclude></div>'
})).directive('bkSplitButton', function (uuid, $window, $injector, backdrop) {
    /**
     * mainAction: String - Main button text
     * mainGlyph: String - Icon class for the button.
     * compact: Boolean - Button size.
     * glyph: String - Icon class for the dropdown button.
     * isDisabled: Boolean - If the buttons are disabled.
     * disabledFocusable: Boolean - Set the disabled but focusable state. This must always be used with the 'instructions' attribute.
     * instructions: String - Short description when the button is disabled. It should contain the reason and what needs to be done to enable it. This is for screen readers.
     * type: String - 'emphasized', 'transparent', 'ghost', 'positive', 'negative' and 'attention'. If not specified, normal state is assumed.
     * callback: Function - The passed function will be called when the main action button is clicked.
     */
    if (!$injector.has('bkPopoverDirective')) {
        console.error('bk-split-button requires the bk-popover widget to be loaded.');
        return {};
    }
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            mainAction: '@?',
            mainGlyph: '@?',
            compact: '<?',
            glyph: '@?',
            isDisabled: '<?',
            disabledFocusable: '<?',
            instructions: '@?',
            type: '@?',
            callback: '&',
        },
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            if ($scope.callback) $scope.callback = $scope.callback();
            $scope.popoverId = `sb${uuid.generate()}`;
            this.getPopoverId = function () {
                return $scope.popoverId;
            };

            let toggleBody;

            this.toggleBody = function (toggle) {
                toggleBody = toggle;
            };
            if (!$attrs.hasOwnProperty('ariaLabel'))
                console.error('bk-split-button error: You should provide a description of the split button using the "aria-label" attribute');
            $scope.getSplitClasses = function () {
                if ($scope.type) return `fd-button-split--${$scope.type}`;
                return '';
            };

            let isHidden = true;
            $scope.pointerHandler = function (e) {
                if (!$element[0].contains(e.target)) {
                    $scope.$apply($scope.hidePopover());
                }
            };
            function focusoutEvent(e) {
                if (e.relatedTarget && !$element[0].contains(e.relatedTarget)) {
                    $scope.$apply($scope.hidePopover);
                }
            }
            function pointerupEvent(e) {
                if (e.originalEvent && e.originalEvent.isSubmenuItem) return;
                else if ($scope.popoverControl && e.target === $scope.popoverControl) return;
                else if ($element[0].contains(e.target) && !isHidden) $scope.hidePopover();
            }
            $element.on('focusout', focusoutEvent);
            $element.on('pointerup', pointerupEvent);

            $scope.mainActionClicked = function () {
                if (!$scope.disabledFocusable)
                    $scope.callback();
            };

            $scope.hidePopover = function () {
                if ($scope.popoverControl) $scope.popoverControl.setAttribute('aria-expanded', 'false');
                toggleBody(false);
                isHidden = true;
                $window.removeEventListener('pointerup', $scope.pointerHandler);
                backdrop.deactivate();
            };

            $scope.togglePopover = function () {
                if (!$scope.popoverControl) $scope.popoverControl = $element[0].querySelector(`[aria-controls="${$scope.popoverId}"]`);
                if (isHidden) {
                    $scope.popoverControl.setAttribute('aria-expanded', 'true');
                    toggleBody(true);
                    isHidden = false;
                    $window.addEventListener('pointerup', $scope.pointerHandler);
                    backdrop.activate();
                } else {
                    $scope.hidePopover();
                };
            };
            function cleanUp() {
                $element.off('focusout', focusoutEvent);
                $element.off('pointerup', pointerupEvent);
                $window.removeEventListener('pointerup', $scope.pointerHandler);
                backdrop.cleanUp();
            }
            $scope.$on('$destroy', cleanUp);
        }],
        template: `<div class="fd-popover"><div class="fd-button-split" ng-class="getSplitClasses()" role="group">
        <bk-button glyph="{{ mainGlyph }}" label="{{ mainAction }}" ng-disabled="isDisabled" disabled-focusable="disabledFocusable" instructions="instructions" type="{{ type }}" is-split="true" compact="compact || false" ng-click="mainActionClicked()"></bk-button>
        <bk-button glyph="{{ glyph || 'sap-icon--slim-arrow-down' }}" ng-disabled="isDisabled || disabledFocusable" type="{{ type }}" compact="compact || false" aria-label="arrow down" aria-controls="{{ popoverId }}" aria-haspopup="true" aria-expanded="{{ popupExpanded }}" ng-click="togglePopover()"></bk-button>
        </div><bk-popover-body no-arrow="true"><ng-transclude></ng-transclude></bk-popover-body></div>`,
    }
});