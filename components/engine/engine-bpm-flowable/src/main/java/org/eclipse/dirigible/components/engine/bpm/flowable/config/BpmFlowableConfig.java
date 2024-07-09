/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.engine.bpm.flowable.config;

import org.eclipse.dirigible.components.engine.bpm.BpmProvider;
import org.eclipse.dirigible.components.engine.bpm.flowable.provider.BpmProviderFlowable;
import org.eclipse.dirigible.repository.api.IRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;

/**
 * The Class BpmFlowableConfig.
 */
@Configuration
@EnableAutoConfiguration(exclude = {LiquibaseAutoConfiguration.class, TaskExecutionAutoConfiguration.class})

public class BpmFlowableConfig {

    @Bean("BPM_PROVIDER")
    public BpmProvider getBpmProvider(BpmProviderFlowable bpmProviderFlowable) {
        return bpmProviderFlowable;
    }

    @Bean(destroyMethod = "cleanup")
    BpmProviderFlowable provideBpmProviderFlowable(@Qualifier("SystemDB") DataSource datasource, IRepository repository,
            ApplicationContext applicationContext, DataSourceTransactionManager dataSourceTransactionManager) {
        return new BpmProviderFlowable(datasource, repository, dataSourceTransactionManager, applicationContext);
    }

    @Bean
    DataSourceTransactionManager provideTransactionManager(@Qualifier("SystemDB") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

}
