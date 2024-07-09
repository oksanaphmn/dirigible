package org.eclipse.dirigible.components.base.util;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AuthoritiesUtil {

    private static final String ROLE_PREFIX = "ROLE_";

    public static Set<GrantedAuthority> toAuthorities(String... roleNames) {
        return toAuthorities(Arrays.stream(roleNames));
    }

    public static Set<GrantedAuthority> toAuthorities(Stream<String> roleNames) {
        return roleNames.map((r -> r.startsWith(ROLE_PREFIX) ? r : (ROLE_PREFIX + r)))
                        .map(r -> new SimpleGrantedAuthority(r))
                        .collect(Collectors.toSet());
    }

    public static Set<GrantedAuthority> toAuthorities(Collection<String> roleNames) {
        return toAuthorities(roleNames.stream());
    }

    public static Collection<String> toRoleNames(Collection<? extends GrantedAuthority> authorities) {
        if (null == authorities) {
            return Collections.emptySet();
        }

        return authorities.stream()
                          .map(GrantedAuthority::getAuthority)
                          .map(authority -> authority.startsWith(ROLE_PREFIX) ? authority.replaceAll(Pattern.quote(ROLE_PREFIX), "")
                                  : authority)
                          .collect(Collectors.toSet());

    }
}
