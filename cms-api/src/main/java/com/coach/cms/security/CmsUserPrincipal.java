package com.coach.cms.security;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.domain.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public record CmsUserPrincipal(
        Long id,
        String email,
        String name,
        Role role,
        boolean active
) implements UserDetails {

    public static CmsUserPrincipal from(CmsUser user) {
        return new CmsUserPrincipal(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.isActive());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.authority()));
    }

    @Override public String getPassword() { return ""; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return active; }
    @Override public boolean isAccountNonLocked() { return active; }
    @Override public boolean isCredentialsNonExpired() { return active; }
    @Override public boolean isEnabled() { return active; }
}
