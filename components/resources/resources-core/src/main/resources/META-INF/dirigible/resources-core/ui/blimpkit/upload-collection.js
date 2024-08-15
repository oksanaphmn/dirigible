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
blimpkit.directive('bkUploadCollection', function (classNames, $injector) {
    /**
     * small: Boolean - Whether or not this is the small upload collection.
     * selection: Boolean - Whether or not this upload collection supports selection.
     */
    if (!$injector.has('bkButtonDirective') || !$injector.has('bkInputDirective')) {
        console.error('bk-pagination requires the bk-button and bk-input widgets to be loaded.');
        return {};
    }
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            small: '<?',
            selection: '<?'
        },
        link: function (scope) {
            scope.getClassNames = () => classNames('fd-list', 'fd-list--byline', 'fd-upload-collection', {
                'fd-upload-collection--sm': scope.small,
                'fd-list--selection': scope.selection
            });
        },
        template: '<ul ng-class="getClassNames()" role="list" ng-transclude></ul>'
    }
}).directive('bkUploadCollectionItem', function (classNames) {
    /**
     * selected: Boolean - Whether or not this item is selected
     * fileName: Boolean - The name of the file, not including the type extension.
     * extension: Boolean - The file type extension.
     * fileNameChanged: Function - Event emitted when the user changes a file name. Args: (fileName : String)
     * deleteClicked: Function - Event emitted when presses the delete button.
     * editable: Boolean - Whether or not this upload collection item supports filename editing.
     */
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            selected: '<?',
            fileName: '@',
            extension: '@?',
            fileNameChanged: '&?',
            deleteClicked: '&',
            editable: '<?'
        },
        controller: ['$scope', function ($scope) {
            $scope.editing = false;
            this.getFileName = function () {
                return $scope.fileName;
            }
            this.getEditedFileName = function () {
                return $scope.editedFileName;
            }
            this.getExtension = function () {
                return $scope.extension;
            }
            this.isEditing = function () {
                return $scope.editing;
            }
            this.isEditable = function () {
                return $scope.editable || false;
            }
            this.setEditing = function (editing) {
                $scope.editing = editing;
                $scope.editedFileName = $scope.fileName;
            }
            this.fileNameChanged = function (fileName) {
                $scope.editedFileName = fileName;
            }
            this.applyFilenameChange = function () {
                $scope.fileName = $scope.editedFileName;
                this.setEditing(false);

                if ($scope.fileNameChanged)
                    $scope.fileNameChanged({ fileName: $scope.fileName });
            }

            this.deleteItem = function () {
                if ($scope.deleteClicked)
                    $scope.deleteClicked();
            }

            $scope.getClassNames = () => classNames('fd-list__item', 'fd-upload-collection__item', {
                'is-selected': $scope.selected
            });
            $scope.getAriaSelected = () => $scope.selected ? 'true' : undefined;
        }],
        template: '<li role="listitem" tabindex="0" ng-class="getClassNames()" ng-attr-aria-selected="{{ getAriaSelected() }}" ng-transclude></li>'
    }
}).directive('bkUploadCollectionItemContent', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<div class="fd-list__content" ng-transclude><div>'
})).directive('bkUploadCollectionTitleContainer', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<div class="fd-upload-collection__title-container" ng-transclude></div>'
})).directive('bkUploadCollectionTitle', () => ({
    restrict: 'EA',
    replace: true,
    require: '^^bkUploadCollectionItem',
    link: function (scope, _element, _attr, itemCtrl) {
        scope.getTitle = () => {
            const ext = itemCtrl.getExtension();
            if (ext) return `${itemCtrl.getFileName()}.${ext}`;
            return itemCtrl.getFileName();
        };
        scope.isEditing = () => itemCtrl.isEditing();
    },
    template: '<span ng-if="!isEditing()" class="fd-list__title fd-upload-collection__title">{{ getTitle() }}</span>'
})).directive('bkUploadCollectionFormItem', () => ({
    restrict: 'EA',
    replace: true,
    require: '^^bkUploadCollectionItem',
    link: function (scope, _element, _attr, itemCtrl) {
        let editing;
        scope.file = { name: itemCtrl.getFileName() };
        scope.getExtension = () => itemCtrl.getExtension();
        scope.isEditing = () => {
            if (editing !== itemCtrl.isEditing()) {
                scope.file.name = itemCtrl.getFileName();
                editing = itemCtrl.isEditing();
            }
            return editing;
        }
        scope.onFileNameChange = () => itemCtrl.fileNameChanged(scope.file.name);
        scope.getInputState = () => scope.file.name ? null : 'error';
    },
    template: `<div ng-if="isEditing()" class="fd-upload-collection__form-item">
        <bk-input type="text" placeholder="Filename" state="{{ getInputState() }}" ng-required ng-model="file.name" ng-change="onFileNameChange()" style="pointer-events: all"></bk-input>
        <span class="fd-upload-collection__extension">.{{ getExtension() }}</span>
    </div>`
})).directive('bkUploadCollectionDescription', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<div class="fd-upload-collection__description" ng-transclude><div>'
})).directive('bkUploadCollectionTextSeparator', () => ({
    restrict: 'EA',
    replace: true,
    template: '<span class="fd-upload-collection__text-separator"></span>'
})).directive('bkUploadCollectionStatusGroup', () => ({
    restrict: 'EA',
    transclude: true,
    replace: true,
    template: '<div class="fd-upload-collection__status-group" ng-transclude><div>'
})).directive('bkUploadCollectionStatusItem', () => ({
    restrict: 'A',
    require: 'bkObjectStatus',
    link: function (_scope, _element, _attr, objectStatusCtrl) {
        objectStatusCtrl.setIsUploadCollection();
    }
})).directive('bkUploadCollectionButtonGroup', () => ({
    restrict: 'EA',
    replace: true,
    require: '^^bkUploadCollectionItem',
    link: function (scope, _element, _attr, itemCtrl) {
        scope.isEditing = () => itemCtrl.isEditing();
        scope.isEditable = () => itemCtrl.isEditable();
        scope.editClick = (e) => {
            e.stopPropagation();
            itemCtrl.setEditing(true);
        }
        scope.cancelClick = (e) => {
            e.stopPropagation();
            itemCtrl.setEditing(false);
        }
        scope.deleteClick = (e) => {
            e.stopPropagation();
            itemCtrl.deleteItem();
        }
        scope.okClick = (e) => {
            e.stopPropagation();
            itemCtrl.applyFilenameChange();
        }
        scope.getOkButtonState = () => itemCtrl.getEditedFileName() ? undefined : 'disabled';
    },
    template: `<div class="fd-upload-collection__button-group">
        <bk-button ng-if="isEditable() && !isEditing()" aria-label="Edit" type="transparent" glyph="sap-icon--edit" ng-click="editClick($event)"></bk-button>
        <bk-button ng-if="!isEditing()" aria-label="Delete" type="transparent" glyph="sap-icon--decline" ng-click="deleteClick($event)"></bk-button>
        <bk-button ng-if="isEditing()" label="Ok" state="{{ getOkButtonState() }}" type="transparent" ng-click="okClick($event)"></bk-button>
        <bk-button ng-if="isEditing()" label="Cancel" type="transparent" ng-click="cancelClick($event)"></bk-button>
    <div>`
}));