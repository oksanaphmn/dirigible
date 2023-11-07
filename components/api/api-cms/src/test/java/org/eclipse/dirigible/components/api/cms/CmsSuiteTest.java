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
package org.eclipse.dirigible.components.api.cms;

import org.eclipse.dirigible.components.engine.javascript.service.JavascriptService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

@WithMockUser
@ExtendWith(SpringExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@ComponentScan(basePackages = {"org.eclipse.dirigible.components.*"})
public class CmsSuiteTest {

  @Autowired
  private JavascriptService javascriptService;

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  protected WebApplicationContext wac;

  @Test
  public void executeCMISTest() throws Exception {
    javascriptService.handleRequest("cms-tests", "cmis-create-document.js", null, null, false);
    javascriptService.handleRequest("cms-tests", "cmis-create-folder.js", null, null, false);
    javascriptService.handleRequest("cms-tests", "cmis-get-children.js", null, null, false);
    javascriptService.handleRequest("cms-tests", "cmis-get-root-folder.js", null, null, false);
    javascriptService.handleRequest("cms-tests", "cmis-get-session.js", null, null, false);
  }

  @SpringBootApplication
  static class TestConfiguration {
  }
}
