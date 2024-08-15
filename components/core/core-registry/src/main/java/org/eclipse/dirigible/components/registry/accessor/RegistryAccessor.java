/*
 * Copyright (c) 2024 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.registry.accessor;

import org.eclipse.dirigible.repository.api.IRepository;
import org.eclipse.dirigible.repository.api.IRepositoryStructure;
import org.eclipse.dirigible.repository.api.IResource;
import org.eclipse.dirigible.repository.api.RepositoryException;
import org.eclipse.dirigible.repository.api.RepositoryNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * The Class RegistryAccessor.
 */
@Component
public class RegistryAccessor {

    /**
     * The Constant logger.
     */
    private static final Logger logger = LoggerFactory.getLogger(RegistryAccessor.class);

    /** The repository. */
    private IRepository repository;

    /**
     * Instantiates a new registry accessor.
     *
     * @param repository the repository
     */
    @Autowired
    public RegistryAccessor(IRepository repository) {
        this.repository = repository;
    }

    /**
     * Gets the repository.
     *
     * @return the repository
     */
    public IRepository getRepository() {
        return repository;
    }


    /**
     * Registry content.
     *
     * @param templateLocation the template location
     * @param defaultLocation the default location
     * @return the byte[] template
     */
    public byte[] getRegistryContent(String templateLocation, String defaultLocation) {
        byte[] template = getRegistryContent(templateLocation);
        if (template == null) {
            template = getRegistryContent(defaultLocation);
            if (template == null) {
                if (logger.isErrorEnabled()) {
                    logger.error("Template for the e-mail has not been set nor the default one is available");
                }
                return null;
            }
        }
        return template;
    }

    /**
     * Gets the registry content.
     *
     * @param path the path
     * @return the registry content
     */
    public byte[] getRegistryContent(String path) {
        try {
            return getResourceContent(IRepositoryStructure.PATH_REGISTRY_PUBLIC, path);
        } catch (RepositoryException e) {
            return null;
        }
    }

    /**
     * Gets the resource content.
     *
     * @param root the root
     * @param module the module
     * @return the resource content
     * @throws RepositoryException the repository exception
     */
    public byte[] getResourceContent(String root, String module) throws RepositoryException {
        return getResourceContent(root, module, null);
    }

    /**
     * Gets the resource content.
     *
     * @param root the root
     * @param module the module
     * @param extension the extension
     * @return the resource content
     * @throws RepositoryException the repository exception
     */
    public byte[] getResourceContent(String root, String module, String extension) throws RepositoryException {

        byte[] result = null;

        if ((module == null) || "".equals(module.trim())) {
            throw new RepositoryException("Module name cannot be empty or null.");
        }
        if (module.trim()
                  .endsWith(IRepositoryStructure.SEPARATOR)) {
            throw new RepositoryException("Module name cannot point to a collection.");
        }

        // try from repository
        result = tryFromRepositoryLocation(root, module, extension);
        // if (result == null) {
        // // try from the classloader - dirigible
        // result = tryFromDirigibleLocation(module, extension);
        // if (result == null) {
        // // try from the classloader - webjars
        // result = tryFromWebJarsLocation(module, extension);
        // }
        // }

        if (result != null) {
            return result;
        }

        String repositoryPath = createResourcePath(root, module, extension);
        final String logMsg = String.format("There is no resource at the specified path: %s", repositoryPath);
        if (logger.isErrorEnabled()) {
            logger.error(logMsg);
        }
        throw new RepositoryNotFoundException(logMsg);
    }

    /**
     * Try from repository location.
     *
     * @param root the root
     * @param module the module
     * @param extension the extension
     * @return the byte[]
     */
    private byte[] tryFromRepositoryLocation(String root, String module, String extension) {
        byte[] result = null;
        String repositoryPath = createResourcePath(root, module, extension);
        final IResource resource = repository.getResource(repositoryPath);
        if (resource.exists()) {
            result = resource.getContent();
        }
        return result;
    }

    // /**
    // * Try from dirigible location.
    // *
    // * @param module the module
    // * @param extension the extension
    // * @return the byte[]
    // */
    // private byte[] tryFromDirigibleLocation(String module, String extension) {
    // return tryFromClassloaderLocation(module, extension, LOCATION_META_INF_DIRIGIBLE);
    // }
    //
    // /**
    // * Try from web jars location.
    // *
    // * @param module the module
    // * @param extension the extension
    // * @return the byte[]
    // */
    // private byte[] tryFromWebJarsLocation(String module, String extension) {
    // return tryFromClassloaderLocation(module, extension, LOCATION_META_INF_WEBJARS);
    // }
    //
    // /**
    // * Try from classloader location.
    // *
    // * @param module the module
    // * @param extension the extension
    // * @param path the path
    // * @return the byte[]
    // */
    // private byte[] tryFromClassloaderLocation(String module, String extension, String path) {
    // byte[] result = null;
    // try {
    // String prefix = Character.toString(module.charAt(0)).equals(IRepository.SEPARATOR) ? "" :
    // IRepository.SEPARATOR;
    // String location = prefix + module + (extension != null ? extension : "");
    // byte[] content = PREDELIVERED.get(location);
    // if (content != null) {
    // return content;
    // }
    // InputStream bundled = RegistryAccessor.class.getResourceAsStream(path + location);
    // try {
    // if (bundled != null) {
    // content = IOUtils.toByteArray(bundled);
    // PREDELIVERED.put(location, content);
    // result = content;
    // }
    // } finally {
    // if (bundled != null) {
    // bundled.close();
    // }
    // }
    // } catch (IOException e) {
    // throw new RepositoryException(e);
    // }
    // return result;
    // }

    /**
     * Creates the resource path.
     *
     * @param root the root
     * @param module the module
     * @param extension the extension
     * @return the string
     */
    private String createResourcePath(String root, String module, String extension) {
        StringBuilder buff = new StringBuilder().append(root);
        if (!Character.toString(module.charAt(0))
                      .equals(IRepository.SEPARATOR)) {
            buff.append(IRepository.SEPARATOR);
        }
        buff.append(module);
        if (extension != null) {
            buff.append(extension);
        }
        String resourcePath = buff.toString();
        return resourcePath;
    }

    // /**
    // * Gets the loaded predelivered content.
    // *
    // * @param location the location
    // * @return the loaded predelivered content
    // */
    // protected byte[] getLoadedPredeliveredContent(String location) {
    // return PREDELIVERED.get(location);
    // }

    /**
     * Exist resource.
     *
     * @param path the path
     * @return true, if successful
     * @throws RepositoryException the repository exception
     */
    public boolean existResource(String path) throws RepositoryException {
        return existResource(path, null);
    }

    /**
     * Exist resource.
     *
     * @param path the path
     * @param extension the extension
     * @return true, if successful
     * @throws RepositoryException the repository exception
     */
    public boolean existResource(String path, String extension) throws RepositoryException {
        String repositoryPath = createResourcePath(IRepositoryStructure.PATH_REGISTRY_PUBLIC, path, extension);
        final IResource resource = repository.getResource(repositoryPath);
        return resource.exists();
    }

    /**
     * Gets the resource.
     *
     * @param module the module
     * @return the resource
     * @throws RepositoryException the repository exception
     */
    public IResource getResource(String module) throws RepositoryException {
        return getResource(module, null);
    }

    /**
     * Gets the resource.
     *
     * @param module the module
     * @param extension the extension
     * @return the resource
     * @throws RepositoryException the repository exception
     */
    public IResource getResource(String module, String extension) throws RepositoryException {
        String repositoryPath = createResourcePath(IRepositoryStructure.PATH_REGISTRY_PUBLIC, module, extension);
        final IResource resource = repository.getResource(repositoryPath);
        if (resource.exists()) {
            return resource;
        }

        final String logMsg = String.format("There is no collection [%s] at the specified path: %s", resource.getName(), repositoryPath);
        if (logger.isErrorEnabled()) {
            logger.error(logMsg);
        }
        throw new RepositoryException(logMsg);
    }
}
