# AI Job Application Copilot 路线图

## 1. 最终产品目标

在现有 AI Resume Match Analyzer 基础上，逐步加入一个 Chrome Extension，帮助用户：

1. 读取当前招聘页面的公司、职位和 Job Description。
2. 使用 Master Resume 生成针对该岗位的定制简历。
3. 自动填写可以确定回答的申请表字段。
4. 在提交前让用户检查所有答案。
5. 保存申请记录、使用的简历版本和回答。
6. 当插件填错或无法回答时，让用户在 Correction / Answer Library 页面输入正确答案。
7. 下次遇到相同或相似问题时，优先使用用户确认过的答案。

产品定位是 **AI Job Application Copilot**，不是无人监督的批量投递机器人。

## 2. 不可违反的产品原则

- 永远不自动点击最终的 `Submit application`。
- 不绕过 CAPTCHA、登录验证或招聘网站的安全限制。
- 不编造工作经历、技能、学历、日期、身份信息或成果数据。
- 自动填写前必须显示预览，让用户能够修改。
- 敏感问题不能因为“相似”就直接自动回答。
- 原始 PDF、身份证明和其他敏感文件默认不保存。
- 每条学习到的答案都必须来自用户明确输入或确认。
- 用户可以查看、修改、禁用或删除任何已保存答案。
- 用户明确确认过的事实始终优先于 AI 推断。
- AI-generated answers 不能自动写入或更新 Master Profile。
- AI-generated resume content 不能自动修改 Master Resume / Bullet Bank。
- AI-generated application answers 不能自动加入 Answer Library。
- 只有用户明确确认后，内容才能成为长期保存的事实、resume bullet 或 answer rule。
- 每个 proposed / autofilled field 都必须能解释来源，不能生成无法追溯来源的 autofill answer。

## 3. 最终用户流程

1. 用户打开一个受支持的招聘页面。
2. 点击浏览器插件的 `Analyze this job`。
3. 插件识别 ATS、公司、职位和 Job Description。
4. 网站后端根据 Master Resume 生成定制简历。
5. 用户检查并下载或选择该简历。
6. 插件扫描申请表字段，并先尝试给字段做 logical classification。
7. 插件根据字段分类、数据来源、confidence 和 sensitivity policy 把字段分成：
   - 可以安全自动填写
   - 有建议但需要确认
   - 无法回答
   - 敏感问题
8. 用户确认后，插件填写表单，但不提交。
9. 如果答案错误，用户点击 `Correct answer`。
10. 用户输入正确答案并决定是否保存到 Answer Library。
11. 系统保存申请记录和纠错规则。
12. 下次遇到相似问题时，系统检索 Answer Library 并按置信度处理。

点击 `Analyze this job` 只代表发现和分析岗位，不代表用户已经申请。Extension 后续可以为该岗位创建 Draft application，但不能直接标记为 `Applied`。

## 4. 需要新增的主要功能

### 4.1 Master Profile

新增 `/profile` 页面，保存稳定且可复用的个人资料：

- Legal name / preferred name
- Email / phone
- City / state / country
- LinkedIn / GitHub / portfolio
- Work authorization
- Sponsorship requirement
- Earliest start date
- Relocation preference
- 常用职位方向

敏感字段必须标记确认策略，不能全部默认为自动填写。

Profile 字段需要区分稳定事实和动态偏好：

- 稳定事实：姓名、Email、Phone、LinkedIn、GitHub、portfolio、基础联系方式等。
- 动态偏好：Earliest start date、relocation preference、常用职位方向等，可能随时间或岗位变化。
- Work authorization / sponsorship 等字段虽然可能较稳定，但 sensitivity 和 confirmation policy 必须明确。

Phase 1 不需要提前设计复杂数据库模型，但必须保留字段级 confirmation policy / sensitivity 的产品原则。

### 4.2 Master Resume / Bullet Bank

保存一份母版简历和更完整的 bullet bank：

- Education
- Experience
- Projects
- Skills
- 每条 bullet 的真实来源
- 可选标签，例如 Backend、AI、Data、Frontend

所有定制简历必须直接从 Master Resume 生成，不能在上一份定制简历上继续改。

Master Resume / Bullet Bank 是事实来源，不允许 AI 直接修改。正确流程是：

`Master Resume -> select / rewrite -> Tailored Resume`

不能：

`Tailored Resume -> 再作为下一份 Tailored Resume 的基础`

如果用户希望把新的 bullet 加回 Bullet Bank，必须经过用户明确确认。

### 4.3 Tailored Resume Generator

根据当前 JD：

- 选择最相关的经历和项目内容。
- 只改写有真实依据的 bullet。
- 每段 Experience 保留 4–5 个 bullet。
- 选择最相关的两个 Projects，每个 3–4 个 bullet。
- 输出可编辑版本。
- 支持复制 Markdown。
- 后续支持 PDF 导出和版本保存。

Phase 3 第一版保持简单：生成 structured tailored resume、可编辑输出、版本保存、Markdown / copy support。PDF export 继续作为后续能力，不提前加入复杂 resume template builder 或 PDF layout system。

### 4.4 Application History

新增 `/applications` 页面，记录：

- Company
- Job title
- Job URL
- ATS provider
- Application status
- Applied date
- 使用的 resume version
- 使用的 answers
- 需要 follow-up 的问题

建议状态：`Draft`、`Ready to review`、`Applied`、`Interview`、`Rejected`、`Offer`。

`JobPosting` 和 `JobApplication` 必须保持不同概念：

- `JobPosting` 表示发现或分析到的岗位。
- `JobApplication` 表示用户针对岗位产生的申请记录。
- `Analyze this job` 不代表已经申请。
- Extension 可以为岗位创建 Draft application。
- `Applied` 状态必须由用户行为或明确确认产生。

### 4.5 Chrome Extension

采用 Chrome Manifest V3，主要模块包括：

- Popup 或 side panel
- Background service worker
- Content script
- 每个 ATS 的独立 adapter
- 与现有 Next.js 后端通信的 API client
- 登录和授权流程

第一版只支持一个 ATS，不一开始支持所有网站。

Extension authentication 是 Phase 5 开始前必须单独评审的架构决策，范围是：

`Chrome Extension <-> Next.js backend <-> Clerk`

实现阶段不能自行选择长期 token 方案。认证方案必须满足：

- Extension bundle 不包含 secret。
- 不保存永久敏感 token。
- 使用可撤销或有生命周期的认证方式。
- 具体方案在 Phase 5 Plan Mode 时决定。

ATS-specific DOM logic 必须隔离在 adapter boundary 内，不能散落在通用 content script。逻辑边界应类似：

`adapters/greenhouse`

- detect
- extract job
- scan form
- fill form

未来 Lever / Workday 使用各自 adapter。当前不锁死具体文件名，只明确 adapter boundary。

### 4.6 Autofill Preview

插件填写前显示表格：

| Field | Proposed answer | Source | Confidence | Action |
| --- | --- | --- | --- | --- |
| Email | 用户邮箱 | Master Profile | High | Auto-fill |
| Sponsorship | 用户确认的答案 | Answer Library | Medium | Confirm |
| Salary expectation | 无 | None | Low | Manual |

用户必须能够逐项修改或取消填写。

Autofill 的 `Source` 必须可解释，来源至少包括：

- Master Profile
- Master Resume
- Answer Library
- Application override
- AI suggestion
- Manual

AI suggestion 只能生成建议，不能覆盖用户确认事实。

Extension 扫描表单后应先进行 Field Classification，而不是只做字符串相似度匹配。第一版 logical categories 可以包括：

- `IDENTITY`
- `CONTACT`
- `WORK_AUTHORIZATION`
- `EDUCATION`
- `WORK_HISTORY`
- `LINKS`
- `RELOCATION`
- `COMPENSATION`
- `OPEN_TEXT`
- `DEMOGRAPHIC`
- `LEGAL_ATTESTATION`
- `UNKNOWN`

字段分类用于决定数据来源、是否允许 autofill、是否需要用户确认，以及是否进入 Answer Library matching。

### 4.7 Answer Library / Correction Memory

新增 `/answers` 页面，保存用户确认过的常见申请问题。

每条 Answer Rule 至少包含：

- Original question
- Normalized / canonical question
- Confirmed answer
- Answer type：text、yes/no、number、single choice、multiple choice
- Example variations
- Applicable scope：global、specific company、specific ATS 或 specific role
- Sensitivity level
- Confirmation policy
- Times used
- Last confirmed date
- Enabled / disabled

示例：

- `Are you legally authorized to work in the United States?`
- `Are you authorized to work in the U.S.?`
- `Do you currently have U.S. work authorization?`

这些可以映射到同一个 canonical question，但只有在用户确认过答案和适用条件后才能使用。

Answer Library 只保存用户明确确认过、但不适合直接作为 Profile / Resume 结构化事实保存的申请问题答案。它不应该替代 Master Profile 或 Master Resume。

### 4.8 Manual Correction 页面

插件填错或无法回答时，打开一个纠错界面：

1. 显示招聘网站原始问题。
2. 显示插件原答案和来源。
3. 用户输入正确答案。
4. 用户选择：
   - 仅本次使用
   - 保存用于以后相似问题
   - 只用于这家公司
   - 总是需要我确认
5. 保存后立即更新本次申请预览。

系统同时保存 Correction Event，方便以后知道为什么答案被修改。

### 4.9 相似问题匹配

不要在第一版直接做复杂模型训练。按照以下顺序实现：

1. 字符标准化：小写、去标点、合并空格。
2. Exact match。
3. Keyword / token similarity。
4. 用户确认的 question variations。
5. 后续再考虑 embeddings 或 LLM semantic matching。

置信度策略：

- High：同一个 canonical question，答案仍在有效期内，可以自动填入预览。
- Medium：问题相似但不完全相同，只能建议并要求确认。
- Low：不使用旧答案，要求手动输入。

Confidence 决定答案匹配可靠程度，不决定敏感问题是否可以跳过确认。Sensitive category 的问题即使 confidence 为 High，也必须遵守 sensitive confirmation policy。

### 4.10 敏感问题策略

以下类型默认不能无确认自动填写：

- Salary expectation
- Relocation
- Sponsorship / visa 细节
- Criminal history
- Disability
- Veteran status
- Gender、race、ethnicity 等自愿人口统计问题
- Legal attestations
- Background check consent

对于自愿人口统计问题，默认保持未回答或由用户在当前申请中亲自选择。

Sensitivity policy 优先于 confidence：

- High confidence 不代表可以跳过敏感问题确认。
- 如果问题属于 sensitive category，即使匹配 confidence 为 High，也必须确认或保持手动。
- Confidence 用于判断候选答案是否可靠。
- Sensitivity 用于判断是否允许自动填写或必须确认。

### 4.11 数据来源职责和优先级

Extension 回答申请字段时，不应该所有问题都直接查询 Answer Library。数据来源职责如下：

- Master Profile：稳定的个人事实，例如姓名、邮箱、电话、work authorization 等。
- Master Resume：教育、工作经历、项目、技能等履历事实。
- Answer Library：用户明确确认过、但不适合直接作为 Profile / Resume 结构化事实保存的申请问题答案。
- Application-specific override：只适用于当前岗位或当前公司的回答。
- AI suggestion：只能生成建议，不能覆盖用户确认事实。
- Manual input：无法安全确定时由用户本人输入。

用户明确确认过的事实始终优先于 AI 推断。

## 5. 推荐数据模型

最终可能需要以下实体，实际字段要在每个阶段开始前由 Codex 检查现有 Prisma schema 后确定：

- `UserProfile`
- `MasterResume`
- `ResumeSection`
- `ResumeBullet`
- `TailoredResume`
- `JobPosting`
- `JobApplication`
- `ApplicationAnswer`
- `AnswerRule`
- `QuestionVariation`
- `CorrectionEvent`

不要一次性创建全部数据库表。每个阶段只新增当前功能必需的数据模型和 migration。

`JobPosting` 和 `JobApplication` 的数据模型含义不能混用：岗位被发现或分析时创建的是 posting / draft context；只有用户明确产生申请记录后才进入 application tracking。`Applied` 不能由 Extension 自动推断。

## 6. 分阶段开发计划

### Phase 0：稳定当前 MVP

目标：保证现有分析、PDF Upload、History 和认证稳定。

任务：

- 提交并部署当前 PDF Resume Upload。
- 检查生产环境 Clerk、PostgreSQL 和 OpenAI 配置。
- 加入基本 rate limiting。
- 加入隐私说明和用户数据删除入口规划。
- 保存 rubric sub-scores 是否需要留到后续单独决定。

完成标准：现有功能在本地和 Vercel 都可稳定使用。

### Phase 1：Master Profile

目标：用户不必每次重复输入固定资料。

任务：

- 设计 `/profile` 页面。
- 只保存第一版必要字段。
- 增加读取、更新和输入验证。
- 对敏感字段增加 confirmation policy。
- 区分稳定事实和动态偏好。
- 为字段保留 sensitivity / confirmation policy 的设计空间。
- 确保所有查询按当前用户隔离。

完成标准：登录用户可以保存、修改和重新加载自己的资料。

### Phase 2：Master Resume / Bullet Bank

目标：建立所有简历定制的唯一事实来源。

任务：

- 导入现有文本或 PDF 提取结果。
- 将 Experience、Projects、Education、Skills 结构化。
- 支持编辑和保存更多真实 bullet。
- 标注 bullet 标签和来源。
- 不允许 AI 自动增加无依据事实。
- 不允许 AI 直接修改 Master Resume / Bullet Bank。
- 用户确认后，新的真实 bullet 才能加入 Bullet Bank。

完成标准：用户可以维护一份结构化母版简历。

### Phase 3：Tailored Resume Generator

目标：根据 JD 生成完整、可编辑的定制简历。

任务：

- 分析 JD。
- 从 Master Resume 选择内容。
- 生成结构化定制结果。
- 增加事实一致性检查。
- 增加在线编辑、复制 Markdown 和版本保存。
- 后续增加 PDF 导出。
- 第一版不做复杂 resume template builder 或 PDF layout system。

完成标准：一个 JD 可以生成一份不编造事实的定制简历并保存版本。

### Phase 4：Application History

目标：追踪每份申请及其使用内容。

任务：

- 新增 `/applications`。
- 保存岗位、URL、状态、简历版本和日期。
- 支持手动创建和更新申请。
- 后续让 Extension 自动创建 Draft。

完成标准：用户可以查看每个岗位对应的简历和申请状态。

### Phase 5：Chrome Extension 基础设施

目标：插件可以登录并连接网站账户。

任务：

- 创建独立 extension workspace。
- 配置 Manifest V3。
- 建立 popup / side panel。
- 研究并实现安全的 extension authentication。
- 建立与 Next.js 后端的受保护通信。
- 不把永久 token 或 secret 写进 extension bundle。
- 在实现前单独评审 Chrome Extension、Next.js backend 和 Clerk 之间的认证方案。
- 明确 ATS adapter boundary，避免 Greenhouse / Lever / Workday 的 DOM logic 混入通用 content script。

完成标准：登录用户可以从插件安全访问自己的 Profile 和 Resume 数据。

### Phase 6：Greenhouse MVP

目标：第一个可用 ATS 集成。

任务：

- 识别 Greenhouse 页面。
- 提取 company、title、JD。
- 扫描表单 label、input type 和 required 状态。
- 用 ATS adapter 处理 DOM，不依赖一个通用脆弱选择器。
- 生成 Autofill Preview。
- 只填写安全、确定性的字段。
- 支持 deterministic safe field mapping。
- unknown field 进入 manual，而不是尝试硬猜。
- 不在 Phase 6 实现完整 Correction Memory / Answer Library learning。
- 用户自己上传简历并点击 Submit。

完成标准：一个真实 Greenhouse 申请可以在用户确认后完成大部分安全字段填写。

### Phase 7：Answer Library 和手动纠错

目标：插件能够从用户纠正中学习。

任务：

- 创建 `/answers` 页面。
- 创建 Manual Correction UI。
- 保存 Answer Rules 和 Correction Events。
- 支持仅本次、全局、公司级和需要确认四种策略。
- 实现 exact match 和基础 question normalization。
- 显示每个答案的来源。
- 实现用户确认后再保存 answer rule，AI 建议不能静默进入 Answer Library。

完成标准：用户纠正一次后，相同问题下次可以被正确建议或填写。

### Phase 8：相似问题智能匹配

目标：处理措辞不同但含义相同的问题。

任务：

- 增加 token similarity。
- 保存用户确认的 question variations。
- 设置 High / Medium / Low confidence。
- Medium 和敏感问题始终要求确认。
- 评估是否需要 embeddings；没有可靠收益就不增加。
- Sensitivity policy 优先于 confidence，High confidence 也不能跳过敏感问题确认。

完成标准：相似问题可以正确找到候选答案，同时低置信度不会乱填。

### Phase 9：更多 ATS

按照独立 adapter 顺序增加：

1. Lever
2. Workday
3. 其他高频 ATS

每增加一个 ATS，都要维护自己的 fixtures、selectors 和手动回归测试。

### Phase 10：可靠性和发布

任务：

- 权限最小化。
- CSP 和 extension security review。
- API rate limiting。
- 日志中移除简历和申请答案。
- 数据导出和删除。
- 错误恢复和 adapter 版本监控。
- Chrome Web Store 隐私披露。
- 完整的端到端测试。

完成标准：产品可以安全地给真实用户使用，而不是只在开发者电脑运行。

## 7. 每个阶段的固定工作方式

每次只做一个 Phase：

1. 在 Codex Plan Mode 中让它只读检查当前代码。
2. 明确本阶段功能范围和不做事项。
3. 让 Codex 列出数据库、API、认证和部署影响。
4. 审核计划后再进入正常模式实现。
5. 运行 lint、typecheck、build 和本阶段测试。
6. 本地手动验收。
7. 查看 `git diff` 和 `git status`。
8. 一个功能一个 commit。
9. Push 后检查 Vercel deployment。
10. 更新这份路线图的完成状态和下一步。

## 8. 当前立即下一步

当前不要直接开始 Extension。推荐顺序：

1. 确认 PDF Resume Upload 已提交、push 并成功部署。
2. 将当前项目的旧 `PROJECT_PLAN.md` 与本路线图进行整理，避免互相冲突。
3. 在 Plan Mode 设计 **Phase 1：Master Profile**。
4. Master Profile 验收后，再设计 Master Resume / Bullet Bank。

## 9. 当前决定记录

- Extension 最终需要支持多个岗位和多个 ATS。
- 第一版 ATS 选择 Greenhouse。
- Extension 只协助填写，不自动最终提交。
- 必须有 Autofill Preview。
- 必须有 Manual Correction 页面。
- 用户纠正的答案可以保存到 Answer Library。
- 数据来源必须可解释，Autofill Preview 必须显示 answer source。
- Extension 回答字段时优先使用 Master Profile / Master Resume / Application override，再按规则使用 Answer Library 和 AI suggestion。
- AI 不能静默修改 Master Profile、Master Resume / Bullet Bank 或 Answer Library。
- JobPosting 和 JobApplication 保持不同概念，`Analyze this job` 不代表 `Applied`。
- Field Classification 是 Extension 表单处理的前置步骤。
- ATS-specific DOM logic 必须隔离在 adapter boundary 内。
- Phase 6 Greenhouse MVP 聚焦 detection、extraction、field scanning、safe mapping、preview、user-confirmed filling 和 manual unknown fields。
- 相似问题通过检索和置信度匹配解决，不在第一版训练自定义模型。
- 敏感问题默认要求确认。
- Sensitivity policy 优先于 confidence。
- Master Resume 是所有定制简历的唯一事实来源。
