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
blimpkit.directive('bkAvatar', function (classNames) {
    /**
     * accentColor: String - The number of the accent color to be applied. Ranges from 1 to 10.
     * tile: Boolean - Avatar with a tile icon background.
     * isPlaceholder: Boolean - The avatar will have a placeholder background.
     * isTransparent: Boolean - The avatar will have a transparent background.
     * interactive: boolean - The avatar is clickable.
     * state: string - The state of the avatar. Available options - hover, focus, active, toggled, disabled and focus.
     * size: String - The size of the avatar. Possible options are 'xs', 's', 'm', 'l' and 'xl'. Default is 'xs'.
     * glyph: String - Icon class.
     * border: Boolean - Show border around avatar.
     * circle: Boolean - Avatar is in a circular shape.
     * zoomIcon: String -  Icon class.
     * zoomLabel: String - ARIA description of the zoom button.
     * image: String - Link to an image.
     */
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        require: '^^?bkCard',
        scope: {
            accentColor: '@?',
            tile: '<?',
            isPlaceholder: '<?',
            isTransparent: '<?',
            interactive: '<?',
            state: '@?',
            size: '@?',
            glyph: '@?',
            border: '<?',
            circle: '<?',
            zoomIcon: '@?',
            zoomLabel: '@?',
            image: '@?',
        },
        link: function (scope, element, attrs, cardCtrl) {
            if (!attrs.hasOwnProperty('ariaLabel'))
                console.error('bk-avatar error: You should provide a description using the "aria-label" attribute');
            if (scope.zoomIcon && !scope.zoomLabel)
                console.error('bk-avatar error: You should provide a description of the zoom button using the "zoom-label" attribute');
            if (scope.image) {
                element[0].style.backgroundImage = `url("${scope.image}")`;
                element[0].setAttribute('role', 'img');
            }
            scope.getClasses = () => classNames({
                [`fd-avatar--accent-color-${scope.accentColor}`]: scope.tile !== true && scope.accentColor,
                'fd-avatar--transparent': scope.isTransparent === true,
                'fd-avatar--placeholder': scope.isPlaceholder === true,
                'fd-avatar--thumbnail': scope.image,
                'fd-avatar--tile': scope.tile === true,
                'fd-avatar--xs': scope.size === 'xs' || !scope.size,
                'fd-avatar--s': scope.size === 's',
                'fd-avatar--m': scope.size === 'm',
                'fd-avatar--l': scope.size === 'l',
                'fd-avatar--xl': scope.size === 'xl',
                'fd-avatar--border': scope.border === true,
                'fd-avatar--circle': scope.circle === true,
                'is-hover': scope.state === 'hover',
                'is-active': scope.state === 'active',
                'is-toggled is-hover': scope.state === 'toggled',
                'is-disabled': scope.state === 'disabled',
                'is-focus': scope.state === 'focus',
                'fd-card__avatar': cardCtrl !== null,
            });
        },
        template: `<span class="fd-avatar" ng-class="getClasses()" aria-role="{{interactive ? 'button' : 'img'}}" ng-attr-tabindex="{{interactive && '0' || undefined}}">
            <ng-transclude><i ng-if="glyph" class="fd-avatar__icon {{glyph}}" role="presentation"></i></ng-transclude>
            <i ng-if="zoomIcon" class="fd-avatar__zoom-icon" ng-class="zoomIcon" aria-label="{{ zoomLabel }}"></i>
        </span>`,
    }
});