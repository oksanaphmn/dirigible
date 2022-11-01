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
package org.eclipse.dirigible.components.jobs.service;

import org.eclipse.dirigible.components.base.artefact.ArtefactService;
import org.eclipse.dirigible.components.jobs.domain.JobLog;
import org.eclipse.dirigible.components.jobs.repository.JobLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * The Class JobLogService.
 */
@Service
@Transactional
public class JobLogService implements ArtefactService<JobLog> {

    /** The job log repository. */
    @Autowired
    private JobLogRepository jobLogRepository;

    /**
     * Gets the all.
     *
     * @return the all
     */
    @Override
    @Transactional(readOnly = true)
    public List<JobLog> getAll() {
        return jobLogRepository.findAll();
    }

    /**
     * Find all.
     *
     * @param pageable the pageable
     * @return the page
     */
    @Override
    @Transactional(readOnly = true)
    public Page<JobLog> findAll(Pageable pageable) {
        return jobLogRepository.findAll(pageable);
    }

    /**
     * Find by id.
     *
     * @param id the id
     * @return the job log
     */
    @Override
    @Transactional(readOnly = true)
    public JobLog findById(Long id) {
        Optional<JobLog> jobLog = jobLogRepository.findById(id);
        if (jobLog.isPresent()) {
            return jobLog.get();
        } else {
            throw new IllegalArgumentException("JobLog with id does not exist: " + id);
        }
    }

    /**
     * Find by name.
     *
     * @param name the name
     * @return the job log
     */
    @Override
    @Transactional(readOnly = true)
    public JobLog findByName(String name) {
        JobLog filter = new JobLog();
        filter.setName(name);
        Example<JobLog> example = Example.of(filter);
        Optional<JobLog> jobLog = jobLogRepository.findOne(example);
        if (jobLog.isPresent()) {
            return jobLog.get();
        } else {
            throw new IllegalArgumentException("JobLog with name does not exist: " + name);
        }
    }

    /**
     * Save.
     *
     * @param jobLog the job log
     * @return the job log
     */
    @Override
    public JobLog save(JobLog jobLog) {
        return jobLogRepository.saveAndFlush(jobLog);
    }

    /**
     * Delete.
     *
     * @param jobLog the job log
     */
    @Override
    public void delete(JobLog jobLog) {
        jobLogRepository.delete(jobLog);
    }

    /**
     * Delete job by name.
     *
     * @param jobLogName the job log name
     */
    public void deleteJobByName(String jobLogName){
        JobLog jobLog = findByName(jobLogName);
        delete(jobLog);
    }

    /**
     * Job triggered.
     *
     * @param name the name
     * @param handler the handler
     * @return the job log definition
     */
    public JobLog jobTriggered(String name, String handler) {
        JobLog jobLog = new JobLog();
        jobLog.setName(name);
        jobLog.setHandler(handler);
        jobLog.setStatus(JobLog.JOB_LOG_STATUS_TRIGGRED);
        jobLog.setTriggeredAt(new Timestamp(new Date().getTime()));
        save(jobLog);
        return jobLog;
    }

    /**
     * Job logged.
     *
     * @param name the name
     * @param handler the handler
     * @param message the message
     * @param severity the severity
     * @return the job log definition
     */
    private JobLog jobLogged(String name, String handler, String message, short severity){
        JobLog jobLog = new JobLog();
        jobLog.setName(name);
        jobLog.setHandler(handler);
        jobLog.setMessage(message);
        jobLog.setStatus(severity);
        jobLog.setTriggeredAt(new Timestamp(new java.util.Date().getTime()));
        save(jobLog);
        return jobLog;
    }

    /**
     * Job logged.
     *
     * @param name the name
     * @param handler the handler
     * @param message the message
     * @return the job log definition
     */
    public JobLog jobLogged(String name, String handler, String message) {
        return jobLogged(name, handler, message, JobLog.JOB_LOG_STATUS_LOGGED);
    }

    /**
     * Job logged error.
     *
     * @param name the name
     * @param handler the handler
     * @param message the message
     * @return the job log definition
     */
    public JobLog jobLoggedError(String name, String handler, String message) {
        return jobLogged(name, handler, message, JobLog.JOB_LOG_STATUS_ERROR);
    }

    /**
     * Job logged warning.
     *
     * @param name the name
     * @param handler the handler
     * @param message the message
     * @return the job log definition
     */
    public JobLog jobLoggedWarning(String name, String handler, String message) {
        return jobLogged(name, handler, message, JobLog.JOB_LOG_STATUS_WARN);
    }

    /**
     * Job logged info.
     *
     * @param name the name
     * @param handler the handler
     * @param message the message
     * @return the job log definition
     */
    public JobLog jobLoggedInfo(String name, String handler, String message) {
        return jobLogged(name, handler, message, JobLog.JOB_LOG_STATUS_INFO);
    }

    /**
     * Job finished.
     *
     * @param name the name
     * @param handler the handler
     * @param triggeredId the triggered id
     * @param triggeredAt the triggered at
     * @return the job log definition
     */
    public JobLog jobFinished(String name, String handler, long triggeredId, Date triggeredAt) {
        JobLog jobLog = new JobLog();
        jobLog.setName(name);
        jobLog.setHandler(handler);
        jobLog.setStatus(JobLog.JOB_LOG_STATUS_FINISHED);
        jobLog.setTriggeredId(triggeredId);
        jobLog.setTriggeredAt(new Timestamp(triggeredAt.getTime()));
        jobLog.setFinishedAt(new Timestamp(new java.util.Date().getTime()));
        save(jobLog);
        return jobLog;
    }

    /**
     * Job failed.
     *
     * @param name the name
     * @param handler the handler
     * @param triggeredId the triggered id
     * @param triggeredAt the triggered at
     * @param message the message
     * @return the job log definition
     */
    public JobLog jobFailed(String name, String handler, long triggeredId, Date triggeredAt, String message){
        JobLog jobLog = new JobLog();
        jobLog.setName(name);
        jobLog.setHandler(handler);
        jobLog.setStatus(JobLog.JOB_LOG_STATUS_FAILED);
        jobLog.setTriggeredId(triggeredId);
        jobLog.setTriggeredAt(new Timestamp(triggeredAt.getTime()));
        jobLog.setFinishedAt(new Timestamp(new java.util.Date().getTime()));
        jobLog.setMessage(message);
        save(jobLog);
        return jobLog;
    }
}
