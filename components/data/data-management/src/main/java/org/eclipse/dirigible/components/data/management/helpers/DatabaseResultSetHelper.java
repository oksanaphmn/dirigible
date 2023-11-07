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
package org.eclipse.dirigible.components.data.management.helpers;

import java.io.OutputStream;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.eclipse.dirigible.components.data.management.format.ResultSetCsvWriter;
import org.eclipse.dirigible.components.data.management.format.ResultSetJsonWriter;
import org.eclipse.dirigible.components.data.management.format.ResultSetMonospacedWriter;

/**
 * The Database Result SetHelper.
 */
public class DatabaseResultSetHelper {

  /**
   * Prints the provided ResultSet to the {@link ResultSetMonospacedWriter} writer.
   *
   * @param resultSet the result set
   * @param limited the limited
   * @param output the output
   * @throws Exception the exception
   */
  public static void print(ResultSet resultSet, boolean limited, OutputStream output) throws Exception {
    ResultSetMonospacedWriter writer = new ResultSetMonospacedWriter();
    writer.setLimited(limited);
    writer.write(resultSet, output);
    output.flush();
  }

  /**
   * Prints the provided ResultSet to the {@link ResultSetJsonWriter} writer.
   *
   * @param resultSet the result set
   * @param limited the limited
   * @param stringify the stringified flag
   * @param output the output
   * @throws Exception the exception
   */
  public static void toJson(ResultSet resultSet, boolean limited, boolean stringify, OutputStream output) throws Exception {
    ResultSetJsonWriter writer = new ResultSetJsonWriter();
    writer.setLimited(limited);
    writer.setStringified(stringify);
    writer.write(resultSet, output);
    output.flush();
  }

  /**
   * Prints the provided ResultSet to the {@link ResultSetCsvWriter} writer.
   *
   * @param resultSet the result set
   * @param limited the limited
   * @param stringify the stringified flag
   * @param output the output
   * @throws Exception the exception
   */
  public static void toCsv(ResultSet resultSet, boolean limited, boolean stringify, OutputStream output) throws Exception {
    ResultSetCsvWriter writer = new ResultSetCsvWriter();
    writer.setLimited(limited);
    writer.setStringified(stringify);
    writer.write(resultSet, output);
    output.flush();
  }

}
