package org.eclipse.dirigible.engine.web.service;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.dirigible.commons.api.helpers.ContentTypeHelper;
import org.eclipse.dirigible.commons.api.service.IRestService;
import org.eclipse.dirigible.engine.web.processor.WebEngineProcessor;
import org.eclipse.dirigible.repository.api.IRepositoryStructure;
import org.eclipse.dirigible.repository.api.IResource;
import org.eclipse.dirigible.repository.api.RepositoryNotFoundException;

/**
 * Front facing REST service serving the raw web content from the registry/public space
 */
@Singleton
public class WebEngineRestService implements IRestService {
	
	@Inject
	private WebEngineProcessor processor;
	
	@GET
	@Path("/web/{path:.*}")
	public Response getResource(@PathParam("path") String path) {
		if ("".equals(path.trim()) || path.trim().endsWith(IRepositoryStructure.SEPARATOR)) {
			return Response.status(Status.FORBIDDEN).entity("Listing of web folders is forbidden.").build();
		}
		if (processor.existResource(path)) {
			IResource resource = processor.getResource(path);
			if (resource.isBinary()) {
				return Response.ok().entity(resource.getContent()).type(resource.getContentType()).build();
			}
			return Response.ok(new String(resource.getContent())).type(resource.getContentType()).build();
		} else {
			try {
				byte[] content = processor.getResourceContent(path);
				if (content != null) {
					String contentType = ContentTypeHelper.getContentType(ContentTypeHelper.getExtension(path));
					return Response.ok().entity(content).type(contentType).build();
				}
			} catch (RepositoryNotFoundException e) {
				return Response.status(Status.NOT_FOUND).entity("Resource not found: " + path).build();
			}
		}
		
		return Response.status(Status.NOT_FOUND).build();
	}

	@Override
	public Class<? extends IRestService> getType() {
		return WebEngineRestService.class;
	}
}
