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
const blimpkit = angular.module('blimpKit', ['ngAria'])
    .constant('ScreenEdgeMargin', {
        FULL: 16,
        DOUBLE: 32,
        QUADRUPLE: 64
    }).config(function config($compileProvider) {
        if ($compileProvider.debugInfoEnabled()) {
            $compileProvider.debugInfoEnabled(false);
            $compileProvider.commentDirectivesEnabled(false);
            $compileProvider.cssClassDirectivesEnabled(false);
        }
    }).factory('uuid', function () {
        return {
            generate: function () {
                function _p8(s) {
                    const p = (Math.random().toString(16) + "000000000").substring(2, 10);
                    return s ? "-" + p.substring(0, 4) + "-" + p.substring(4, 8) : p;
                }
                return _p8() + _p8(true) + _p8(true) + _p8();
            }
        };
    }).factory('backdrop', function ($document) {
        const backdrop = $document[0].createElement('div');
        backdrop.classList.add('bk-backdrop');
        $document[0].body.appendChild(backdrop);
        function contextmenuEvent(event) {
            event.stopPropagation();
        }
        backdrop.addEventListener('contextmenu', contextmenuEvent);

        const activate = function () {
            $document[0].body.classList.add('bk-backdrop--active');
        };
        const deactivate = function () {
            $document[0].body.classList.remove('bk-backdrop--active');
        };
        const cleanUp = function () {
            backdrop.removeEventListener('contextmenu', contextmenuEvent);
        }
        return {
            activate: activate,
            deactivate: deactivate,
            element: backdrop,
            cleanUp: cleanUp,
        };
    }).factory('classNames', function () {
        // @ts-ignore
        function classNames(...args) {
            let classes = [];
            for (let i = 0; i < args.length; i++) {
                let arg = args[i];
                if (!arg) continue;
                const argType = typeof arg;

                if (argType === 'string' || argType === 'number') {
                    classes.push(arg);
                } else if (Array.isArray(arg)) {
                    if (arg.length) {
                        // @ts-ignore
                        const inner = classNames(...arg);
                        if (inner) classes.push(inner);
                    }
                } else if (argType === 'object') {
                    if (arg.toString === Object.prototype.toString) {
                        for (const [key, value] of Object.entries(arg)) {
                            if (value) classes.push(key)
                        }
                    } else classes.push(arg.toString());
                }
            }
            return classes.join(' ');
        }
        return classNames;
    }).directive('focus', function ($timeout) {
        return {
            restrict: 'A',
            link: function (_scope, element, attrs) {
                attrs.$observe('bkFocus', function (newValue) {
                    if (newValue === 'true') $timeout(function () { element.focus() });
                });
            }
        };
    }).directive('inputRules', function ($parse) {
        /**
         * How to use:
         * <input ng-model="inputModel" ng-required input-rules="inputRules">
         * Example object (inputRules):
         * {
         *    excluded: ['this', 'that'],
         *    patterns: ['^[^/]*$'],
         * }
         */
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, _element, attr, controller) {
                let parseFn = $parse(attr.inputRules);
                scope.inputRules = parseFn(scope);

                function validation(_modelValue, viewValue) {
                    if (!attr.required && (viewValue === undefined || viewValue === null || viewValue === '')) return true;
                    else if (viewValue !== undefined || viewValue !== null || viewValue !== '') {
                        let isValid = true;
                        if (scope.inputRules.excluded) isValid = !scope.inputRules.excluded.includes(viewValue);
                        if (isValid && scope.inputRules.patterns) {
                            for (let i = 0; i < scope.inputRules.patterns.length; i++) {
                                isValid = RegExp(scope.inputRules.patterns[i]).test(viewValue);
                                if (!isValid) break;
                            }
                        }
                        return isValid;
                    } else if (attr.required) return false;
                    return true;
                }
                controller.$validators.pattern = validation;
            }
        };
    });