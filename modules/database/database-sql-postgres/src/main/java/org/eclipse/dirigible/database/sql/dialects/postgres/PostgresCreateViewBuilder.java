/*
 * Copyright (c) 2023 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Eclipse Dirigible
 * contributors SPDX-License-Identifier: EPL-2.0
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
  /*
   * (non-Javadoc)
   *
   * @see org.eclipse.dirigible.database.sql.builders.view.CreateViewBuilder#column(java.lang.String)
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
  /*
   * (non-Javadoc)
   *
   * @see
   * org.eclipse.dirigible.database.sql.builders.view.CreateViewBuilder#asSelect(java.lang.String)
   */
  @Override
  public PostgresCreateViewBuilder asSelect(String select) {

    if (this.values != null) {
      throw new IllegalStateException("Create VIEW can use either AS SELECT or AS VALUES, but not both.");
    }
    setSelect(this.getSelectColumnsEscapingRemoved(select));
    return this;
  }

  /**
   * Gets the select columns escaping removed.
   *
   * @param select the select
   * @return the select columns escaping removed
   */
  private String getSelectColumnsEscapingRemoved(String select) {
    StringBuilder builder = new StringBuilder(select);
    int midSqlStartIndex = builder.indexOf("FROM") - 1;
    boolean isONClauseMissing = builder.indexOf("ON") - 1 < 0;
    int midSqlEndIndex = (isONClauseMissing) ? midSqlStartIndex : (builder.indexOf("ON") - 1);
    String preFROMsql = builder.substring(0, midSqlStartIndex)
                               .replaceAll("\"", "")
        + " ";
    String midSql = (isONClauseMissing) ? "" : (builder.substring(midSqlStartIndex, midSqlEndIndex) + " ");
    String postONsql = builder.substring(midSqlEndIndex + 1)
                              .replaceAll("\"", "");
    return preFROMsql + midSql + postONsql;
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
  /*
   * (non-Javadoc)
   *
   * @see org.eclipse.dirigible.database.sql.builders.view.CreateViewBuilder#generate()
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
