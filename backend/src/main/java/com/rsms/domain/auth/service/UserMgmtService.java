package com.rsms.domain.auth.service;

import com.rsms.domain.auth.dto.CreateUserRequest;
import com.rsms.domain.auth.dto.UpdateUserRequest;
import com.rsms.domain.auth.dto.UserDto;
import com.rsms.domain.auth.entity.Role;
import com.rsms.domain.auth.entity.User;
import com.rsms.domain.auth.entity.UserRole;
import com.rsms.domain.auth.repository.RoleRepository;
import com.rsms.domain.auth.repository.UserRepository;
import com.rsms.domain.auth.repository.UserRoleRepository;
import com.rsms.domain.employee.entity.Employee;
import com.rsms.domain.employee.repository.EmployeeRepository;
import com.rsms.domain.organization.entity.Organization;
import com.rsms.domain.organization.repository.OrganizationRepository;
import com.rsms.domain.position.entity.Position;
import com.rsms.domain.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자 관리 서비스
 * - UserMgmt 화면을 위한 사용자 CRUD 기능
 * - 사용자-역할 매핑 관리
 * - employees 테이블과 조인하여 부서명, 직책명 조회
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserMgmtService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 전체 사용자 목록 조회
     * - 삭제되지 않은 모든 사용자 조회
     * - employees 테이블과 조인하여 부서명, 직책명 포함
     * - organizations, positions 테이블과 조인하여 부서명, 직위명 조회
     *
     * @return 사용자 DTO 목록
     */
    public List<UserDto> getAllUsers() {
        log.debug("전체 사용자 목록 조회");

        List<User> users = userRepository.findAllNotDeleted();

        // 직원번호 목록 추출 (null 제외)
        List<String> empNos = users.stream()
            .map(User::getEmpNo)
            .filter(empNo -> empNo != null && !empNo.isEmpty())
            .collect(Collectors.toList());

        // 직원 정보 조회 (일괄 조회)
        Map<String, Employee> employeeMap = empNos.isEmpty()
            ? Map.of()
            : employeeRepository.findByEmpNoInAndNotDeleted(empNos).stream()
                .collect(Collectors.toMap(Employee::getEmpNo, e -> e));

        // 조직 코드 목록 추출 (Employee에서)
        List<String> orgCodes = employeeMap.values().stream()
            .map(Employee::getOrgCode)
            .filter(orgCode -> orgCode != null && !orgCode.isEmpty())
            .distinct()
            .collect(Collectors.toList());

        // 조직 정보 일괄 조회 - orgCode로 조회
        Map<String, Organization> organizationMap = orgCodes.isEmpty()
            ? Map.of()
            : organizationRepository.findAllById(orgCodes).stream()
                .collect(Collectors.toMap(Organization::getOrgCode, o -> o));

        // 직위 코드 목록 추출 (Employee에서)
        List<String> positionCodes = employeeMap.values().stream()
            .map(Employee::getPositionCode)
            .filter(posCode -> posCode != null && !posCode.isEmpty())
            .distinct()
            .collect(Collectors.toList());

        // 직위 정보 일괄 조회 - positionsCd로 조회
        Map<String, Position> positionMap = positionCodes.isEmpty()
            ? Map.of()
            : positionRepository.findByPositionsCdIn(positionCodes).stream()
                .collect(Collectors.toMap(Position::getPositionsCd, p -> p));

        // 사용자별 역할 조회 및 DTO 변환
        List<UserDto> userDtos = new ArrayList<>();
        for (User user : users) {
            Employee employee = employeeMap.get(user.getEmpNo());
            Organization organization = employee != null && employee.getOrgCode() != null
                ? organizationMap.get(employee.getOrgCode())
                : null;
            Position position = employee != null && employee.getPositionCode() != null
                ? positionMap.get(employee.getPositionCode())
                : null;

            List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(user.getUserId());
            UserDto dto = convertToDto(user, employee, organization, position, userRoles);
            userDtos.add(dto);
        }

        log.debug("전체 사용자 목록 조회 완료: {} 명", userDtos.size());
        return userDtos;
    }

    /**
     * 사용자 단건 조회
     * - 부서명, 직위명 조인 포함
     *
     * @param userId 사용자 ID
     * @return 사용자 DTO (없으면 null)
     */
    public UserDto getUserById(Long userId) {
        log.debug("사용자 조회: userId={}", userId);

        Optional<User> userOpt = userRepository.findById(userId)
            .filter(u -> "N".equals(u.getIsDeleted()));

        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();

        // 직원 정보 조회
        Employee employee = null;
        if (user.getEmpNo() != null && !user.getEmpNo().isEmpty()) {
            employee = employeeRepository.findByEmpNoAndNotDeleted(user.getEmpNo()).orElse(null);
        }

        // 조직 정보 조회
        Organization organization = null;
        if (employee != null && employee.getOrgCode() != null) {
            organization = organizationRepository.findById(employee.getOrgCode()).orElse(null);
        }

        // 직위 정보 조회
        Position position = null;
        if (employee != null && employee.getPositionCode() != null) {
            position = positionRepository.findByPositionsCd(employee.getPositionCode()).orElse(null);
        }

        // 역할 조회
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(userId);

        return convertToDto(user, employee, organization, position, userRoles);
    }

    /**
     * 사용자 검색
     * - 사용자명 또는 직원번호로 검색
     * - 부서명, 직위명 조인 포함
     *
     * @param keyword 검색어
     * @return 사용자 DTO 목록
     */
    public List<UserDto> searchUsers(String keyword) {
        log.debug("사용자 검색: keyword={}", keyword);

        List<User> users = userRepository.searchByKeyword(keyword);

        // 직원번호 목록 추출
        List<String> empNos = users.stream()
            .map(User::getEmpNo)
            .filter(empNo -> empNo != null && !empNo.isEmpty())
            .collect(Collectors.toList());

        // 직원 정보 조회
        Map<String, Employee> employeeMap = empNos.isEmpty()
            ? Map.of()
            : employeeRepository.findByEmpNoInAndNotDeleted(empNos).stream()
                .collect(Collectors.toMap(Employee::getEmpNo, e -> e));

        // 조직 코드 목록 추출
        List<String> orgCodes = employeeMap.values().stream()
            .map(Employee::getOrgCode)
            .filter(orgCode -> orgCode != null && !orgCode.isEmpty())
            .distinct()
            .collect(Collectors.toList());

        // 조직 정보 일괄 조회
        Map<String, Organization> organizationMap = orgCodes.isEmpty()
            ? Map.of()
            : organizationRepository.findAllById(orgCodes).stream()
                .collect(Collectors.toMap(Organization::getOrgCode, o -> o));

        // 직위 코드 목록 추출
        List<String> positionCodes = employeeMap.values().stream()
            .map(Employee::getPositionCode)
            .filter(posCode -> posCode != null && !posCode.isEmpty())
            .distinct()
            .collect(Collectors.toList());

        // 직위 정보 일괄 조회
        Map<String, Position> positionMap = positionCodes.isEmpty()
            ? Map.of()
            : positionRepository.findByPositionsCdIn(positionCodes).stream()
                .collect(Collectors.toMap(Position::getPositionsCd, p -> p));

        // DTO 변환
        List<UserDto> userDtos = new ArrayList<>();
        for (User user : users) {
            Employee employee = employeeMap.get(user.getEmpNo());
            Organization organization = employee != null && employee.getOrgCode() != null
                ? organizationMap.get(employee.getOrgCode())
                : null;
            Position position = employee != null && employee.getPositionCode() != null
                ? positionMap.get(employee.getPositionCode())
                : null;

            List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(user.getUserId());
            UserDto dto = convertToDto(user, employee, organization, position, userRoles);
            userDtos.add(dto);
        }

        log.debug("사용자 검색 완료: {} 명", userDtos.size());
        return userDtos;
    }

    /**
     * 사용자 생성
     *
     * @param request 생성 요청 DTO
     * @return 생성된 사용자 DTO
     */
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        log.debug("사용자 생성: username={}", request.getUsername());

        // 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 사용자 아이디입니다: " + request.getUsername());
        }

        // 사용자 엔티티 생성
        User user = User.builder()
            .username(request.getUsername())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .empNo(request.getEmpNo())
            .accountStatus(request.getAccountStatus() != null ? request.getAccountStatus() : "ACTIVE")
            .passwordChangeRequired("Y")
            .failedLoginCount(0)
            .isAdmin(request.getIsAdmin() != null ? request.getIsAdmin() : "N")
            .isExecutive(request.getIsExecutive() != null ? request.getIsExecutive() : "N")
            .authLevel(request.getAuthLevel() != null ? request.getAuthLevel() : 5)
            .isLoginBlocked(request.getIsLoginBlocked() != null ? request.getIsLoginBlocked() : "N")
            .timezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Seoul")
            .language(request.getLanguage() != null ? request.getLanguage() : "ko")
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy("system")
            .updatedBy("system")
            .isDeleted("N")
            .build();

        User savedUser = userRepository.save(user);
        log.info("사용자 생성 완료: userId={}", savedUser.getUserId());

        // 역할 할당
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            assignRoles(savedUser.getUserId(), request.getRoleIds(), "system");
        }

        return getUserById(savedUser.getUserId());
    }

    /**
     * 사용자 수정
     *
     * @param userId 사용자 ID
     * @param request 수정 요청 DTO
     * @return 수정된 사용자 DTO
     */
    @Transactional
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        log.debug("사용자 수정: userId={}", userId);

        User user = userRepository.findById(userId)
            .filter(u -> "N".equals(u.getIsDeleted()))
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        // 비밀번호 변경 (요청된 경우만)
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            user.setPasswordLastChangedAt(LocalDateTime.now());
        }

        // 필드 업데이트
        if (request.getEmpNo() != null) {
            user.setEmpNo(request.getEmpNo());
        }
        if (request.getAccountStatus() != null) {
            user.setAccountStatus(request.getAccountStatus());
        }
        if (request.getPasswordChangeRequired() != null) {
            user.setPasswordChangeRequired(request.getPasswordChangeRequired());
        }
        if (request.getIsAdmin() != null) {
            user.setIsAdmin(request.getIsAdmin());
        }
        if (request.getIsExecutive() != null) {
            user.setIsExecutive(request.getIsExecutive());
        }
        if (request.getAuthLevel() != null) {
            user.setAuthLevel(request.getAuthLevel());
        }
        if (request.getIsLoginBlocked() != null) {
            user.setIsLoginBlocked(request.getIsLoginBlocked());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }
        if (request.getLanguage() != null) {
            user.setLanguage(request.getLanguage());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        user.setUpdatedBy("system");
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("사용자 수정 완료: userId={}", userId);

        // 역할 재할당 (요청된 경우)
        if (request.getRoleIds() != null) {
            // 기존 역할 비활성화
            List<UserRole> existingRoles = userRoleRepository.findActiveRolesByUserId(userId);
            for (UserRole ur : existingRoles) {
                ur.setIsActive("N");
                ur.setUpdatedBy("system");
                ur.setUpdatedAt(LocalDateTime.now());
                userRoleRepository.save(ur);
            }

            // 새 역할 할당
            if (!request.getRoleIds().isEmpty()) {
                assignRoles(userId, request.getRoleIds(), "system");
            }
        }

        return getUserById(userId);
    }

    /**
     * 사용자 삭제 (논리적 삭제)
     *
     * @param userId 사용자 ID
     */
    @Transactional
    public void deleteUser(Long userId) {
        log.debug("사용자 삭제: userId={}", userId);

        User user = userRepository.findById(userId)
            .filter(u -> "N".equals(u.getIsDeleted()))
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        user.setIsDeleted("Y");
        user.setUpdatedBy("system");
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("사용자 삭제 완료: userId={}", userId);

        // 역할 매핑도 비활성화
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(userId);
        for (UserRole ur : userRoles) {
            ur.setIsActive("N");
            ur.setIsDeleted("Y");
            ur.setUpdatedBy("system");
            ur.setUpdatedAt(LocalDateTime.now());
            userRoleRepository.save(ur);
        }
    }

    /**
     * 사용자에게 역할 할당
     *
     * @param userId 사용자 ID
     * @param roleIds 역할 ID 목록
     * @param assignedBy 할당자
     */
    private void assignRoles(Long userId, List<Long> roleIds, String assignedBy) {
        for (Long roleId : roleIds) {
            // 중복 체크
            if (!userRoleRepository.existsByUserIdAndRoleId(userId, roleId)) {
                UserRole userRole = UserRole.createAssignment(userId, roleId, assignedBy);
                userRoleRepository.save(userRole);
                log.debug("역할 할당: userId={}, roleId={}", userId, roleId);
            }
        }
    }

    /**
     * 활성 역할 목록 조회
     *
     * @return 역할 DTO 목록
     */
    public List<UserDto.UserRoleDto> getActiveRoles() {
        log.debug("활성 역할 목록 조회");

        List<Role> roles = roleRepository.findAllActiveRoles();

        return roles.stream()
            .map(role -> UserDto.UserRoleDto.builder()
                .roleId(role.getRoleId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .roleCategory(role.getRoleCategory())
                .isActive(true)
                .build())
            .collect(Collectors.toList());
    }

    /**
     * User 엔티티를 UserDto로 변환
     * - Organization과 Position을 조인하여 부서명, 직위명 매핑
     *
     * @param user 사용자 엔티티
     * @param employee 직원 엔티티 (null 가능)
     * @param organization 조직 엔티티 (null 가능)
     * @param position 직위 엔티티 (null 가능)
     * @param userRoles 사용자 역할 목록
     * @return UserDto
     */
    private UserDto convertToDto(User user, Employee employee, Organization organization, Position position, List<UserRole> userRoles) {
        // 역할 정보 변환
        List<UserDto.UserRoleDto> roleDtos = new ArrayList<>();
        for (UserRole ur : userRoles) {
            Role role = roleRepository.findById(ur.getRoleId()).orElse(null);
            if (role != null) {
                roleDtos.add(UserDto.UserRoleDto.builder()
                    .userRoleId(ur.getUserRoleId())
                    .roleId(role.getRoleId())
                    .roleCode(role.getRoleCode())
                    .roleName(role.getRoleName())
                    .roleCategory(role.getRoleCategory())
                    .assignedAt(ur.getAssignedAt() != null ? ur.getAssignedAt().toString() : null)
                    .assignedBy(ur.getAssignedBy())
                    .isActive("Y".equals(ur.getIsActive()))
                    .build());
            }
        }

        return UserDto.builder()
            .userId(user.getUserId())
            .username(user.getUsername())
            .empNo(user.getEmpNo())
            .empName(employee != null ? employee.getEmpName() : null)
            .empNameEn(employee != null ? employee.getEmpNameEn() : null)
            .orgCode(employee != null ? employee.getOrgCode() : null)
            .orgName(organization != null ? organization.getOrgName() : null)  // 부서명 조회
            .positionCode(employee != null ? employee.getPositionCode() : null)
            .positionName(position != null ? position.getPositionsName() : null)  // 직위명 조회
            .jobGrade(employee != null ? employee.getJobGrade() : null)
            .email(employee != null ? employee.getEmail() : null)
            .accountStatus(user.getAccountStatus())
            .passwordChangeRequired("Y".equals(user.getPasswordChangeRequired()))
            .lastLoginAt(user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null)
            .failedLoginCount(user.getFailedLoginCount())
            .isAdmin("Y".equals(user.getIsAdmin()))
            .isExecutive("Y".equals(user.getIsExecutive()))
            .authLevel(user.getAuthLevel())
            .isLoginBlocked("Y".equals(user.getIsLoginBlocked()))
            .timezone(user.getTimezone())
            .language(user.getLanguage())
            .isActive("Y".equals(user.getIsActive()))
            .roles(roleDtos)
            .roleCount(roleDtos.size())
            .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
            .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
            .createdBy(user.getCreatedBy())
            .updatedBy(user.getUpdatedBy())
            .build();
    }
}
