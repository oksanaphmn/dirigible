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
blimpkit.directive('bkScrollbar', () => ({
    restrict: 'E',
    transclude: true,
    replace: true,
    template: '<div class="fd-scrollbar" ng-transclude><div>',
})).directive('bkScrollbar', () => ({
    restrict: 'A',
    link: function (_scope, element) { element.addClass('fd-scrollbar') },
}));