/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.database.sql.dialects.postgres;

import org.eclipse.dirigible.components.database.DatabaseSystem;
import org.eclipse.dirigible.database.sql.ISqlDialect;
import org.eclipse.dirigible.database.sql.ISqlDialectProvider;

/**
 * The Class PostgresSqlDialectProvider.
 */
public class PostgresSqlDialectProvider implements ISqlDialectProvider {

    @Override
    public DatabaseSystem getDatabaseSystem() {
        return DatabaseSystem.POSTGRESQL;
    }

    /**
     * Gets the dialect.
     *
     * @return the dialect
     */
    @Override
    public ISqlDialect getDialect() {
        return new PostgresSqlDialect();
    }

}
