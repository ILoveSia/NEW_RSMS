package com.rsms.domain.auth.security;

import com.rsms.domain.auth.entity.User;
import com.rsms.domain.auth.entity.UserRole;
import com.rsms.domain.auth.repository.UserRepository;
import com.rsms.domain.auth.repository.UserRoleRepository;
import com.rsms.domain.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security UserDetailsService 구현체
 * - 사용자 인증 시 DB에서 사용자 정보 조회
 * - 사용자의 역할(Role) 정보를 포함하여 CustomUserDetails 생성
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    /**
     * 사용자명(username)으로 사용자 정보 조회
     * - Spring Security 인증 시 자동 호출
     *
     * @param username 로그인 ID
     * @return CustomUserDetails 사용자 상세 정보
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("로그인 시도: username={}", username);

        // 1. 사용자 조회
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                log.warn("사용자를 찾을 수 없음: username={}", username);
                return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
            });

        // 2. 사용자 상태 검증
        if (!user.canLogin()) {
            log.warn("로그인 불가 상태: username={}, accountStatus={}, isActive={}, isLoginBlocked={}",
                username, user.getAccountStatus(), user.getIsActive(), user.getIsLoginBlocked());
            throw new UsernameNotFoundException("로그인할 수 없는 계정입니다: " + username);
        }

        // 3. 사용자 역할 조회
        List<String> roles = getUserRoles(user.getUserId());
        log.debug("사용자 역할 조회 완료: username={}, roles={}", username, roles);

        // 4. CustomUserDetails 생성
        return new CustomUserDetails(user, roles);
    }

    /**
     * 사용자 ID로 역할 목록 조회
     *
     * @param userId 사용자 ID
     * @return 역할 코드 목록 (예: ["001", "102"])
     */
    @Transactional(readOnly = true)
    public List<String> getUserRoles(Long userId) {
        // 사용자-역할 매핑 조회
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(userId);

        // 역할 ID 목록 추출
        List<Long> roleIds = userRoles.stream()
            .map(UserRole::getRoleId)
            .collect(Collectors.toList());

        // 역할 코드 조회
        return roleRepository.findAllById(roleIds).stream()
            .filter(role -> "ACTIVE".equals(role.getStatus()))
            .map(role -> role.getRoleCode())
            .collect(Collectors.toList());
    }

    /**
     * 사용자 ID로 UserDetails 조회
     * - 세션에서 사용자 정보 재조회 시 사용
     *
     * @param userId 사용자 ID
     * @return CustomUserDetails 사용자 상세 정보
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        log.debug("사용자 ID로 조회: userId={}", userId);

        // 1. 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("사용자를 찾을 수 없음: userId={}", userId);
                return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId);
            });

        // 2. 사용자 역할 조회
        List<String> roles = getUserRoles(userId);

        // 3. CustomUserDetails 생성
        return new CustomUserDetails(user, roles);
    }

    /**
     * 직원번호로 UserDetails 조회
     *
     * @param empNo 직원번호
     * @return CustomUserDetails 사용자 상세 정보
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserByEmpNo(String empNo) throws UsernameNotFoundException {
        log.debug("직원번호로 조회: empNo={}", empNo);

        // 1. 사용자 조회
        User user = userRepository.findByEmpNo(empNo)
            .orElseThrow(() -> {
                log.warn("사용자를 찾을 수 없음: empNo={}", empNo);
                return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + empNo);
            });

        // 2. 사용자 역할 조회
        List<String> roles = getUserRoles(user.getUserId());

        // 3. CustomUserDetails 생성
        return new CustomUserDetails(user, roles);
    }
}
