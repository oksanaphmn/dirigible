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
blimpkit.directive('bkMenu', ['$window', '$timeout', '$injector', 'backdrop', 'classNames', function ($window, $timeout, $injector, backdrop, classNames) {
    /**
     * maxHeight: Number - Maximum height in pixels before it starts scrolling. Default is the height of the window.
     * canScroll: Boolean - Enable/disable scroll menu support. Default is false.
     * show: Boolean - Use this instead of the CSS 'display' property. Otherwise, the menu will not work properly. Default is true.
     * noBackdrop: Boolean - Disables the backdrop. This may break the menu if not used properly. Default is false.
     * noShadow: Boolean - Removes the shadow effect. Default is false.
     * closeOnOuterClick: Boolean - Hide the menu when a user clicks outside it Default is true.
     */
    if (!$injector.has('bkScrollbarDirective')) {
        console.error('bk-menu requires the bk-scrollbar widget to be loaded.');
        return {};
    }
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        require: ['?^^bkPopover', '?^^bkSplitButton'],
        scope: {
            maxHeight: '@?',
            canScroll: '<?',
            hasIcons: '<?',
            show: '=?',
            noBackdrop: '<?',
            noShadow: '<?',
            closeOnOuterClick: '<?',
        },
        link: {
            pre: function (scope, _element, attrs, parentCtrls) {
                if (!attrs.hasOwnProperty('ariaLabel'))
                    console.error('bk-menu error: You must set the "aria-label" attribute');
                if (!angular.isDefined(scope.show))
                    scope.show = true;
                if (!angular.isDefined(scope.noBackdrop))
                    scope.noBackdrop = false;
                if (parentCtrls[0] !== null || parentCtrls[1] !== null) {
                    scope.noBackdrop = true;
                    scope.noShadow = true;
                    scope.closeOnOuterClick = false;
                } else scope.closeOnOuterClick = true;
                scope.defaultHeight = 16;
            },
            post: function (scope, element) {
                scope.setDefault = function () {
                    let rect = element[0].getBoundingClientRect();
                    scope.defaultHeight = $window.innerHeight - rect.top;
                };
                function resizeEvent() {
                    scope.$apply(function () { scope.setDefault() });
                }
                if (scope.maxHeight)
                    $window.addEventListener('resize', resizeEvent);
                scope.backdropClickEvent = function () {
                    scope.$apply(function () { scope.show = false; });
                };
                scope.backdropRightClickEvent = function (event) {
                    event.stopPropagation();
                    scope.$apply(function () { scope.show = false; });
                };
                const showWatch = scope.$watch('show', function () {
                    if (!scope.noBackdrop) {
                        if (scope.show) {
                            backdrop.activate();
                            if (scope.closeOnOuterClick) {
                                backdrop.element.addEventListener('click', scope.backdropClickEvent);
                                backdrop.element.addEventListener('contextmenu', scope.backdropRightClickEvent);
                            }
                        } else {
                            backdrop.deactivate();
                            if (scope.closeOnOuterClick) {
                                backdrop.element.removeEventListener('click', scope.backdropClickEvent);
                                backdrop.element.removeEventListener('contextmenu', scope.backdropRightClickEvent);
                            }
                        }
                    }
                });
                scope.getMenuClasses = function () {
                    if (scope.canScroll) element[0].style.maxHeight = `${scope.maxHeight || scope.defaultHeight}px`;
                    else element[0].style.removeProperty('max-height');
                    return classNames('fd-menu', { 'fd-menu--overflow': scope.canScroll === true, 'fd-menu--icons': scope.hasIcons === true });
                };
                scope.getListClasses = () => classNames('fd-menu__list', {
                    'fd-menu__list--no-shadow': scope.noShadow === true
                });
                function cleanUp() {
                    $window.removeEventListener('resize', resizeEvent);
                    backdrop.element.removeEventListener('click', scope.backdropClickEvent);
                    backdrop.element.removeEventListener('contextmenu', scope.backdropRightClickEvent);
                    backdrop.cleanUp();
                    showWatch();
                }
                scope.$on('$destroy', cleanUp);
                const contentLoaded = scope.$watch('$viewContentLoaded', function () {
                    $timeout(() => {
                        scope.setDefault();
                        contentLoaded();
                    }, 0);
                });
            },
        },
        template: '<nav ng-show="show" ng-class="getMenuClasses()"><ul ng-class="getListClasses()" role="menu" tabindex="-1" ng-transclude></ul></nav>'
    }
}]).directive('bkMenuItem', function (classNames) {
    /**
     * title: String - Title/label of the menu item.
     * hasSeparator: Boolean - The menu item will have a separating line on the bottom side.
     * isActive: Boolean - Set the menu item as active.
     * isSelected: Boolean - Set the menu item as selected.
     * isDisabled: Boolean - Set the menu item as disabled.
     * iconBefore: String - Icon class. Displays the icon before the title.
     * svgBefore: String - Svg url path. Displays the svg before the title. Alternative to iconBefore.
     * iconAfter: String - Icon class. Displays the icon at the end of the menu item.
     * svgAfter: String - Svg url path. Displays the svg at the end of title. Alternative to iconAfter.
     * link: String - URL string. Maps to href.
     */
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            title: '@',
            hasSeparator: '<?',
            isActive: '<?',
            isSelected: '<?',
            isDisabled: '<?',
            iconBefore: '@?',
            svgBefore: '@?',
            iconAfter: '@?',
            svgAfter: '@?',
            link: '@?',
        },
        link: function (scope,) {
            scope.getClasses = () => classNames('fd-menu__link', {
                'is-active': scope.isActive === true,
                'is-disabled': scope.isDisabled === true,
                'is-selected': scope.isSelected === true,
                'has-separator': scope.hasSeparator === true,
            });
            scope.getItemClasses = () => classNames('fd-menu__item', {
                'has-separator': scope.hasSeparator === true,
            });
        },
        innerTemplate: `<span ng-if="iconBefore || svgBefore" class="fd-menu__addon-before">
            <i class="{{ svgBefore ? 'bk-icon--svg sap-icon' : iconBefore }}" role="presentation"><ng-include ng-if="svgBefore" src="svgBefore"></ng-include></i>
        </span>
        <span class="fd-menu__title">{{ title }}</span>
        <span ng-if="iconAfter || svgAfter" class="fd-menu__addon-after">
            <i class="{{ svgAfter ? 'bk-icon--svg sap-icon' : iconAfter }}" role="presentation"><ng-include ng-if="svgAfter" src="svgAfter"></ng-include></i>
        </span>`,
        get template() {
            return `<li ng-class="getItemClasses()" role="presentation" tabindex="-1">
                <a ng-if="link" href="{{link}}" ng-class="getClasses()" role="menuitem" tabindex="{{ isDisabled ? -1 : 0 }}">${this.innerTemplate}</a>
                <span ng-if="!link" ng-class="getClasses()" role="menuitem" tabindex="{{ isDisabled ? -1 : 0 }}">${this.innerTemplate}</span>
            </li>`
        }
    }
}).directive('bkMenuSublist', function (uuid, $window, ScreenEdgeMargin, classNames) {
    /**
     * title: String - Title/label of the menu item.
     * hasSeparator: Boolean - The menu item will have a separating line on the bottom side.
     * maxHeight: Number - Maximum height in pixels before it starts scrolling. Default is the height of the window.
     * canScroll: Boolean - Enable/disable scroll menu support. Default is false.
     * isDisabled: Boolean - Set the menu sublist as disabled.
     * icon: String - Icon class. Displays the icon before the title.
     * svgPath: String - Path to an svg icon. Alternative to icon.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            title: '@',
            hasSeparator: '<?',
            maxHeight: '@?',
            canScroll: '<?',
            isDisabled: '<?',
            icon: '@?',
            svgPath: '@?',
        },
        link: {
            pre: function (scope) {
                scope.sublistId = `sl${uuid.generate()}`;
                scope.isExpanded = false;
                scope.defaultHeight = $window.innerHeight - ScreenEdgeMargin.DOUBLE;
            },
            post: function (scope, element) {
                let toHide = 0;
                function resizeEvent() {
                    if (!scope.isDisabled) {
                        scope.$apply(function () {
                            scope.defaultHeight = $window.innerHeight - ScreenEdgeMargin.DOUBLE;
                            scope.setPosition();
                        });
                    }
                }
                $window.addEventListener('resize', resizeEvent);
                scope.pointerHandler = function (e) {
                    if (!element[0].contains(e.target)) {
                        scope.$apply(scope.hideSubmenu());
                    }
                };
                function focusoutEvent(event) {
                    if (!element[0].contains(event.relatedTarget)) {
                        scope.$apply(scope.hideSubmenu());
                    }
                }
                function pointerupEvent(e) {
                    let listItem;
                    let list;
                    if (e.target.tagName !== "LI") {
                        listItem = e.target.closest('li');
                    } else {
                        listItem = e.target;
                    }
                    for (let i = 0; i < listItem.children.length; i++) {
                        if (listItem.children[i].tagName === 'UL') {
                            list = listItem.children[i];
                        }
                    }
                    if (list && list.id === scope.sublistId) {
                        e.originalEvent.isSubmenuItem = true;
                        if (e.originalEvent.pointerType !== 'mouse')
                            scope.$apply(scope.show());
                    }
                }
                element.on('pointerup', pointerupEvent);
                scope.getItemClasses = function () {
                    if (scope.hasSeparator) return 'has-separator';
                    return '';
                };
                scope.getIconClasses = () => classNames({
                    [scope.icon]: scope.icon && !scope.svgPath,
                    'bk-icon--svg sap-icon': !scope.icon && scope.svgPath,
                });
                scope.getClasses = () => classNames('fd-menu__link has-child', {
                    'is-expanded': scope.isExpanded === true,
                    'is-disabled': scope.isDisabled === true,
                });
                scope.setPosition = function () {
                    if (!angular.isDefined(scope.menu)) scope.menu = element[0].querySelector(`#${scope.sublistId}`);
                    requestAnimationFrame(function () {
                        const rect = scope.menu.getBoundingClientRect();
                        const bottom = $window.innerHeight - ScreenEdgeMargin.FULL - rect.bottom;
                        const right = $window.innerWidth - rect.right;
                        if (bottom < 0) scope.menu.style.top = `${bottom}px`;
                        if (right < 0) {
                            scope.menu.style.left = `${scope.menu.offsetWidth * -1}px`;
                            scope.menu.classList.add('bk-submenu--left');
                        }
                    });
                };
                scope.show = function () {
                    if (toHide) clearTimeout(toHide);
                    if (!scope.isDisabled && !scope.isExpanded) {
                        scope.isExpanded = true;
                        scope.setPosition();
                        $window.addEventListener('pointerup', scope.pointerHandler);
                    }
                };
                scope.hideSubmenu = function () {
                    scope.isExpanded = false;
                    scope.menu.style.removeProperty('top');
                    scope.menu.style.removeProperty('left');
                    scope.menu.classList.remove('bk-submenu--left');
                    element.off('focusout', focusoutEvent);
                    $window.removeEventListener('pointerup', scope.pointerHandler);
                };
                scope.hide = function (event) {
                    if (!scope.isDisabled && scope.isExpanded) {
                        if (event.relatedTarget) {
                            if (typeof event.relatedTarget.className === 'string' && event.relatedTarget.className.includes('fd-menu__')) {
                                scope.hideSubmenu();
                            } else if (!element[0].contains(event.relatedTarget)) {
                                toHide = setTimeout(function () {
                                    scope.$apply(scope.hideSubmenu());
                                }, 300);
                            }
                        } else if (!element[0] === event.currentTarget) { // Firefox tooltip fix
                            scope.hideSubmenu();
                        }
                    }
                };

                scope.focus = function () {
                    element.on('focusout', focusoutEvent);
                    scope.show();
                };

                function cleanUp() {
                    element.off('pointerup', pointerupEvent);
                    element.off('focusout', focusoutEvent);
                    $window.removeEventListener('resize', resizeEvent);
                    $window.removeEventListener('pointerup', scope.pointerHandler);
                }
                scope.$on('$destroy', cleanUp);
            }
        },
        template: `<li class="fd-menu__item" ng-class="getItemClasses()" role="presentation" ng-mouseenter="show()" ng-mouseleave="hide($event)" tabindex="0" ng-focus="focus()">
            <span aria-controls="{{sublistId}}" aria-expanded="{{isExpanded}}" aria-haspopup="true" role="menuitem" ng-class="getClasses()">
                <span ng-if="icon || svgPath" class="fd-menu__addon-before"><i class="{{getIconClasses()}}" role="presentation"><ng-include ng-if="svgPath" src="svgPath"></ng-include></i></span>
                <span class="fd-menu__title">{{title}}</span>
                <span class="fd-menu__addon-after fd-menu__addon-after--submenu"></span>
            </span>
            <ul ng-if="canScroll && !isDisabled" class="fd-menu__sublist fd-menu--overflow bk-menu__sublist--overflow" bk-scrollbar id="{{sublistId}}" aria-hidden="{{!isExpanded}}" role="menu" style="max-height:{{ maxHeight || defaultHeight }}px;" ng-transclude></ul>
            <ul ng-if="!canScroll && !isDisabled" class="fd-menu__sublist" id="{{sublistId}}" aria-hidden="{{!isExpanded}}" role="menu" ng-transclude></ul>
        </li>`
    }
});