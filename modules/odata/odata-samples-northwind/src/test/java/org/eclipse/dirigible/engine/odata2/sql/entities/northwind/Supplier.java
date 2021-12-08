package org.eclipse.dirigible.engine.odata2.sql.entities.northwind;

import org.apache.olingo.odata2.api.annotation.edm.EdmEntitySet;
import org.apache.olingo.odata2.api.annotation.edm.EdmEntityType;
import org.apache.olingo.odata2.api.annotation.edm.EdmFacets;
import org.apache.olingo.odata2.api.annotation.edm.EdmKey;
import org.apache.olingo.odata2.api.annotation.edm.EdmProperty;

@EdmEntityType(name = "Supplier")
@EdmEntitySet(name = "Supplier", container = "NorthwindEntities")
public class Supplier {

	@EdmKey
    @EdmProperty(name = "SupplierID", facets = @EdmFacets(nullable = false))
    private Integer supplierId;

	@EdmProperty(facets = @EdmFacets(nullable = false, maxLength = 40))
    private String companyName;

	@EdmProperty(facets = @EdmFacets(maxLength = 30))
    private String contactName;

	@EdmProperty(facets = @EdmFacets(maxLength = 30))
    private String contactTitle;

	@EdmProperty(facets = @EdmFacets(maxLength = 60))
    private String address;

	@EdmProperty(facets = @EdmFacets(maxLength = 15))
    private String city;

	@EdmProperty(facets = @EdmFacets(maxLength = 15))
    private String region;

	@EdmProperty(facets = @EdmFacets(maxLength = 10))
    private String postalCode;

	@EdmProperty(facets = @EdmFacets(maxLength = 15))
    private String country;

	@EdmProperty(facets = @EdmFacets(maxLength = 24))
    private String phone;

	@EdmProperty(facets = @EdmFacets(maxLength = 24))
    private String fax;

	@EdmProperty
    private String homePage;
}
