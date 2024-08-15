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
import { user } from "sdk/security";

let perspectives = [];
const extensionPoints = (request.getParameter('extensionPoints') || 'platform-perspectives').split(',');
let perspectiveExtensions = [];
for (let i = 0; i < extensionPoints.length; i++) {
	// @ts-ignore
	const extensionList = await Promise.resolve(extensions.loadExtensionModules(extensionPoints[i]));
	for (let e = 0; e < extensionList.length; e++) {
		perspectiveExtensions.push(extensionList[e]);
	}
}

function setETag() {
	const maxAge = 30 * 24 * 60 * 60;
	const etag = uuid.random();
	response.setHeader("ETag", etag);
	response.setHeader('Cache-Control', `public, must-revalidate, max-age=${maxAge}`);
}

for (let i = 0; i < perspectiveExtensions?.length; i++) {
	const perspective = perspectiveExtensions[i].getPerspective();
	if (perspective.roles && Array.isArray(perspective.roles)) {
		let hasRoles = true;
		for (const next of perspective.roles) {
			if (!user.isInRole(next)) {
				hasRoles = false;
				break;
			}
		}
		if (hasRoles) {
			perspectives.push(perspective);
		}
	} else if (perspective.role && user.isInRole(perspective.role)) {
		perspectives.push(perspective);
	} else if (perspective.role === undefined) {
		perspectives.push(perspective);
	}
	let duplication = false;
	for (let i = 0; i < perspectives.length; i++) {
		for (let j = 0; j < perspectives.length; j++) {
			if (i !== j) {
				if (perspectives[i].label === perspectives[j].label) {
					if (perspectives[i].link !== perspectives[j].link) {
						console.error('Duplication at perspective with name: [' + perspectives[i].label + '] pointing to links: ['
							+ perspectives[i].link + '] and [' + perspectives[j].link + ']');
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

perspectives.sort(function (a, b) {
	if (a.order !== undefined && b.order !== undefined) {
		return (parseInt(a.order) - parseInt(b.order));
	} else if (a.order === undefined && b.order === undefined) {
		return a.label < b.label ? -1 : 1
	} else if (a.order === undefined) {
		return 1;
	} else if (b.order === undefined) {
		return -1;
	}
	return 0;
});
response.setContentType("application/json");
setETag();
response.println(JSON.stringify(perspectives));
response.flush();
response.close();