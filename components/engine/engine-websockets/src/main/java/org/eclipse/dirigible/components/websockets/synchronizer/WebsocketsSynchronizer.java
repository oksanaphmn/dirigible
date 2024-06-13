/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.websockets.synchronizer;

import org.apache.commons.io.FilenameUtils;
import org.eclipse.dirigible.commons.config.Configuration;
import org.eclipse.dirigible.components.base.artefact.ArtefactLifecycle;
import org.eclipse.dirigible.components.base.artefact.ArtefactPhase;
import org.eclipse.dirigible.components.base.artefact.ArtefactService;
import org.eclipse.dirigible.components.base.artefact.topology.TopologyWrapper;
import org.eclipse.dirigible.components.base.helpers.JsonHelper;
import org.eclipse.dirigible.components.base.synchronizer.BaseSynchronizer;
import org.eclipse.dirigible.components.base.synchronizer.SynchronizerCallback;
import org.eclipse.dirigible.components.base.synchronizer.SynchronizersOrder;
import org.eclipse.dirigible.components.websockets.domain.Websocket;
import org.eclipse.dirigible.components.websockets.service.WebsocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.List;

/**
 * The Class WebsocketsSynchronizer.
 */
@Component
@Order(SynchronizersOrder.WEBSOCKET)
public class WebsocketsSynchronizer extends BaseSynchronizer<Websocket, Long> {

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketsSynchronizer.class);

    /** The Constant FILE_EXTENSION_WEBSOCKET. */
    private static final String FILE_EXTENSION_WEBSOCKET = ".websocket";

    /** The websocket service. */
    @Autowired
    private WebsocketService websocketService;

    /** The callback. */
    private SynchronizerCallback callback;

    /**
     * Checks if is accepted.
     *
     * @param type the type
     * @return true, if is accepted
     */
    @Override
    public boolean isAccepted(String type) {
        return Websocket.ARTEFACT_TYPE.equals(type);
    }

    /**
     * Load.
     *
     * @param location the location
     * @param content the content
     * @return the list
     * @throws ParseException the parse exception
     */
    @Override
    public List<Websocket> parse(String location, byte[] content) throws ParseException {
        Websocket websocket = JsonHelper.fromJson(new String(content, StandardCharsets.UTF_8), Websocket.class);
        Configuration.configureObject(websocket);
        websocket.setLocation(location);
        websocket.setName(FilenameUtils.getBaseName(location));
        websocket.setType(Websocket.ARTEFACT_TYPE);
        websocket.updateKey();
        try {
            Websocket maybe = getService().findByKey(websocket.getKey());
            if (maybe != null) {
                websocket.setId(maybe.getId());
            }
            websocket = getService().save(websocket);
        } catch (Exception e) {
            if (logger.isErrorEnabled()) {
                logger.error(e.getMessage(), e);
                logger.error("websocket: {}", websocket);
                logger.error("content: {}", new String(content));
            }
            throw new ParseException(e.getMessage(), 0);
        }
        return List.of(websocket);
    }

    /**
     * Gets the service.
     *
     * @return the service
     */
    @Override
    public ArtefactService<Websocket, Long> getService() {
        return websocketService;
    }

    /**
     * Retrieve.
     *
     * @param location the location
     * @return the list
     */
    @Override
    public List<Websocket> retrieve(String location) {
        return getService().getAll();
    }

    /**
     * Sets the status.
     *
     * @param artefact the artefact
     * @param lifecycle the lifecycle
     * @param error the error
     */
    @Override
    public void setStatus(Websocket artefact, ArtefactLifecycle lifecycle, String error) {
        artefact.setLifecycle(lifecycle);
        artefact.setError(error);
        getService().save(artefact);
    }

    /**
     * Complete.
     *
     * @param wrapper the wrapper
     * @param flow the flow
     * @return true, if successful
     */
    @Override
    protected boolean completeImpl(TopologyWrapper<Websocket> wrapper, ArtefactPhase flow) {
        callback.registerState(this, wrapper, ArtefactLifecycle.CREATED);
        return true;
    }

    /**
     * Cleanup.
     *
     * @param websocket the websocket
     */
    @Override
    public void cleanupImpl(Websocket websocket) {
        try {
            getService().delete(websocket);
        } catch (Exception e) {
            callback.addError(e.getMessage());
            callback.registerState(this, websocket, ArtefactLifecycle.DELETED, e);
        }
    }

    /**
     * Sets the callback.
     *
     * @param callback the new callback
     */
    @Override
    public void setCallback(SynchronizerCallback callback) {
        this.callback = callback;
    }

    /**
     * Gets the file extension.
     *
     * @return the file extension
     */
    @Override
    public String getFileExtension() {
        return FILE_EXTENSION_WEBSOCKET;
    }

    /**
     * Gets the artefact type.
     *
     * @return the artefact type
     */
    @Override
    public String getArtefactType() {
        return Websocket.ARTEFACT_TYPE;
    }
}
