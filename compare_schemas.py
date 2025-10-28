#!/usr/bin/env python3
"""
database/scripts 원본 SQL 파일들과 Flyway 마이그레이션 파일 비교 스크립트
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
    print("원본 파일과 마이그레이션 파일 테이블 구조 비교")
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
    print(f"마이그레이션 테이블 수: {len(migration_tables)}")

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

    if not differences_found:
        print("\n✅ 모든 테이블이 100% 일치합니다!")
    else:
        print("\n" + "=" * 80)
        print("⚠️  차이점이 발견되었습니다. 위 내용을 확인해주세요.")
        print("=" * 80)

if __name__ == "__main__":
    # 원본 파일 경로 (V003에 해당하는 04-13)
    base_path = "/home/rocosoo/RSMS/database/scripts"
    original_files = [
        f"{base_path}/04.create_table_ledger_order.sql",
        f"{base_path}/05.create_table_positions.sql",
        f"{base_path}/06.create_table_positions_details.sql",
        f"{base_path}/07.create_table_position_concurrents.sql",
        f"{base_path}/08.create_table_committees.sql",
        f"{base_path}/09.create_table_committee_details.sql",
        f"{base_path}/10.create_table_responsibilities.sql",
        f"{base_path}/11.create_table_responsibility_details.sql",
        f"{base_path}/12.create_table_management_obligations.sql",
        f"{base_path}/13.create_table_resp_statement_execs.sql",
    ]

    # 마이그레이션 파일 경로
    migration_file = "/home/rocosoo/RSMS/backend/src/main/resources/db/migration/V003__Create_business_tables.sql"

    compare_tables(original_files, migration_file)
