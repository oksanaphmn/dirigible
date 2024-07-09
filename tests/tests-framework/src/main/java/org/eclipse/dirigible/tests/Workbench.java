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

import org.eclipse.dirigible.tests.framework.Browser;
import org.eclipse.dirigible.tests.framework.HtmlAttribute;
import org.eclipse.dirigible.tests.framework.HtmlElementType;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Lazy
@Component
public class Workbench {

    private final Browser browser;

    public Workbench(Browser browser) {
        this.browser = browser;
    }

    public void expandProject(String projectName) {
        browser.doubleClickOnElementContainingText(HtmlElementType.ANCHOR, projectName);
    }

    public void openFile(String fileName) {
        browser.doubleClickOnElementContainingText(HtmlElementType.ANCHOR, fileName);
    }

    public void publishAll() {
        clickPublishAll();
        browser.assertElementExistsByTypeAndTextPattern(HtmlElementType.SPAN, "Published all projects in");
    }

    public void clickPublishAll() {
        browser.clickElementByAttributePattern(HtmlElementType.BUTTON, HtmlAttribute.TITLE, "Publish all");
    }

    public WelcomeView openWelcomeView() {
        focusOnOpenedFile("Welcome");
        return new WelcomeView(browser);
    }

    public WelcomeView focusOnOpenedFile(String fileName) {
        browser.clickOnElementContainingText(HtmlElementType.ANCHOR, fileName);
        return new WelcomeView(browser);
    }

    public FormView getFormView() {
        return new FormView(browser);
    }
}
