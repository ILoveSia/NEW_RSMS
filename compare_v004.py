#!/usr/bin/env python3
"""
V004 마이그레이션 파일과 원본 파일 비교 (users ~ access_logs)
"""

import re
import os
from collections import defaultdict

def extract_create_table(file_path):
    """SQL 파일에서 CREATE TABLE 문을 추출"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # CREATE TABLE ... ); 까지 추출
    pattern = r'CREATE TABLE\s+rsms\.(\w+)\s*\((.*?)\);'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)

    tables = {}
    for table_name, table_def in matches:
        # 컬럼 정보 추출
        columns = []
        for line in table_def.split('\n'):
            line = line.strip()
            # 주석 제거
            if line.startswith('--'):
                continue
            # CONSTRAINT 줄 제외
            if line.upper().startswith('CONSTRAINT'):
                continue
            # 컬럼 정의 추출 (첫 단어가 컬럼명)
            if line and not line.startswith('--'):
                # 쉼표로 끝나면 제거
                line = line.rstrip(',')
                # 첫 단어 추출
                parts = line.split()
                if parts and not parts[0].upper() in ['CONSTRAINT', 'FOREIGN', 'PRIMARY', 'UNIQUE', 'CHECK']:
                    col_name = parts[0]
                    if col_name and not col_name == '--':
                        columns.append(col_name)

        tables[table_name] = sorted(set(columns))

    return tables

def compare_tables(original_files, migration_file):
    """테이블 비교"""
    print("=" * 80)
    print("원본 파일과 V004 마이그레이션 파일 테이블 구조 비교")
    print("=" * 80)

    # 원본 파일 파싱
    original_tables = {}
    for file_path in original_files:
        tables = extract_create_table(file_path)
        original_tables.update(tables)
        print(f"✓ {os.path.basename(file_path)}: {list(tables.keys())}")

    print(f"\n총 원본 테이블 수: {len(original_tables)}")

    # 마이그레이션 파일 파싱
    migration_tables = extract_create_table(migration_file)
    print(f"V004 마이그레이션 테이블 수: {len(migration_tables)}")
    print(f"V004 테이블 목록: {list(migration_tables.keys())}")

    print("\n" + "=" * 80)
    print("테이블별 비교 결과")
    print("=" * 80)

    all_table_names = set(original_tables.keys()) | set(migration_tables.keys())

    differences_found = False

    for table_name in sorted(all_table_names):
        original_cols = set(original_tables.get(table_name, []))
        migration_cols = set(migration_tables.get(table_name, []))

        if original_cols != migration_cols:
            differences_found = True
            print(f"\n❌ [{table_name}] 테이블에 차이 발견!")

            if table_name not in original_tables:
                print(f"  ⚠️ 원본에 없는 테이블! (마이그레이션에만 존재)")
            elif table_name not in migration_tables:
                print(f"  ⚠️ 마이그레이션에 없는 테이블! (원본에만 존재)")
            else:
                # 컬럼 차이
                only_in_original = original_cols - migration_cols
                only_in_migration = migration_cols - original_cols

                if only_in_original:
                    print(f"  📌 원본에만 있는 컬럼: {sorted(only_in_original)}")

                if only_in_migration:
                    print(f"  📌 마이그레이션에만 있는 컬럼: {sorted(only_in_migration)}")

                # 공통 컬럼
                common_cols = original_cols & migration_cols
                print(f"  ✅ 공통 컬럼 ({len(common_cols)}개): {sorted(common_cols)}")

    if not differences_found:
        print("\n✅ 모든 테이블이 100% 일치합니다!")
    else:
        print("\n" + "=" * 80)
        print("⚠️  차이점이 발견되었습니다. 위 내용을 확인해주세요.")
        print("=" * 80)

if __name__ == "__main__":
    # 원본 파일 경로 (V004에 해당하는 14-22)
    base_path = "/home/rocosoo/RSMS/database/scripts"
    original_files = [
        f"{base_path}/14.create_table_users.sql",
        f"{base_path}/15.create_table_roles.sql",
        f"{base_path}/16.create_table_menu_items.sql",
        f"{base_path}/17.create_table_permissions.sql",
        f"{base_path}/18.create_table_role_permissions.sql",
        f"{base_path}/19.create_table_user_roles.sql",
        f"{base_path}/20.create_table_menu_permissions.sql",
        f"{base_path}/21.create_table_login_history.sql",
        f"{base_path}/22.create_table_access_logs.sql",
    ]

    # 마이그레이션 파일 경로
    migration_file = "/home/rocosoo/RSMS/backend/src/main/resources/db/migration/V004__Create_auth_tables.sql"

    compare_tables(original_files, migration_file)
