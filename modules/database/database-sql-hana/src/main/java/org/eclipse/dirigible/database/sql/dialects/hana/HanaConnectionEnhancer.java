package org.eclipse.dirigible.database.sql.dialects.hana;

import org.eclipse.dirigible.components.api.security.UserFacade;
import org.eclipse.dirigible.components.database.ConnectionEnhancer;
import org.eclipse.dirigible.components.database.DatabaseSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.SQLException;

@Component
class HanaConnectionEnhancer implements ConnectionEnhancer {
    private static final Logger LOGGER = LoggerFactory.getLogger(HanaConnectionEnhancer.class);

    @Override
    public boolean isApplicable(DatabaseSystem databaseSystem) {
        return databaseSystem.isHANA();
    }

    @Override
    public void apply(Connection connection) throws SQLException {
        Authentication authentication = SecurityContextHolder.getContext()
                                                             .getAuthentication();
        String userName;
        if (authentication != null) {
            userName = authentication.getName();
        } else {
            userName = UserFacade.getName();
        }
        LOGGER.debug("Setting APPLICATIONUSER:{} for connection: {}", userName, connection);
        connection.setClientInfo("APPLICATIONUSER", userName);

        LOGGER.debug("Setting XS_APPLICATIONUSER:{} for connection: {}", userName, connection);
        connection.setClientInfo("XS_APPLICATIONUSER", userName);
    }
}
