/*
 * Copyright (c) 2022 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.security.service;

import org.eclipse.dirigible.components.base.artefact.ArtefactService;
import org.eclipse.dirigible.components.security.domain.Role;
import org.eclipse.dirigible.components.security.repository.RoleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


/**
 * The Class SecurityRoleService.
 */

@Service
@Transactional
public class SecurityRoleService implements ArtefactService<Role> {

    /**
     * The security role repository.
     */
    @Autowired
    private RoleRepository securityRoleRepository;

    /**
     * Gets the all.
     *
     * @return the all
     */
    @Override
    @Transactional(readOnly = true)
    public List<Role> getAll() {
        return securityRoleRepository.findAll();
    }

    /**
     * Find all.
     *
     * @param pageable the pageable
     * @return the page
     */
    @Override
    @Transactional(readOnly = true)
    public Page<Role> findAll(Pageable pageable) {
        return securityRoleRepository.findAll(pageable);
    }

    /**
     * Find by id.
     *
     * @param id the id
     * @return the security role
     */
    @Override
    @Transactional(readOnly = true)
    public Role findById(Long id) {
        Optional<Role> securityRole = securityRoleRepository.findById(id);
        if (securityRole.isPresent()) {
            return securityRole.get();
        } else {
            throw new IllegalArgumentException("SecurityRole with id does not exist: " + id);
        }
    }

    /**
     * Find by name.
     *
     * @param name the name
     * @return the security role
     */
    @Override
    @Transactional(readOnly = true)
    public Role findByName(String name) {
        Role filter = new Role();
        filter.setName(name);
        Example<Role> example = Example.of(filter);
        Optional<Role> securityRole = securityRoleRepository.findOne(example);
        if (securityRole.isPresent()) {
            return securityRole.get();
        } else {
            throw new IllegalArgumentException("SecurityRole with name does not exist: " + name);
        }
    }

    /**
     * Save.
     *
     * @param securityRole the security role
     * @return the security role
     */
    @Override
    public Role save(Role securityRole) {
        return securityRoleRepository.saveAndFlush(securityRole);
    }

    /**
     * Delete.
     *
     * @param securityRole the security role
     */
    @Override
    public void delete(Role securityRole) {
        securityRoleRepository.delete(securityRole);
    }
}
