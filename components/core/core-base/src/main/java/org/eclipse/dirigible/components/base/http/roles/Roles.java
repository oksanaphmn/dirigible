/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.base.http.roles;

/**
 * The Enum Roles.
 */
public enum Roles {

    /** The administrator. */
    ADMINISTRATOR("ADMINISTRATOR"),
    /** The developer. */
    DEVELOPER("DEVELOPER"),
    /** The operator. */
    OPERATOR("OPERATOR");

    /** The role name. */
    private final String roleName;

    /**
     * Instantiates a new roles.
     *
     * @param roleName the role name
     */
    Roles(String roleName) {
        this.roleName = roleName;
    }

    /**
     * Gets the role name.
     *
     * @return the role name
     */
    public String getRoleName() {
        return roleName;
    }

}
