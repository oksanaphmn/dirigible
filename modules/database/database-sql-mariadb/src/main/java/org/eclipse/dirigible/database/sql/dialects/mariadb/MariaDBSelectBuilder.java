/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.database.sql.dialects.mariadb;

import org.eclipse.dirigible.database.sql.ISqlDialect;
import org.eclipse.dirigible.database.sql.builders.records.SelectBuilder;

public class MariaDBSelectBuilder extends SelectBuilder {

    public MariaDBSelectBuilder(ISqlDialect dialect) {
        super(dialect);
    }

    @Override
    protected String encapsulateWhere(String where) {
        return encapsulateMany(where, getEscapeSymbol());
    }

}
