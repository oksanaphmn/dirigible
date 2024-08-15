/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.data.sources.manager;

import org.eclipse.dirigible.components.data.sources.config.DefaultDataSourceName;
import org.eclipse.dirigible.components.data.sources.config.SystemDataSourceName;
import org.eclipse.dirigible.components.data.sources.domain.DataSource;
import org.eclipse.dirigible.components.data.sources.service.CustomDataSourcesService;
import org.eclipse.dirigible.components.data.sources.service.DataSourceService;
import org.eclipse.dirigible.components.database.DirigibleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * The Class DataSourcesManager.
 */
@Component
public class DataSourcesManager {

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(DataSourcesManager.class);

    /** The datasource service. */
    private final DataSourceService datasourceService;

    /** The custom data sources service. */
    private final CustomDataSourcesService customDataSourcesService;

    /** The data source initializer. */
    private final DataSourceInitializer dataSourceInitializer;

    /** The tenant data source name manager. */
    private final TenantDataSourceNameManager tenantDataSourceNameManager;

    /** The default data source name. */
    private final String defaultDataSourceName;

    /** The system data source name. */
    private final String systemDataSourceName;

    /**
     * Instantiates a new data sources manager.
     *
     * @param datasourceService the datasource service
     * @param customDataSourcesService the custom data sources service
     * @param dataSourceInitializer the data source initializer
     * @param tenantDataSourceNameManager the tenant data source name manager
     * @param defaultDataSourceName the default data source name
     * @param systemDataSourceName the system data source name
     */
    @Autowired
    public DataSourcesManager(DataSourceService datasourceService, CustomDataSourcesService customDataSourcesService,
            DataSourceInitializer dataSourceInitializer, TenantDataSourceNameManager tenantDataSourceNameManager,
            @DefaultDataSourceName String defaultDataSourceName, @SystemDataSourceName String systemDataSourceName) {
        this.datasourceService = datasourceService;
        this.customDataSourcesService = customDataSourcesService;
        this.dataSourceInitializer = dataSourceInitializer;
        this.tenantDataSourceNameManager = tenantDataSourceNameManager;
        this.defaultDataSourceName = defaultDataSourceName;
        this.systemDataSourceName = systemDataSourceName;
        this.customDataSourcesService.initialize();
    }

    /**
     * Gets the default data source.
     *
     * @return the default data source
     */
    public DirigibleDataSource getDefaultDataSource() {
        return getDataSource(defaultDataSourceName);
    }

    /**
     * Gets the data source.
     *
     * @param name the name
     * @return the data source
     */
    public DirigibleDataSource getDataSource(String name) {
        return dataSourceInitializer.isInitialized(name) ? dataSourceInitializer.getInitializedDataSource(name)
                : dataSourceInitializer.initialize(getDataSourceDefinition(name));
    }

    /**
     * Gets the data source definition.
     *
     * @param name the name
     * @return the data source definition
     */
    public DataSource getDataSourceDefinition(String name) {
        String dataSourceName = tenantDataSourceNameManager.getTenantDataSourceName(name);
        try {
            return datasourceService.findByName(dataSourceName);
        } catch (Exception ex) {
            if (Objects.equals(defaultDataSourceName, dataSourceName)) {
                logger.error("DataSource cannot be initialized, hence fail over database is started as a backup - " + dataSourceName, ex);
                return new DataSource(dataSourceName, dataSourceName, dataSourceName, "org.h2.Driver", "jdbc:h2:~/DefaultDBFailOver", "sa",
                        "");
            }
            throw ex;
        }
    }

    /**
     * Gets the system data source.
     *
     * @return the system data source
     */
    public DirigibleDataSource getSystemDataSource() {
        return getDataSource(systemDataSourceName);
    }

}
