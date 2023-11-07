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
package org.eclipse.dirigible.database.sql.builders.records;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.eclipse.dirigible.commons.config.Configuration;
import org.eclipse.dirigible.database.sql.SqlFactory;
import org.junit.Test;

/**
 * The Class UpdateTest.
 */
public class UpdateRecordsTest {

	/**
	 * Update simple.
	 */
	@Test
	public void updateSimple() {
		String sql = SqlFactory	.getDefault()
								.update()
								.table("CUSTOMERS")
								.set("FIRST_NAME", "'John'")
								.build();

		assertNotNull(sql);
		assertEquals("UPDATE CUSTOMERS SET FIRST_NAME = 'John'", sql);
	}


	/**
	 * Update simple case sensitive.
	 */
	@Test
	public void updateSimpleCaseSensitive() {
		Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "true");
		try {
			String sql = SqlFactory	.getDefault()
									.update()
									.table("CUSTOMERS")
									.set("FIRST_NAME", "'John'")
									.build();

			assertNotNull(sql);
			assertEquals("UPDATE \"CUSTOMERS\" SET \"FIRST_NAME\" = 'John'", sql);
		} finally {
			Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "false");
		}
	}

	/**
	 * Update values.
	 */
	@Test
	public void updateValues() {
		String sql = SqlFactory	.getDefault()
								.update()
								.table("CUSTOMERS")
								.set("FIRST_NAME", "'John'")
								.set("LAST_NAME", "'Smith'")
								.build();

		assertNotNull(sql);
		assertEquals("UPDATE CUSTOMERS SET FIRST_NAME = 'John', LAST_NAME = 'Smith'", sql);
	}

	/**
	 * Update values case sensitive.
	 */
	@Test
	public void updateValuesCaseSensitive() {
		Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "true");
		try {
			String sql = SqlFactory	.getDefault()
									.update()
									.table("CUSTOMERS")
									.set("FIRST_NAME", "'John'")
									.set("LAST_NAME", "'Smith'")
									.build();

			assertNotNull(sql);
			assertEquals("UPDATE \"CUSTOMERS\" SET \"FIRST_NAME\" = 'John', \"LAST_NAME\" = 'Smith'", sql);
		} finally {
			Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "false");
		}
	}

	/**
	 * Update where.
	 */
	@Test
	public void updateWhere() {
		String sql = SqlFactory	.getDefault()
								.update()
								.table("CUSTOMERS")
								.set("FIRST_NAME", "'John'")
								.set("LAST_NAME", "'Smith'")
								.where("AGE > ?")
								.where("COMPANY = 'SAP'")
								.build();

		assertNotNull(sql);
		assertEquals("UPDATE CUSTOMERS SET FIRST_NAME = 'John', LAST_NAME = 'Smith' WHERE (AGE > ?) AND (COMPANY = 'SAP')", sql);
	}

	/**
	 * Update where case sensitive.
	 */
	@Test
	public void updateWhereCaseSensitive() {
		Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "true");
		try {
			String sql = SqlFactory	.getDefault()
									.update()
									.table("CUSTOMERS")
									.set("FIRST_NAME", "'John'")
									.set("LAST_NAME", "'Smith'")
									.where("AGE > ?")
									.where("COMPANY = 'SAP'")
									.build();

			assertNotNull(sql);
			assertEquals(
					"UPDATE \"CUSTOMERS\" SET \"FIRST_NAME\" = 'John', \"LAST_NAME\" = 'Smith' WHERE (\"AGE\" > ?) AND (\"COMPANY\" = 'SAP')",
					sql);
		} finally {
			Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "false");
		}
	}

	/**
	 * Update where select.
	 */
	@Test
	public void updateWhereSelect() {
		String sql = SqlFactory	.getDefault()
								.update()
								.table("CUSTOMERS")
								.set("FIRST_NAME", "'John'")
								.set("SALARY", SqlFactory	.getDefault()
															.select()
															.column("MAX(SALARY)")
															.from("BENEFITS")
															.build())
								.where("COMPANY = 'SAP'")
								.build();

		assertNotNull(sql);
		assertEquals("UPDATE CUSTOMERS SET FIRST_NAME = 'John', SALARY = SELECT MAX(SALARY) FROM BENEFITS WHERE (COMPANY = 'SAP')", sql);
	}

	/**
	 * Update where select case sensitive.
	 */
	@Test
	public void updateWhereSelectCaseSensitive() {
		Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "true");
		try {
			String sql = SqlFactory	.getDefault()
									.update()
									.table("CUSTOMERS")
									.set("FIRST_NAME", "'John'")
									.set("SALARY", SqlFactory	.getDefault()
																.select()
																.column("MAX(SALARY)")
																.from("BENEFITS")
																.build())
									.where("COMPANY = 'SAP'")
									.build();

			assertNotNull(sql);
			assertEquals(
					"UPDATE \"CUSTOMERS\" SET \"FIRST_NAME\" = 'John', \"SALARY\" = SELECT MAX(\"SALARY\") FROM \"BENEFITS\" WHERE (\"COMPANY\" = 'SAP')",
					sql);
		} finally {
			Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "false");
		}
	}

	/**
	 * Update where expr.
	 */
	@Test
	public void updateWhereExpr() {
		String sql = SqlFactory	.getDefault()
								.update()
								.table("CUSTOMERS")
								.set("FIRST_NAME", "'John'")
								.set("LAST_NAME", "'Smith'")
								.where(SqlFactory	.getDefault()
													.expression()
													.and("PRICE > ?")
													.or("AMOUNT < ?")
													.and("COMPANY = 'SAP'")
													.build())
								.build();

		assertNotNull(sql);
		assertEquals("UPDATE CUSTOMERS SET FIRST_NAME = 'John', LAST_NAME = 'Smith' WHERE (PRICE > ? OR AMOUNT < ? AND COMPANY = 'SAP')",
				sql);
	}

	/**
	 * Update where expr case sensitive.
	 */
	@Test
	public void updateWhereExprCaseSensitive() {
		Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "true");
		try {
			String sql = SqlFactory	.getDefault()
									.update()
									.table("CUSTOMERS")
									.set("FIRST_NAME", "'John'")
									.set("LAST_NAME", "'Smith'")
									.where(SqlFactory	.getDefault()
														.expression()
														.and("PRICE > ?")
														.or("AMOUNT < ?")
														.and("COMPANY = 'SAP'")
														.build())
									.build();

			assertNotNull(sql);
			assertEquals(
					"UPDATE \"CUSTOMERS\" SET \"FIRST_NAME\" = 'John', \"LAST_NAME\" = 'Smith' WHERE (\"PRICE\" > ? OR \"AMOUNT\" < ? AND \"COMPANY\" = 'SAP')",
					sql);
		} finally {
			Configuration.set("DIRIGIBLE_DATABASE_NAMES_CASE_SENSITIVE", "false");
		}
	}
}
