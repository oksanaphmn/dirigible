/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.tests;

import org.eclipse.dirigible.commons.config.DirigibleConfig;
import org.eclipse.dirigible.tests.framework.Browser;
import org.eclipse.dirigible.tests.framework.HtmlAttribute;
import org.eclipse.dirigible.tests.framework.HtmlElementType;
import org.eclipse.dirigible.tests.restassured.RestAssuredExecutor;
import org.eclipse.dirigible.tests.util.SleepUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.containsString;

@Lazy
@Component
public class IDE {
    private static final Logger LOGGER = LoggerFactory.getLogger(IDE.class);

    private static final String LOGIN_PAGE_TITLE = "Please sign in";
    private static final String ROOT_PATH = "/";
    private static final String USERNAME_FIELD_ID = "username";
    private static final String PASSWORD_FIELD_ID = "password";
    private static final String SUBMIT_TYPE = "submit";
    private static final String SIGN_IN_BUTTON_TEXT = "Sign in";

    private final Browser browser;
    private final RestAssuredExecutor restAssuredExecutor;

    private final String username;
    private final String password;

    @Autowired
    public IDE(Browser browser, RestAssuredExecutor restAssuredExecutor) {
        this(browser, restAssuredExecutor, DirigibleConfig.BASIC_ADMIN_USERNAME.getFromBase64Value(),
                DirigibleConfig.BASIC_ADMIN_PASS.getFromBase64Value());
    }

    public IDE(Browser browser, RestAssuredExecutor restAssuredExecutor, String username, String password) {
        this.browser = browser;
        this.restAssuredExecutor = restAssuredExecutor;
        this.username = username;
        this.password = password;
    }

    public void openHomePage() {
        browser.openPath(ROOT_PATH);
        login(false);

        SleepUtil.sleepMillis(500);
        browser.reload();
    }

    public void login(boolean forceLogin) {
        if (!forceLogin && !isLoginPageOpened()) {
            LOGGER.info("Already logged in");
            return;
        }
        LOGGER.info("Logging...");
        browser.enterTextInElementByAttributePattern(HtmlElementType.INPUT, HtmlAttribute.ID, USERNAME_FIELD_ID, username);
        browser.enterTextInElementByAttributePattern(HtmlElementType.INPUT, HtmlAttribute.ID, PASSWORD_FIELD_ID, password);
        browser.clickElementByAttributePatternAndText(HtmlElementType.BUTTON, HtmlAttribute.TYPE, SUBMIT_TYPE, SIGN_IN_BUTTON_TEXT);
    }

    private boolean isLoginPageOpened() {
        String pageTitle = browser.getPageTitle();
        return LOGIN_PAGE_TITLE.equals(pageTitle);
    }

    public void login() {
        login(true);
    }

    public Workbench openWorkbench() {
        browser.clickElementByAttributeValue(HtmlElementType.ANCHOR, HtmlAttribute.TITLE, "Workbench");
        return new Workbench(browser);
    }

    public void assertPublishingProjectMessage(String projectName) {
        String publishingMessage = "Publishing '/" + projectName + "'...";
        assertStatusBarMessage(publishingMessage);
    }

    public void assertStatusBarMessage(String expectedMessage) {
        browser.assertElementExistsByTypeAndTextPattern(HtmlElementType.SPAN, expectedMessage);
    }

    public void assertPublishedProjectMessage(String projectName) {
        String publishedMessage = "Published '/" + projectName + "'";
        assertStatusBarMessage(publishedMessage);
    }

    public void assertJSHttpResponse(String projectName, String fileRelativePath, int expectedStatusCode, String expectedBody) {
        String path = "/services/js/" + projectName + "/" + fileRelativePath;
        restAssuredExecutor.execute( //
                () -> given().when()
                             .get(path)
                             .then()
                             .statusCode(expectedStatusCode)
                             .body(containsString(expectedBody)),
                username, password);
    }

    public void assertPublishedAllProjectsMessage() {
        assertStatusBarMessage("Published all projects in 'workspace'");
    }

    public void openPath(String path) {
        browser.openPath(path);
        login(true);
    }
}
