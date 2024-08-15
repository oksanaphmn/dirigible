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
import { extensions } from "sdk/extensions";
import { request, response } from "sdk/http";
import { uuid } from "sdk/utils";

let editors = [];
const extensionPoints = (request.getParameter('extensionPoints') || 'platform-editors').split(',');
let editorExtensions = [];
for (let i = 0; i < extensionPoints.length; i++) {
	// @ts-ignore
	const extensionList = await Promise.resolve(extensions.loadExtensionModules(extensionPoints[i]));
	for (let e = 0; e < extensionList.length; e++) {
		editorExtensions.push(extensionList[e]);
	}
}

function setETag() {
	const maxAge = 30 * 24 * 60 * 60;
	const etag = uuid.random();
	response.setHeader("ETag", etag);
	response.setHeader('Cache-Control', `public, must-revalidate, max-age=${maxAge}`);
}

for (let i = 0; i < editorExtensions?.length; i++) {
	editors.push(editorExtensions[i].getEditor());
	let duplication = false;
	for (let i = 0; i < editors.length; i++) {
		for (let j = 0; j < editors.length; j++) {
			if (i !== j) {
				if (editors[i].id === editors[j].id) {
					if (editors[i].link !== editors[j].link) {
						console.error('Duplication at editor with id: [' + editors[i].id + '] pointing to links: ['
							+ editors[i].link + '] and [' + editors[j].link + ']');
					}
					duplication = true;
					break;
				}
			}
		}
		if (duplication) {
			break;
		}
	}
}

response.setContentType("application/json");
setETag();
response.println(JSON.stringify(editors));
response.flush();
response.close();