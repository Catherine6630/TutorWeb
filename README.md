# Tutorly

Tutorly 是一个面向 Computer Science 学生的全栈 AI 学习平台。它把课程、课件、Tutorial、Past Paper、代码文件和 AI 对话放进同一个学习空间，并要求 AI 对课程资料给出可核对的来源引用。

当前版本是可直接运行的 MVP，包含真实数据库、认证、资料处理、检索、OpenAI 流式回答、聊天持久化和管理员后台；不是静态原型。

## 已实现

- 学生注册、登录、服务端 Session 与角色权限。
- UoA 2026 本科 COMPSCI 课程目录：Stage I–III 共 36 个课程条目。
- 学生首页、课程中心、课程详情、资料库、收藏、设置。
- AI Tutor：六种学习模式、课程选择、资料范围选择、流式回答、Markdown/代码展示。
- 本地 RAG：资料文本提取、分块、可选 OpenAI Embeddings、关键词与向量混合检索。
- 来源引用：提示模型使用 `[S1]` 格式，保存引用并展示原文片段。
- 文件支持：PDF、DOCX、PPTX、TXT、Markdown、常见代码文件。
- 权限：学生上传内容默认私有；管理员可上传课程公共资料。
- 管理后台：使用概览、课程创建、知识库状态与资料管理入口。
- API Key 缺失时安全降级：网站可启动，AI 页面明确提示配置，不伪造模型回答。
- 批量资料导入脚本、数据库迁移、演示数据和单元测试。

## 技术栈

- Next.js 16、React 19、TypeScript。
- Tailwind CSS 4。
- SQLite + `better-sqlite3`，使用 SQL migration。
- OpenAI JavaScript SDK + Responses API。
- 默认聊天模型 `gpt-5.6-sol`，通过 `OPENAI_MODEL` 切换。
- 默认向量模型 `text-embedding-3-small`，通过 `OPENAI_EMBEDDING_MODEL` 切换。

SQLite 让本地 MVP 无需额外数据库即可启动。所有数据库访问集中在 `lib/db.ts`、`lib/queries.ts` 和 RAG 模块中，后续可以替换为 PostgreSQL/pgvector，或编写适配器读取你的现有数据库。

## 快速开始

要求：Node.js 20+ 和 pnpm。

```bash
pnpm install
copy .env.example .env.local
pnpm db:seed
pnpm dev
```

打开 <http://localhost:3000>。

### 演示账号

- 学生：`student@tutorly.local` / `Student123!`
- 管理员：`admin@tutorly.local` / `Admin123!`

首次访问数据库时也会自动创建演示数据。生产部署前请删除或修改演示账号。

## 配置 OpenAI

在 `.env.local` 中填写：

```dotenv
OPENAI_API_KEY=你的服务端API密钥
OPENAI_MODEL=gpt-5.6-sol
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
SESSION_SECRET=至少32位的随机字符串
```

密钥只在服务端读取。不要把 `.env.local` 提交到 Git。

生产环境的 Session Cookie 默认要求 HTTPS。如果你只是在本机通过 HTTP 运行 `pnpm start`，可以临时设置 `SESSION_COOKIE_SECURE=false`；正式部署不要关闭安全 Cookie。

项目使用 Responses API 流式事件生成回答。每次请求都包含稳定、隐私保护的 `safety_identifier`，系统提示会区分课程资料与通用知识，并把上传资料视为不可信参考内容，防止资料中的指令覆盖系统规则。

OpenAI 参考：

- [Responses API](https://developers.openai.com/api/docs/guides/responses)
- [Model guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [Safety identifiers](https://developers.openai.com/api/docs/guides/safety-best-practices#safety-identifiers)

## 上传与检索流程

1. 用户在资料库上传文件并选择课程、类型与标签。
2. 服务端校验权限、扩展名和大小，将原文件保存在 `storage/materials`。
3. PDF/DOCX/PPTX/文本解析器提取正文和可用页码。
4. 文本按约 1,400 字符切分，并保留少量重叠。
5. 配置 OpenAI Key 时生成 Embeddings；未配置时保留关键词检索能力。
6. AI 提问时只检索用户有权读取、课程匹配且状态为 `ready` 的资料。
7. 相关片段以编号来源传给模型，回答及引用一起保存。

支持文件大小由 `MAX_UPLOAD_MB` 控制，默认 15 MB。单份资料最多索引 300 个片段，避免误上传超大文件造成意外费用。

## 批量导入课程资料

先在管理员后台创建课程，然后运行：

```bash
pnpm import:folder -- "COMPSCI 220" "D:\path\to\course-materials"
```

脚本会复制支持的文件、提取文本并建立索引。请确保你有权使用和处理这些课件、试卷或答案。

## 常用命令

```bash
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm start        # 启动生产服务器
pnpm typecheck    # TypeScript 检查
pnpm lint         # ESLint
pnpm test         # 单元测试
pnpm db:seed      # 初始化并显示演示数据计数
```

健康检查：`GET /api/health`。

## 目录

```text
app/                    Next.js 页面与 API
components/             页面组件与交互组件
database/migrations/    SQLite migration
lib/auth.ts             Session、登录与权限
lib/db.ts               数据库初始化与演示数据
lib/ingest.ts           文件解析、分块与向量生成
lib/rag.ts              权限感知的混合检索
lib/ai-prompt.ts        CS 导师系统提示
scripts/                Seed 与批量导入脚本
storage/materials/      本地上传文件（Git 忽略）
tests/                  单元测试
```

## 接入现有数据库

资料的标准结构是：

- `courses`：课程元数据。
- `materials`：文件与访问权限。
- `material_chunks`：可检索文本、页码和可选向量。

已有数据库可以采用两种方式：

1. 导出文件后使用 `import:folder` 导入。
2. 替换 `lib/db.ts`/`lib/queries.ts` 数据适配层，并保持 `Material`、`RetrievedSource` 等类型不变。

数据量增大后建议迁移到 PostgreSQL + pgvector，并在数据库层完成余弦距离排序。当前混合检索会在单门课程最多读取 500 个片段，适合本地开发和小规模试用。

## 生产注意事项

- 替换演示密码，并设置强 `SESSION_SECRET`。
- 将上传目录迁移到 S3 兼容对象存储。
- 使用 PostgreSQL/pgvector，并部署后台队列异步处理大文件。
- 把内存/单实例限制升级为 Redis 限流。
- 增加邮件验证、密码重置、审计日志和学校权限策略。
- 根据代表性学生问题评估模型质量、延迟与成本，再决定是否把默认模型切换到更经济的型号。
- 对公开服务增加内容安全策略、隐私政策、数据保留期限和版权声明。
