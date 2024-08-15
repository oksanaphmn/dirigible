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
blimpkit.directive('bkIconTabBar', function (classNames, $injector) {
    /**
     * iconOnly: Boolean - When true, tabs can have icons but no text.
     * hasIcons: Boolean - When true, tabs can have both icons and text.
     * isProcess: Boolean - When the tabs are used as steps for a wizard, set this to true.
     * isNav: Boolean - When the tabs are used as a main navigation, inside a Shell Navigation.
     * hasFilter: Boolean - The tab bar has a filter tab.
     * hasCounters: Boolean - The tabs inside the bar will have counters.
     * flatNav: Boolean - Use with flat navigation.
     * sidePadding: String - Size of the side padding. Supported options are 'sm', 'md', 'lg', 'xl', 'xxl' and 'responsive'.
     * transparent: Boolean - Transparent background.
     * translucent: Boolean - In translucent mode the header gets "--sapObjectHeader_Background" background color and the panel "--sapGroup_ContentBackground" background color.
     * unfocused: Boolean - Tabs will be in an unfocused state.
     * selectedTabId: String - Set selected tab.
     */
    if (!$injector.has('bkPopoverDirective') || !$injector.has('bkButtonDirective')) {
        console.error('bk-icon-tab-bar requires the bk-button and bk-popover widgets to be loaded.');
        return {};
    }
    return {
        restrict: 'E',
        transclude: {
            'tabs': 'bkIconTabBarTablist',
            'panels': '?bkIconTabBarPanel',
            'buttons': '?bkIconTabBarButtons',
        },
        replace: true,
        scope: {
            iconOnly: '<?',
            hasIcons: '<?',
            isProcess: '<?',
            isNav: '<?',
            hasFilter: '<?',
            hasCounters: '<?',
            flatNav: '<?',
            sidePadding: '@?',
            transparent: '<?',
            translucent: '<?',
            unfocused: '<?',
            selectedTabId: '=?',
        },
        controller: ['$scope', function ($scope) {
            $scope.lastSelectedTabId;
            $scope.updateLastSelectedTabId = true;
            $scope.tabList = [];
            $scope.eventCallbacks = [];

            const fireEvent = function (c) {
                $scope.eventCallbacks.forEach(c);
            };

            this.getIsProgress = function () {
                return $scope.isProcess;
            };
            this.getIsFilter = function () {
                return $scope.hasFilter;
            };
            this.getIsUnfocused = function () {
                return $scope.unfocused;
            };
            $scope.getClasses = () => classNames({
                'fd-icon-tab-bar--icon-only': $scope.iconOnly && !$scope.hasIcons,
                'fd-icon-tab-bar--icon': $scope.hasIcons && !$scope.iconOnly,
                'fd-icon-tab-bar--process': $scope.isProcess,
                'fd-icon-tab-bar--counters': $scope.hasCounters,
                'fd-icon-tab-bar--navigation': $scope.isNav,
                'fd-icon-tab-bar--filter': $scope.hasFilter,
                'fd-icon-tab-bar--navigation-flat': $scope.isNav && $scope.flatNav,
                'fd-icon-tab-bar--sm': $scope.sidePadding === 'sm',
                'fd-icon-tab-bar--md': $scope.sidePadding === 'md',
                'fd-icon-tab-bar--lg': $scope.sidePadding === 'lg',
                'fd-icon-tab-bar--xl': $scope.sidePadding === 'xl',
                'fd-icon-tab-bar--xxl': $scope.sidePadding === 'xxl',
                'fd-icon-tab-bar--responsive-paddings': $scope.sidePadding === 'responsive',
                'fd-icon-tab-bar--transparent': $scope.transparent,
                'fd-icon-tab-bar--translucent': $scope.translucent,
            });

            this.addIconTab = function (tabId, tabCallbacks) {
                if ((!angular.isDefined($scope.selectedTabId) || $scope.selectedTabId === null) && $scope.tabList.length === 0) {
                    $scope.selectedTabId = tabId;
                }

                $scope.tabList.push(tabId);

                fireEvent(c => c.tabAdded(tabId, tabCallbacks));
            };

            this.removeIconTab = function (tabId) {
                this.onTabClose(tabId);

                const tabIndex = $scope.tabList.indexOf(tabId);
                if (tabIndex >= 0) {
                    $scope.tabList.splice(tabIndex, 1);
                }

                fireEvent(c => c.tabRemoved(tabId));
            };

            this.onTabClose = function (tabId) {
                let nextSelectedTabId;
                if (tabId === $scope.selectedTabId) {
                    if ($scope.lastSelectedTabId)
                        nextSelectedTabId = $scope.lastSelectedTabId;

                    if (!nextSelectedTabId && $scope.tabList.length > 1) {
                        let tabIndex = $scope.tabList.indexOf(tabId) + 1;

                        nextSelectedTabId = $scope.tabList[tabIndex];
                        if (!nextSelectedTabId) {
                            const tabList = $scope.tabList.filter(x => x !== tabId);
                            nextSelectedTabId = tabList[tabList.length - 1];
                        }
                    }
                } else if ($scope.lastSelectedTabId === tabId) {
                    $scope.lastSelectedTabId = null;
                }

                if (nextSelectedTabId) {
                    $scope.updateLastSelectedTabId = false;
                    $scope.selectedTabId = nextSelectedTabId;
                }
            };

            this.getIsSelected = function (tabId) {
                return tabId === $scope.selectedTabId;
            };

            this.getSelectedTabId = function () {
                return $scope.selectedTabId;
            };

            this.getTabList = function () {
                return $scope.tabList;
            };

            this.subscribe = function (eventCallback) {
                const index = $scope.eventCallbacks.indexOf(eventCallback);
                if (index === -1) {
                    $scope.eventCallbacks.push(eventCallback);
                }
            };

            this.unsubscribe = function (eventCallback) {
                const index = $scope.eventCallbacks.indexOf(eventCallback);
                if (index >= 0) {
                    $scope.eventCallbacks.splice(index, 1);
                }
            };

            const selectedWatch = $scope.$watch('selectedTabId', function (newSelectedTabId, oldSelectedTabId) {
                if (newSelectedTabId !== oldSelectedTabId) {
                    if ($scope.updateLastSelectedTabId) {
                        $scope.lastSelectedTabId = oldSelectedTabId;
                    } else {
                        $scope.lastSelectedTabId = null;
                        $scope.updateLastSelectedTabId = true;
                    }

                    fireEvent(c => c.tabSelected(newSelectedTabId));
                }
            });

            $scope.$on('$destroy', function () {
                selectedWatch();
            });
        }],
        template: '<div class="fd-icon-tab-bar bk-icon-tab-bar" ng-class="getClasses()"><ng-transclude ng-transclude-slot="tabs"></ng-transclude><ng-transclude ng-transclude-slot="panels" class="bk-icon-tab-bar-panels"></ng-transclude><ng-transclude ng-transclude-slot="buttons"></ng-transclude></div>'
    }
}).directive('bkIconTabBarTablist', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    template: '<ul role="tablist" class="fd-icon-tab-bar__header" style="overflow-x: visible" ng-transclude></ul>'
})).directive('bkTabsOverflowable', function ($timeout) {
    return {
        restrict: 'A',
        require: '^^bkIconTabBar',
        link: function (scope, element, _attr, tabBarCtrl) {

            scope.tabCallbacks = {};
            scope.tabsListener = {
                tabAdded: (tabId, tabCallbacks) => {
                    scope.tabCallbacks[tabId] = tabCallbacks;
                    scope.updateTabsVisibility();
                },
                tabRemoved: (tabId) => {
                    delete scope.tabCallbacks[tabId];
                    scope.updateTabsVisibility();
                },
                tabSelected: () => {
                    $timeout(scope.updateTabsVisibility);
                },
            };

            tabBarCtrl.subscribe(scope.tabsListener);

            scope.updateTabsVisibility = (containerWidth = -1) => {
                const tabsListEl = element;

                if (containerWidth === -1)
                    containerWidth = tabsListEl.width();

                const selectedTabId = tabBarCtrl.getSelectedTabId()

                const moreButtonEl = tabsListEl.find('button.fd-icon-tab-bar__overflow');
                const tabsButtonsEl = tabsListEl.find('.bk-icon-tab-bar__item--buttons');
                const selectedTabEl = tabsListEl.find(`[tab-id="${selectedTabId}"]`);

                let width = selectedTabEl.length > 0 ? selectedTabEl.outerWidth(true) : 0;
                let moreBtnWidth = moreButtonEl.length ? moreButtonEl.outerWidth(true) : 0;
                let tabsButtonsWidth = tabsButtonsEl.length ? tabsButtonsEl.outerWidth(false) : 0;

                const selectedTab = scope.tabCallbacks[selectedTabId];
                if (selectedTab) selectedTab.setTabHidden(false);

                const tabList = tabBarCtrl.getTabList();
                for (let i = 0; i < tabList.length; i++) {
                    let tabId = tabList[i];
                    if (tabId === selectedTabId) continue;

                    const tabEl = tabsListEl.find(`[tab-id="${tabId}"]`);

                    let availableWidth = containerWidth - tabsButtonsWidth - moreBtnWidth;

                    width += tabEl.outerWidth(true);

                    if (width < availableWidth) {
                        scope.tabCallbacks[tabId].setTabHidden(false);
                    } else {
                        scope.tabCallbacks[tabId].setTabHidden(true);
                    }
                }
            };

            const ro = new ResizeObserver(entries => {
                const width = entries[0].contentRect.width;
                $timeout(() => scope.updateTabsVisibility(width));
            });

            ro.observe(element[0]);

            scope.$on('$destroy', function () {
                ro.unobserve(element[0]);
                tabBarCtrl.unsubscribe(scope.tabsListener);
            });
        }
    }
}).directive('bkIconTabBarTab', function (classNames) {
    /**
     * label: String - Tab label.
     * description: String - Description label next to the icon.
     * counter: String - Counter label shown next to or above the label.
     * hasBadge: Boolean - If the tab has a badge indicator.
     * icon: String - Icon class.
     * link: String - Link.
     * tabId: String - The id of the tab.
     * tabHint: String - Show a small text hint next to the label. This is ignored in icon and process mode. 
     * state: String - State of the tab. Possible options are 'positive', 'negative', 'critical' and 'informative'.
     * isLastStep: Boolean - If the tabs is the last step of a process.
     * onClose: Function - Function that will be called when the tab close button is clicked. The tab ID will be passed as a parameter.
     * closable: Boolean - Enables the close button next to the tab label.
     * isHidden: Boolean - Whether the tab should be visible or not
     */
    return {
        restrict: 'E',
        transclude: false,
        require: '^^bkIconTabBar',
        replace: true,
        scope: {
            label: '@?',
            description: '@?',
            counter: '@?',
            hasBadge: '<?',
            icon: '@?',
            link: '@?',
            tabId: '@',
            tabHint: '@?',
            state: '@?',
            isLastStep: '<?',
            onClose: '&?',
            closable: '<?',
            isHidden: '=?'
        },
        link: {
            pre: function (scope, _element, _attr, tabBarCtrl) {
                tabBarCtrl.addIconTab(scope.tabId, {
                    setTabHidden: (isHidden) => {
                        scope.isHidden = isHidden;
                    }
                });

                scope.isDragged = false;
                scope.separatorAfter = false;
                scope.separatorBefore = false;

                scope.isProcess = tabBarCtrl.getIsProgress;
                scope.isFilter = tabBarCtrl.getIsFilter;
                scope.isSelected = tabBarCtrl.getIsSelected;
                scope.getIsDraggable = tabBarCtrl.getIsDraggable;
                scope.getClasses = () => classNames({
                    'fd-icon-tab-bar__item--positive': scope.state === 'positive',
                    'fd-icon-tab-bar__item--negative': scope.state === 'negative',
                    'fd-icon-tab-bar__item--critical': scope.state === 'critical',
                    'fd-icon-tab-bar__item--informative': scope.state === 'informative',
                    'fd-icon-tab-bar__item--closable': scope.closable,
                    'bk-opacity-7': tabBarCtrl.getIsUnfocused(),
                    'bk-icon-tab-bar-tab-hidden': scope.isHidden
                });
                scope.close = function (event) {
                    event.stopPropagation();
                    if (scope.onClose) scope.onClose({ tabId: scope.tabId });
                };

                scope.$on('$destroy', function () {
                    tabBarCtrl.removeIconTab(scope.tabId);
                });
            }
        },
        template: `<li role="presentation" class="fd-icon-tab-bar__item" ng-class="getClasses()" tabindex="0">
            <a role="tab" class="fd-icon-tab-bar__tab" ng-attr-href="{{link || undefined}}" aria-selected="{{isSelected(tabId)}}" id="{{tabId}}">
                <div ng-if="icon" class="fd-icon-tab-bar__container">
                    <span class="fd-icon-tab-bar__icon"><i class="{{icon}}" role="presentation"></i></span>
                    <span ng-if="!description" class="fd-icon-tab-bar__counter">{{counter}}</span>
                    <span ng-if="hasBadge" class="fd-icon-tab-bar__badge"></span>
                </div>
                <span ng-if="counter && !icon" class="fd-icon-tab-bar__counter">{{counter}}</span>
                <span ng-if="hasBadge && !icon" class="fd-icon-tab-bar__badge"></span>
                <span ng-if="label && !icon" class="fd-icon-tab-bar__tag">{{label}}<span class="bk-icon-tab-hint" ng-if="tabHint">{{tabHint}}</span></span>
                <div ng-if="label && isFilter()" class="fd-icon-tab-bar__label">{{label}}</div>
                <div ng-if="icon && description" class="fd-icon-tab-bar__details">
                    <span class="fd-icon-tab-bar__counter">{{counter}}</span>
                    <span class="fd-icon-tab-bar__label">{{description}}</span>
                </div>
            </a>
            <div ng-if="closable" class="fd-icon-tab-bar__button-container">
                <bk-button glyph="sap-icon--decline" class="fd-icon-tab-bar__button" aria-label="close tab" type="transparent" ng-click="close($event)" tabindex="0"></bk-button>
            </div>
            <span ng-if="isProcess() && !isLastStep" class="fd-icon-tab-bar__separator"><i class="sap-icon--process" role="presentation"></i></span>
        </li>`
    }
}).directive('bkIconTabBarFilterItem', function () {
    /**
     * label: String - Filter tab label.
     * counter: String - Counter label shown next to or above the label.
     * link: String - Link.
     * tabId: String - The id of the tab.
     * isSelected: Boolean - If the tab is selected.
     */
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            label: '@?',
            counter: '@?',
            link: '@?',
            tabId: '@',
            isSelected: '<?',
        },
        template: `<li role="presentation" class="fd-icon-tab-bar__item"">
            <a role="tab" class="fd-icon-tab-bar__tab" ng-attr-href="{{link || undefined}}" aria-selected="{{isSelected || false}}" id="{{tabId}}">
                <div class="fd-icon-tab-bar__container fd-icon-tab-bar__container--filter">
                    <span class="fd-icon-tab-bar__filter-counter">{{counter}}</span>
                    <span class="fd-icon-tab-bar__filter-label">{{label}}</span>
                </div>
            </a>
        </li>`
    }
}).directive('bkIconTabBarOverflow', function () {
    /**
     * label: String - Button label.
     * state: String - State of the button. Options - 'hover', 'active' and 'focus'.
     * align: String - Relative position of the popover. For possible options, look at "fd-popover-body".
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            label: '@',
            state: '@?',
            align: '@?',
        },
        template: `<li role="presentation" class="fd-icon-tab-bar__item fd-icon-tab-bar__item--overflow">
            <bk-popover>
                <bk-popover-control>
                    <button class="fd-icon-tab-bar__overflow" ng-class="getClasses()" ng-class="{'hover': 'is-hover','active': 'is-active','focus': 'is-focus'}[state]">
                        <span class="fd-icon-tab-bar__overflow-text">{{label}}</span>
                        <i class="sap-icon--slim-arrow-down" role="presentation"></i>
                    </button>
                </bk-popover-control>
                <bk-popover-body class="fd-icon-tab-bar__popover-body" no-arrow="true" align="{{ align || 'bottom-right' }}">
                    <ul role="list" class="fd-list fd-list--navigation fd-list--no-border fd-icon-tab-bar__list" ng-transclude></ul>
                </bk-popover-body>
            </bk-popover>
        </li>`
    }
}).directive('bkIconTabBarOverflowItem', function (classNames) {
    /**
     * label: String - Tab label.
     * counter: String - Counter label shown next to the label.
     * hasBadge: Boolean - If the tab has a badge indicator.
     * icon: String - Icon class.
     * link: String - Link.
     * tabId: String - The id of the tab.
     * tabHint: String - Show a small text hint next to the label. This is ignored in icon and process mode. 
     * state: String - State of the tab. Possible options are 'positive', 'negative', 'critical' and 'informative'.
     * onClose: Function - Function that will be called when the tab close button is clicked. The tab will have an "X" button and on click, the tab ID will be passed as a parameter.
     */
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            label: '@',
            counter: '@?',
            hasBadge: '<?',
            icon: '@?',
            link: '@?',
            tabId: '@',
            tabHint: '@?',
            state: '@?',
            onClose: '&?',
        },
        link: {
            pre: function (scope) {
                scope.getClasses = () => classNames('fd-list__item', 'fd-list__item--link', 'fd-icon-tab-bar__list-item', {
                    'fd-icon-tab-bar__list-item--positive': scope.state === 'positive',
                    'fd-icon-tab-bar__list-item--negative': scope.state === 'negative',
                    'fd-icon-tab-bar__list-item--critical': scope.state === 'critical',
                    'fd-icon-tab-bar__list-item--informative': scope.state === 'informative',
                    'fd-icon-tab-bar__list-item--closable': scope.onClose,
                });
                scope.close = function (event) {
                    event.stopPropagation();
                    if (scope.onClose) scope.onClose({ tabId: scope.tabId });
                };
            }
        },
        template: `<li ng-class="getClasses()" tabindex="-1">
            <a tabindex="0" class="fd-list__link fd-icon-tab-bar__list-link" ng-attr-href="{{link || undefined}}" id="{{tabId}}">
                <span ng-if="icon" class="fd-icon-tab-bar__list-item-icon-container">
                    <span class="fd-list__icon fd-icon-tab-bar__list-item-icon">
                        <i class="{{icon}}" role="presentation"></i>
                    </span>
                </span>
                <span class="fd-list__title fd-icon-tab-bar__list-item-title">{{label}}<span class="bk-icon-tab-hint" ng-if="tabHint">{{tabHint}}</span></span>
                <span ng-if="counter" class="fd-list__counter fd-icon-tab-bar__list-item-counter">{{counter}}</span>
                <span ng-if="hasBadge" class="fd-icon-tab-bar__badge"></span>
            </a>
            <div ng-if="onClose" class="fd-icon-tab-bar__button-container">
                <bk-button glyph="sap-icon--decline" class="fd-icon-tab-bar__button" aria-label="close tab" type="transparent" of-close-btn ng-click="close($event)"></bk-button>
            </div>
        </li>`
    }
}).directive('bkIconTabBarButtons', () => ({
    /**
     * alignRight: Boolean - Align the buttons to the right of the tab panel.
     */
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: { alignRight: '<?' },
    template: `<div class="bk-icon-tab-bar__item--buttons" ng-class="{true: 'bk-icon-tab-bar__item--buttons-right'}[align]" ng-transclude></div>`
})).directive('bkIconTabBarPanel', () => ({
    /**
     * tabId: String - The id of the tab this panel belongs to.
     */
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: { tabId: '@' },
    template: '<section role="tabpanel" class="fd-icon-tab-bar__panel" aria-labelledby="{{tabId}}" ng-transclude></section>'
}));