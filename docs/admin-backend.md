# COWIN Glasses 后台

后台位于 `/admin`，与现有商城前台隔离。所有后台业务数据以 Neon PostgreSQL 为唯一主数据库；浏览器端不得读取 `DATABASE_URL`、支付密钥、物流密钥或对象存储密钥。

## 本地启动

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

首次创建管理员前，安全地在本地环境或 Vercel 环境变量中填写：

```text
DATABASE_URL=<Neon pooled connection string>
AUTH_SECRET=<long-random-secret>
ADMIN_BOOTSTRAP_EMAIL=<admin email>
ADMIN_BOOTSTRAP_PASSWORD=<initial password>
```

`ADMIN_BOOTSTRAP_PASSWORD` 仅用于首次运行 `pnpm db:seed`；创建成功后应从运行环境移除。不要提交 `.env.local`。

## 数据库与迁移

- Schema：`src/db/schema.ts`
- Drizzle 配置：`drizzle.config.ts`
- 种子数据：`src/db/seed.ts`
- 迁移目录：`drizzle/`

订单、库存、付款、退款、发货与售后的状态变更必须使用数据库事务，并同时写入 `inventory_movements` 或 `audit_logs`。金额字段统一为 PostgreSQL `numeric(12,2)`，禁止使用浮点数。

### Neon 环境建议

| 环境 | 数据库分支 | 变量 |
|---|---|---|
| Development | `development` 或个人开发分支 | 本地 `.env.local` 的 `DATABASE_URL` |
| Preview | 每个 PR 的隔离 Neon Preview 分支 | Vercel Preview `DATABASE_URL` |
| Production | `production` 分支 | Vercel Production `DATABASE_URL` |

生产与 Preview 使用 Neon pooled connection string。不要在应用启动阶段自动执行迁移；由受控的 CI/部署步骤执行 `pnpm db:migrate`。

## 管理员认证与权限

登录路径是 `/admin/login`。使用账号密码、bcrypt 哈希和 Auth.js 的加密 HttpOnly 会话 Cookie。

内置角色：

- `super_admin`：全部权限
- `operations`：商品、促销、内容、数据分析
- `support`：订单、客户、退款与售后
- `warehouse`：库存、发货和物流

权限必须在三处校验：导航可见性、页面/服务端路由、写操作 API。`requireAdmin` 与 `requirePermission` 位于 `src/lib/admin/auth.ts`，任何新增的服务端写入必须先调用相应权限校验。

## 第三方适配层

支付、物流、对象存储与通知接口定义在 `src/lib/admin/providers/types.ts`。在未获得服务商文档或凭据时，必须使用 `unconfigured` Provider 返回明确的“尚未配置”状态，不能模拟支付成功、发货成功或上传成功。

### 支付

保留现有 Oceanpayment 环境变量。前海支付的变量与接口边界已预留，但不包含服务商专属请求参数或签名逻辑。接入前需要：

1. API 与退款接口文档；
2. 测试与生产终端号、密钥及公钥；
3. 回调地址、签名算法、允许来源 IP 与重试规则；
4. 支付状态与退款状态对照表。

支付 Webhook 必须在 Node.js 服务端运行，并按“验签 → `webhook_events` 幂等去重 → 数据库事务 → 审计日志 → 通知任务”处理。不要将任何回调逻辑放入客户端。

### 物流、存储和通知

| 服务 | 需要的外部信息 | 预期 Webhook |
|---|---|---|
| 物流 | API URL、Token、下单字段、追踪状态映射 | 物流状态变更签名与重试规则 |
| 对象存储 | Provider、Bucket、Endpoint、受限凭据、公开域名 | 无；使用签名上传或服务端上传 |
| 邮件/短信 | Provider、发件人、API/SMTP 凭据、模板 ID | 投递/失败事件（如服务商支持） |
| Meta / Google / WhatsApp | OAuth 应用配置、回调 URL、授权范围 | OAuth state 校验、Meta 验签 |

## Vercel 配置

在 Vercel Project → Settings → Environment Variables 中设置 `.env.example` 列出的变量。Production、Preview、Development 均分别配置；`NEXT_PUBLIC_` 仅用于确实需要公开的站点 URL 和客户端展示信息。

建议构建验证顺序：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

部署后最低限度检查：`/admin/login` 返回 200、未登录访问 `/admin` 跳转登录页、商品前台不受影响、Webhook 路由验签失败不产生订单/退款/库存写入。
