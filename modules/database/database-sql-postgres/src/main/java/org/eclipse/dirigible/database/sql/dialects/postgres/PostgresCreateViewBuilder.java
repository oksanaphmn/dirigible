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

import org.eclipse.dirigible.database.sql.ISqlDialect;
import org.eclipse.dirigible.database.sql.builders.view.CreateViewBuilder;

/**
 * The PostgreSQL Create View Builder.
 */
public class PostgresCreateViewBuilder extends CreateViewBuilder {

    /** The values. */
    private String values = null;

    /**
     * Instantiates a new PostgreSQL create view builder.
     *
     * @param dialect the dialect
     * @param view the view
     */
    public PostgresCreateViewBuilder(ISqlDialect dialect, String view) {
        super(dialect, view);
    }

    /**
     * Column.
     *
     * @param name the name
     * @return the postgres create view builder
     */
    @Override
    public PostgresCreateViewBuilder column(String name) {
        super.getColumns().add(name);
        return this;
    }

    /**
     * As select.
     *
     * @param select the select
     * @return the postgres create view builder
     */
    @Override
    public PostgresCreateViewBuilder asSelect(String select) {

        if (this.values != null) {
            throw new IllegalStateException("Create VIEW can use either AS SELECT or AS VALUES, but not both.");
        }
        setSelect(select);
        return this;
    }

    /**
     * As values.
     *
     * @param values the values
     * @return the PostgreSQL create view builder
     */
    public PostgresCreateViewBuilder asValues(String values) {
        if (getSelect() != null) {
            throw new IllegalStateException("Create VIEW can use either AS SELECT or AS VALUES, but not both.");
        }
        this.values = values;
        return this;
    }

    /**
     * Generate.
     *
     * @return the string
     */
    @Override
    public String generate() {

        StringBuilder sql = new StringBuilder();

        // CREATE
        generateCreate(sql);

        // VIEW
        generateView(sql);

        // COLUMNS
        generateColumns(sql);

        // SELECT or VALUES
        if (getSelect() != null) {
            generateAsSelect(sql);
        } else if (this.values != null) {
            generateAsValues(sql);
        } else {
            throw new IllegalStateException("Create VIEW must use either AS SELECT or AS VALUES.");
        }

        return sql.toString();
    }

    /**
     * Generate as values.
     *
     * @param sql the sql
     */
    protected void generateAsValues(StringBuilder sql) {
        sql.append(SPACE)
           .append(KEYWORD_AS)
           .append(SPACE)
           .append(KEYWORD_VALUES)
           .append(SPACE)
           .append(this.values);
    }

}
