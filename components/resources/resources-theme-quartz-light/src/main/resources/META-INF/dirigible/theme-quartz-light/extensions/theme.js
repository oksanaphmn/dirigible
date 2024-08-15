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
exports.getTheme = function () {
	return {
		id: 'quartz-light',
		module: 'theme-quartz-light',
		name: 'Quartz Light',
		type: 'light',
		version: 9,
		oldThemeId: 'fiori',
		links: [
			'/webjars/sap-theming__theming-base-content/11.17.1/content/Base/baseLib/sap_fiori_3/css_variables.css',
			'/webjars/fundamental-styles/0.37.4/dist/theming/sap_fiori_3.css',
		]
	};
};
