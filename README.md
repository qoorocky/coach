# Coach — HIIT Fitness App

HIIT 導向跨平台健身 App，參見 [spec.md](./spec.md)。

## Monorepo 結構

```
coach/
├── app/              # React Native 0.85 (Bare, iOS/Android)
├── cms-web/          # Next.js 16 + Tailwind 4 CMS 前端
├── cms-api/          # Spring Boot 3.5 CMS 後端 (Java 17)
├── shared-types/     # 跨 App / CMS 共享 TypeScript 型別
├── content/          # 課程 JSON、肌群 SVG（Phase 6 產出）
├── docs/             # 補充文件
├── docker-compose.yml
├── pnpm-workspace.yaml
└── spec.md
```

## 環境需求

| 項目 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ 20（已驗證 24.14） | JS 生態 |
| pnpm | ≥ 10（已驗證 10.33） | Monorepo 管理 |
| Docker Desktop | 29+ | PostgreSQL + MinIO |
| Java | 17 Temurin（已驗證） | cms-api |
| Android Studio + SDK | latest | app 編譯（Windows／macOS／Linux 皆可） |
| Xcode | latest | app iOS 編譯（僅 macOS） |

## 快速開始

```bash
# 1. 安裝依賴
pnpm install

# 2. 啟本機 Docker 服務（PostgreSQL + MinIO）
pnpm docker:up

# 3. 驗證各 package
pnpm typecheck            # 跑全部 package 的 typecheck
pnpm app:test             # 跑 RN jest 測試
```

## 各子專案啟動

```bash
# CMS Web → http://localhost:3100
pnpm cms-web:dev

# CMS API → http://localhost:8080/ping
pnpm cms-api:run

# RN Metro → http://localhost:8081
pnpm app:start
# 另一個終端：
# cd app && npx react-native run-android
```

## 本機服務 port 配置

| 服務 | Port | 說明 |
|------|------|------|
| CMS Web (Next.js) | 3100 | CMS 前端 |
| CMS API (Spring Boot) | 8080 | CMS 後端 + App Sync API |
| RN Metro | 8081 | React Native dev server |
| PostgreSQL | 5432 | 內容與使用者資料 |
| MinIO API | 9000 | S3 相容物件儲存 |
| MinIO Console | 9001 | http://localhost:9001（帳號：coach_admin / coach_dev_password） |

## Phase 0 完成項目

- [x] pnpm workspace + TypeScript monorepo
- [x] `@coach/shared-types` 共享型別（Exercise / Workout / EngineState / SessionLog / SyncResponse）
- [x] Docker Compose（PostgreSQL 15 + MinIO + 自動建 bucket）
- [x] Spring Boot 3.5（Flyway + Security + JPA + Actuator + `/ping`）
- [x] Next.js 16 + Tailwind 4（已連通 shared-types）
- [x] React Native 0.85（Jest + shared-types 整合測試通過）

下一步：Phase 1（CMS-API M1 — schema + JWT + CRUD + `/api/v1/content/sync`）、Phase 2（App 訓練引擎原型）。
