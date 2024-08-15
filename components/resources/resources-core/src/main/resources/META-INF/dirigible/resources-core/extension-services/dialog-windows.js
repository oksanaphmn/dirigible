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

let dialogWindows = [];
const extensionPoints = (request.getParameter('extensionPoints') || 'platform-dialog-windows').split(',');
let dialogWindowExtensions = [];
for (let i = 0; i < extensionPoints.length; i++) {
    // @ts-ignore
    const extensionList = await Promise.resolve(extensions.loadExtensionModules(extensionPoints[i]));
    for (let e = 0; e < extensionList.length; e++) {
        dialogWindowExtensions.push(extensionList[e]);
    }
}

function setETag() {
    const maxAge = 30 * 24 * 60 * 60;
    const etag = uuid.random();
    response.setHeader("ETag", etag);
    response.setHeader('Cache-Control', `public, must-revalidate, max-age=${maxAge}`);
}

for (let i = 0; i < dialogWindowExtensions?.length; i++) {
    const dialogWindow = dialogWindowExtensions[i].getDialogWindow();
    if (dialogWindow.roles && Array.isArray(dialogWindow.roles)) {
        let hasRoles = true;
        for (const next of dialogWindow.roles) {
            if (!user.isInRole(next)) {
                hasRoles = false;
                break;
            }
        }
        if (hasRoles) {
            dialogWindows.push(dialogWindow);
        }
    } else if (dialogWindow.role && user.isInRole(dialogWindow.role)) {
        dialogWindows.push(dialogWindow);
    } else if (dialogWindow.role === undefined) {
        dialogWindows.push(dialogWindow);
    }
}

response.setContentType("application/json");
setETag();
response.println(JSON.stringify(dialogWindows));
response.flush();
response.close();