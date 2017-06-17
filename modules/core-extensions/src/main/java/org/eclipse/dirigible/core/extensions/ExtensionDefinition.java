package org.eclipse.dirigible.core.extensions;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name="DIRIGIBLE_EXTENSIONS")
public class ExtensionDefinition {
	
	@Id
	@Column(name="EXTENSION_LOCATION", columnDefinition="VARCHAR", nullable=false, length=255)
	private String location;
	
	@Column(name="EXTENSION_EXTENSIONPOINT_LOCATION", columnDefinition="VARCHAR", nullable=false, length=255)
	private String extensionPoint;
	
	@Column(name="EXTENSION_DESCRIPTION", columnDefinition="VARCHAR", nullable=false, length=1024)
	private String description;
	
	@Column(name="EXTENSION_CREATED_BY", columnDefinition="VARCHAR", nullable=false, length=32)
	private String createdBy;
	
	@Column(name="EXTENSION_CREATED_AT", columnDefinition="TIMESTAMP", nullable=false)
	private Timestamp createdAt;

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getExtensionPoint() {
		return extensionPoint;
	}

	public void setExtensionPoint(String extensionPoint) {
		this.extensionPoint = extensionPoint;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Timestamp getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}
	
	

}
