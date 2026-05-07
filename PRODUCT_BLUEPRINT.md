可以。现在已经足够输出一个**初版产品蓝图**了。

我的判断是：目前不缺“愿景”，真正缺的是把愿景压缩成一个可验证的 MVP。所以这版蓝图应该刻意克制，不追求完整组织操作系统，而是先定义一个清晰的早期产品：

> **ContextSpec：面向 Claude Code / Codex 的角色化上下文框架。**

---

# ContextSpec 初版蓝图

## 1. 一句话定位

**ContextSpec 是一个本地优先的角色化上下文框架，帮助 Claude Code、Codex 等 coding agent 在执行任务前自动获得正确的产品、业务、工程、QA 和历史决策上下文。**

更短的版本：

> Role-based context for coding agents.

中文：

> 给 coding agent 用的角色化上下文层。

---

# 2. 要解决的问题

现在 AI coding agent 越来越强，但在真实项目中经常失败在“上下文”上，而不是代码能力上。

典型问题包括：

```text
1. 每次新对话都要重新解释产品背景。
2. Agent 只理解代码，不理解业务流程和组织经验。
3. PM、增长、商业化、QA、工程等职能上下文散落在不同文档或人的脑子里。
4. Coding agent 不知道当前功能为什么要做、不该破坏什么、如何验收。
5. 历史决策、失败实验、客户承诺、产品原则没有进入 agent 工作流。
6. 多个项目、多个 repo、多个角色之间缺少统一上下文源。
```

所以核心问题不是：

> 如何让 AI 写更多代码？

而是：

> 如何让 AI 在写代码前理解正确的上下文？

---

# 3. 目标用户

## P0：AI-native solo founder / 独立开发者

这是第一优先级用户。

他们通常一人多职：

```text
产品经理
工程师
增长负责人
商业化负责人
QA
项目经理
```

他们已经在用 Claude Code / Codex / Cursor，但经常需要重复向 agent 解释：

```text
我的产品是什么
用户是谁
当前目标是什么
为什么这个功能重要
过去踩过什么坑
哪些东西不能改
怎么验收
```

ContextSpec 对他们的价值是：

> 让一个人拥有一个可复用的“虚拟产品团队上下文”。

---

## P1：2–10 人 AI-native 小团队

这类团队的问题是：

```text
每个人都在用 agent，但 agent 看到的上下文不一致。
PM 的判断没有进入工程 agent。
增长实验没有进入产品规划。
工程约束没有进入需求讨论。
QA 每次都要重新理解功能目标。
```

ContextSpec 对他们的价值是：

> 让团队和 agent 使用同一套上下文 source of truth。

---

## P2：AI workflow owner / 技术负责人

他们关心的是：

```text
如何标准化团队使用 Claude Code / Codex 的方式？
如何管理 AGENTS.md、slash commands、skills、review checklist？
如何避免每个人写一套自己的 prompt？
```

ContextSpec 对他们的价值是：

> 给团队提供一套 agent 上下文和工作流协议。

---

# 4. 不做什么

第一版非常重要的一点是明确边界。

ContextSpec 初版**不做**：

```text
不做完整企业知识库
不做 Notion/Confluence 替代品
不做 Jira/Linear 替代品
不做复杂多 agent 自动协作
不做权限系统
不做实时同步所有工具
不做复杂 UI
不做大而全组织管理平台
```

第一版只做：

> 把项目/组织上下文编译成 Claude Code / Codex 可用的角色化 context pack 和工作流命令。

## 4.1 知识库边界

个人开发者通常已经有自己的知识库，例如：

```text
Obsidian
Notion
Logseq
Apple Notes
本地 Markdown
项目 docs
客户访谈记录
产品日记
历史决策
```

ContextSpec 需要考虑这些资料，因为它们经常包含产品原则、客户反馈、失败实验、工程偏好和历史决策。

但 ContextSpec **不应该做个人知识库**。

更准确的边界是：

> Personal knowledge bases store raw knowledge. ContextSpec curates agent-ready context.

中文：

> 个人知识库存原始知识，ContextSpec 管 agent 可执行上下文。

所以 ContextSpec 可以：

```text
引用个人知识库里的资料
从笔记和文档中提取候选上下文
把用户确认过的内容沉淀到 memory / domain / context
在 context pack 中标注来源
```

但初版不做：

```text
笔记编辑器
双链知识库
全文搜索产品
网页剪藏
Notion / Obsidian 双向同步
自动 RAG 平台
原始文档长期归档系统
```

ContextSpec 的 source of truth 应该是经过筛选、压缩、可复用、适合 agent 执行任务前读取的上下文，而不是用户的全部原始知识。

---

# 5. 核心概念

ContextSpec 初版有 6 个核心对象，外加 1 个轻量辅助对象。

---

## 5.1 Context

通用上下文。

包括：

```text
产品是什么
目标用户是谁
当前阶段是什么
核心原则是什么
业务约束是什么
技术约束是什么
术语表是什么
```

示例文件：

```text
.contextspec/
  context.md
  principles.md
  glossary.md
  constraints.md
```

---

## 5.2 Role

角色上下文。

角色不是 persona，而是：

> 职责边界 + 所需上下文 + 审查标准 + 输出契约。

初版内置角色：

```text
PM
Growth
Monetization
Engineer
QA
Reviewer
Coordinator
```

每个角色定义：

```yaml
id: growth
name: Growth Manager
mission: 负责增长目标、激活、转化、留存相关判断

owns:
  - funnel metrics
  - activation definition
  - experiment design

needs:
  - product context
  - current metrics
  - domain flows
  - experiment history

reviews:
  - growth hypothesis
  - metric instrumentation
  - funnel impact
  - experiment risk

outputs:
  - growth assessment
  - required metrics
  - experiment proposal
  - risks
  - recommendation

cannot_decide:
  - final roadmap priority
  - engineering implementation details
```

---

## 5.3 Domain

业务领域上下文。

例如：

```text
onboarding
billing
team collaboration
enterprise
analytics
pricing
notifications
```

示例：

```text
.contextspec/
  domains/
    onboarding/
      context.md
      flows.md
      metrics.md
      decisions.md
    billing/
      context.md
      pricing.md
      constraints.md
```

Domain 解决的是：

> 某个功能属于哪个业务领域，这个领域有哪些流程、指标、限制和历史决策。

---

## 5.4 Initiative

一个正在推进的功能、项目、实验或变更。

例如：

```text
improve-team-invite-conversion
new-billing-page
enterprise-sso
activation-email-experiment
```

示例结构：

```text
.contextspec/
  initiatives/
    improve-team-invite-conversion/
      brief.md
      context-map.md
      plan.md
      tasks.md
      acceptance.md
      decisions.md
      reviews/
        pm.md
        growth.md
        engineer.md
        qa.md
      retro.md
```

Initiative 是 ContextSpec 的工作流中心。

---

## 5.5 Project

代码项目或 repo 的上下文。

例如：

```text
.contextspec/
  projects/
    web-app.md
    backend.md
    landing-page.md
```

里面可以写：

```text
repo 路径
技术栈
代码规范
测试方式
部署方式
相关 OpenSpec changes
相关 AGENTS.md
```

---

## 5.6 Memory

经过沉淀的长期经验。

不是聊天记录，不是原始日志，而是压缩过、可复用的经验。

例如：

```text
.contextspec/
  memory/
    lessons.md
    anti-patterns.md
    experiment-results.md
    customer-feedback.md
    incidents.md
```

Memory 里放：

```text
过去哪些实验失败了
哪些产品决策不能重复争论
客户最常见反馈是什么
上线踩过什么坑
哪些工程反模式要避免
```

---

## 5.7 Source（轻量辅助对象）

Source 用来声明外部资料来源，例如个人知识库、项目文档、客户访谈目录或历史决策文件。

Source 不是新的知识库，也不是 ContextSpec 的核心工作流对象。它只回答：

```text
外部资料在哪里？
哪些内容可以被引用？
哪些内容不能读取？
是否只读？
是否允许导入摘要？
```

示例：

```yaml
sources:
  personal_knowledge_base:
    type: markdown_dir
    path: ~/ObsidianVault
    include:
      - Product/**
      - Customers/**
      - Decisions/**
    exclude:
      - Daily/**
      - Private/**
    mode: reference_only
```

初版可以只在协议中预留 Source，不必实现复杂导入或同步。后续如果支持导入，也应该采用：

```text
扫描原始资料
生成候选摘要
标注来源
用户确认
写入 .contextspec/memory 或 .contextspec/domains
```

避免把未经审查的原始笔记直接污染 ContextSpec memory。

---

# 6. 推荐目录结构

初版目录可以这样：

```text
.contextspec/
  context.md
  principles.md
  glossary.md
  constraints.md

  roles/
    pm.md
    growth.md
    monetization.md
    engineer.md
    qa.md
    reviewer.md
    coordinator.md

  domains/
    onboarding/
      context.md
      flows.md
      metrics.md
      decisions.md
    billing/
      context.md
      pricing.md
      constraints.md
    enterprise/
      context.md
      customer-commitments.md

  initiatives/
    improve-team-invite-conversion/
      brief.md
      context-map.md
      plan.md
      tasks.md
      acceptance.md
      decisions.md
      reviews/
        pm.md
        growth.md
        monetization.md
        engineer.md
        qa.md
      retro.md

  projects/
    web-app.md
    backend.md

  memory/
    lessons.md
    experiment-results.md
    customer-feedback.md
    anti-patterns.md

  sources/
    personal-knowledge.md

  registry.yaml
```

---

# 7. registry.yaml

`registry.yaml` 是 ContextSpec 的核心。

它声明：

```text
有哪些角色
每个角色默认加载哪些上下文
有哪些 domain
每个 initiative 关联哪些 domain、role、project
每个 project 对应哪个 repo
Claude/Codex 应该生成哪些命令或 skill
```

示例：

```yaml
version: 0.1

context:
  includes:
    - context.md
    - principles.md
    - glossary.md
    - constraints.md

sources:
  personal_knowledge_base:
    type: markdown_dir
    path: ~/ObsidianVault
    include:
      - Product/**
      - Customers/**
      - Decisions/**
    exclude:
      - Daily/**
      - Private/**
    mode: reference_only

roles:
  pm:
    file: roles/pm.md
    includes:
      - context.md
      - principles.md
      - memory/customer-feedback.md

  growth:
    file: roles/growth.md
    includes:
      - context.md
      - principles.md
      - memory/experiment-results.md

  engineer:
    file: roles/engineer.md
    includes:
      - context.md
      - principles.md
      - memory/anti-patterns.md

  qa:
    file: roles/qa.md
    includes:
      - context.md
      - principles.md

domains:
  onboarding:
    includes:
      - domains/onboarding/context.md
      - domains/onboarding/flows.md
      - domains/onboarding/metrics.md
      - domains/onboarding/decisions.md

projects:
  web-app:
    repo: ../web-app
    includes:
      - projects/web-app.md

initiatives:
  improve-team-invite-conversion:
    path: initiatives/improve-team-invite-conversion
    roles:
      - pm
      - growth
      - engineer
      - qa
    domains:
      - onboarding
    projects:
      - web-app
```

---

# 8. 核心机制：Context Pack

ContextSpec 本质上是一个 **context compiler**。

输入：

```yaml
role: growth
task: review
initiative: improve-team-invite-conversion
project: web-app
```

输出：

```text
一个适合喂给 Claude Code / Codex 的 context pack
```

Context Pack 应该包含：

```text
1. 当前任务
2. 通用产品/组织上下文
3. 角色职责
4. 相关业务领域上下文
5. initiative 背景
6. 项目/repo 约束
7. 历史经验
8. 决策记录
9. 输出格式
10. 审查 checklist
11. 禁止事项
12. 引用来源
```

示例输出结构：

```md
# Context Pack

## Task
Review the initiative from the Growth Manager perspective.

## Global Context
...

## Role Context
...

## Domain Context
...

## Initiative Context
...

## Project Context
...

## Relevant Memory
...

## Review Checklist
...

## Output Contract
...

## Sources
...
```

这是整个产品最核心的能力。

---

# 9. 核心工作流

初版只需要支持 5 个主流程。

---

## 9.1 Create Initiative

创建一个新功能/项目/实验。

```bash
contextspec create initiative improve-team-invite-conversion
```

生成：

```text
brief.md
context-map.md
plan.md
tasks.md
acceptance.md
decisions.md
reviews/
retro.md
```

目的：

> 把一个模糊想法变成可被角色评审和 agent 执行的结构化 initiative。

---

## 9.2 Role Review

按角色评审 initiative。

```bash
contextspec review --role growth --initiative improve-team-invite-conversion
```

或在 Claude Code 里：

```text
/growth-review improve-team-invite-conversion
```

输出：

```text
增长影响
漏斗影响
指标要求
实验设计
风险
建议
```

其他角色：

```text
/pm-review
/monetization-review
/engineer-review
/qa-review
```

---

## 9.3 Handoff

角色之间交接。

例如 PM → Engineer：

```bash
contextspec handoff --from pm --to engineer --initiative improve-team-invite-conversion
```

输出：

```md
# PM → Engineer Handoff

## Problem
## User Stories
## Non-goals
## Business Constraints
## UX Requirements
## Engineering Considerations
## Acceptance Criteria
## Open Questions
```

也可以有：

```text
growth → pm
pm → engineer
engineer → qa
qa → release
```

---

## 9.4 Status

查看整体节奏。

```bash
contextspec status
```

或：

```text
/context-status
```

输出：

```text
当前活跃 initiatives
待决策事项
待评审事项
blockers
近期风险
建议下一步
```

初版只读取 `.contextspec/initiatives/*`，不要做复杂项目管理。

---

## 9.5 Retro

任务结束后沉淀经验。

```bash
contextspec retro improve-team-invite-conversion
```

输出：

```text
本次完成了什么
哪些决策应该保留
哪些经验应该写入 memory
哪些 domain context 需要更新
哪些 role checklist 需要更新
```

关键是：

> ContextSpec 不能只消费上下文，还要帮助维护上下文。

但初版不要自动乱写。建议采用：

```text
agent 建议更新
用户确认
写入对应文件
```

---

# 10. Claude Code 适配

ContextSpec 应该优先支持 Claude Code，因为你的目标用户很可能已经在用 slash commands。

可以生成：

```text
.claude/
  commands/
    pm-review.md
    growth-review.md
    monetization-review.md
    engineer-review.md
    qa-review.md
    context-status.md
    context-retro.md
```

命令示例：

```text
/growth-review improve-team-invite-conversion
```

命令内部逻辑：

```md
Use ContextSpec to load the context pack for:
- role: growth
- task: review
- initiative: $ARGUMENTS

Then produce the Growth Review output according to the role output contract.
```

早期可以不做复杂 runtime，只生成 markdown command，让 Claude Code 调用本地文件。

更进一步可以做 CLI：

```bash
contextspec generate claude
```

---

# 11. Codex 适配

Codex 适配建议分两层。

## 11.1 AGENTS.md

生成或更新：

```text
AGENTS.md
```

内容包括：

```text
项目如何使用 ContextSpec
上下文目录在哪里
执行任务前应该先读取哪些文件
如何调用角色化 review
如何更新 memory
```

示例：

```md
# Agent Instructions

This project uses ContextSpec.

Before starting non-trivial product or code changes:
1. Read `.contextspec/context.md`
2. Read relevant role context from `.contextspec/roles/`
3. Read the initiative context if provided
4. Generate or inspect the appropriate context pack
5. Follow the output contract for the selected role
```

## 11.2 Codex Skills

后续可以生成：

```text
.codex/
  skills/
    pm-review/
    growth-review/
    qa-review/
    engineer-handoff/
```

每个 skill 是一个可复用任务能力。

初版可以先做 AGENTS.md，Skills 放到第二阶段。

---

# 12. CLI 初版

CLI 不需要复杂。

建议命令：

```bash
contextspec init
contextspec create initiative <name>
contextspec pack --role <role> --initiative <name>
contextspec review --role <role> --initiative <name>
contextspec handoff --from <role> --to <role> --initiative <name>
contextspec status
contextspec retro <initiative>
contextspec generate claude
contextspec generate codex
```

如果觉得 `contextspec` 太长，可以后续加 alias：

```bash
cspec
```

但第一版用全名更清晰。

---

# 13. MVP 范围

## MVP 必须有

```text
1. .contextspec/ 文件协议
2. role 模板
3. initiative 模板
4. registry.yaml
5. context pack 生成
6. Claude Code command 生成
7. Codex AGENTS.md 生成
8. role review 工作流
9. handoff 工作流
10. retro 建议更新
```

## MVP 可以没有

```text
1. UI
2. 云同步
3. 权限系统
4. 向量数据库
5. 自动多 agent 协作
6. Linear/Jira/GitHub 深度集成
7. 大规模文档导入
8. 团队成员管理
```

## MVP 需要明确但不必实现

```text
1. 个人知识库边界
2. 外部 source 的引用规则
3. memory 的人工确认更新规则
4. context pack 的来源标注
```

也就是说，v0.1 要回答“用户已有个人知识库怎么办”，但不需要实现 Notion sync、Obsidian plugin、向量搜索或大规模导入。

---

# 14. 第一版用户体验

## 初始化

```bash
contextspec init
```

系统询问：

```text
你的产品/项目是什么？
目标用户是谁？
当前阶段是什么？
当前最重要目标是什么？
你想启用哪些角色？
有哪些代码项目？
```

生成 `.contextspec/`。

---

## 创建 initiative

```bash
contextspec create initiative improve-team-invite-conversion
```

生成 initiative 文件。

---

## 让 PM 整理需求

```text
/pm-review improve-team-invite-conversion
```

输出：

```text
问题定义
目标用户
用户故事
非目标
优先级判断
风险
open questions
```

---

## 让 Growth 评审

```text
/growth-review improve-team-invite-conversion
```

输出：

```text
增长假设
漏斗影响
埋点要求
实验设计
成功指标
风险
建议
```

---

## PM → Engineer 交接

```text
/engineer-handoff improve-team-invite-conversion
```

输出：

```text
工程任务背景
业务约束
功能要求
边界条件
验收标准
技术风险
```

---

## QA 验收

```text
/qa-review improve-team-invite-conversion
```

输出：

```text
测试计划
核心路径
异常路径
回归风险
验收 checklist
上线观察项
```

---

## 复盘沉淀

```text
/context-retro improve-team-invite-conversion
```

输出：

```text
建议更新 memory/lessons.md
建议更新 domains/onboarding/metrics.md
建议更新 roles/growth.md 的 checklist
```

---

# 15. 和 OpenSpec / Spec Kit 的关系

ContextSpec 不应该直接替代 OpenSpec。

更好的关系是：

```text
ContextSpec
  管产品、业务、角色、历史经验、initiative、跨职能评审

OpenSpec / Spec Kit
  管具体代码仓库里的 change、spec、design、tasks

Claude Code / Codex
  执行具体实现、修改代码、运行测试
```

流程是：

```text
ContextSpec initiative
→ role review
→ PM/Engineer handoff
→ OpenSpec change / Spec Kit spec
→ Claude Code / Codex implementation
→ QA review
→ retro memory update
```

ContextSpec 是上游上下文层。

---

# 16. 产品差异化

ContextSpec 和常见工具的区别：

| 工具                                   | 管什么       | ContextSpec 的区别                           |
| ------------------------------------ | --------- | ----------------------------------------- |
| Notion / Confluence                  | 文档和知识库    | ContextSpec 把上下文变成 agent 可执行 context pack |
| Linear / Jira                        | 任务和 issue | ContextSpec 管任务背后的角色判断和业务上下文              |
| Cursor Rules / CLAUDE.md / AGENTS.md | agent 指令  | ContextSpec 是这些指令的 source of truth 和生成器   |
| OpenSpec / Spec Kit                  | 代码变更规格    | ContextSpec 管更上游的组织/产品/角色上下文              |
| Multi-agent frameworks               | agent 编排  | ContextSpec 先解决上下文装配，不急着自动协作              |

---

# 17. 初版价值主张

对 solo founder：

> 不再每次向 Claude/Codex 重讲产品背景。让 AI 像长期团队成员一样理解你的产品、业务和决策。

对小团队：

> 让 PM、增长、工程、QA 和 agent 使用同一套上下文 source of truth。

对 AI workflow owner：

> 标准化团队使用 Claude Code / Codex 的上下文、角色命令和工作流。

---

# 18. 还缺什么？

可以输出蓝图，但确实还有一些缺失，需要后续决策。

## 缺失 1：Context Pack 的具体格式

现在我们知道要生成 context pack，但还没定：

```text
是 markdown？
是 YAML + markdown？
是否包含 source citation？
是否每个 section 有 token budget？
是否允许 agent 修改？
```

我建议初版用 Markdown，带 frontmatter：

```md
---
role: growth
task: review
initiative: improve-team-invite-conversion
generated_at: 2026-05-08
sources:
  - context.md
  - roles/growth.md
  - domains/onboarding/metrics.md
---

# Context Pack
...
```

---

## 缺失 2：上下文优先级和冲突处理

真实项目中经常会有冲突：

```text
principles.md 说不要增加 onboarding friction
growth.md 说要收集更多用户信息
billing.md 说免费用户不能使用某功能
```

需要定义：

```text
哪个上下文优先级更高？
冲突时 agent 是否必须提示？
是否生成 conflict report？
```

初版可以简单做：

```yaml
priority:
  constraints.md: 100
  principles.md: 90
  initiative/brief.md: 80
  role.md: 70
  memory.md: 50
```

---

## 缺失 3：Memory 的更新规则

这很关键。

如果 memory 不更新，ContextSpec 会变成静态模板。
如果 memory 自动乱更新，又会污染上下文。

初版建议：

```text
agent 只能建议 memory update
用户确认后才写入
每次 retro 输出 proposed diffs
```

---

## 缺失 4：角色模板的质量

这可能是 MVP 成败关键。

如果内置角色只是普通 prompt，价值会很弱。

你需要认真打磨：

```text
PM role
Growth role
Monetization role
Engineer role
QA role
Reviewer role
Coordinator role
```

每个角色都要有：

```text
使命
负责范围
需要读取的上下文
审查 checklist
输出格式
不能决定什么
常见误区
任务结束后应该更新什么
```

---

## 缺失 5：Claude Code 与 Codex 的实际调用方式

需要具体验证：

```text
Claude Code slash command 能否顺畅调用 contextspec pack？
Codex 是否适合通过 AGENTS.md 指导读取 .contextspec？
Codex Skills 是否适合第二阶段集成？
```

这部分需要真实原型测试。

---

## 缺失 6：是否支持独立 context repo

需要做一个决策。

我建议支持两种：

```text
project-local mode:
  .contextspec/ 放在代码仓库里

context-repo mode:
  单独一个 context repo，引用多个代码 repo
```

但 MVP 默认：

```text
project-local mode
```

原因是最简单、最容易被 Claude Code / Codex 读取。

第二阶段支持：

```text
contextspec link-project ../web-app
contextspec link-project ../backend
```

---

## 缺失 7：个人知识库与 Source 规则

需要定义：

```text
个人知识库是否只读？
外部 source 是否进入 registry.yaml？
context pack 是否允许直接引用外部文件？
导入时如何生成摘要和来源？
memory 更新是否必须人工确认？
哪些目录或标签默认排除？
```

初版建议：

```text
Source 只做 reference_only 协议预留
不做自动同步
不做向量检索
不把原始笔记批量复制进 .contextspec
只允许用户确认后的摘要进入 memory / domain / context
```

---

## 缺失 8：名字还需要做可用性检查

目前推荐名是：

```text
ContextSpec
```

但正式使用前需要检查：

```text
GitHub repo
npm package
PyPI package
Homebrew formula
域名
已有商标或同名项目
```

如果不可用，可以备选：

```text
AgentContext
AgentSpec
ContextKit
TeamSpec
AgentPlaybook
```

---

# 19. 我建议的开发路线

## Phase 0：手工验证

不写工具。

手动创建：

```text
.contextspec/
roles/
initiatives/
memory/
```

用真实项目测试：

```text
普通 prompt vs ContextSpec context pack
```

验证输出质量是否明显提升。

---

## Phase 1：文件协议 + 模板

实现：

```text
contextspec init
contextspec create initiative
内置 role templates
```

目标：

> 让用户能快速生成结构化上下文仓库。

---

## Phase 2：Context Pack 编译器

实现：

```text
contextspec pack --role growth --initiative xxx
```

支持：

```text
registry.yaml
context-map.md
role includes
domain includes
project includes
memory includes
```

目标：

> 自动生成给 agent 使用的上下文包。

---

## Phase 3：Claude Code / Codex 集成

实现：

```text
contextspec generate claude
contextspec generate codex
```

生成：

```text
.claude/commands/*
AGENTS.md
```

目标：

> 用户可以直接在 Claude Code / Codex 工作流里调用角色 review。

---

## Phase 4：Review / Handoff / Retro 工作流

实现：

```text
contextspec review
contextspec handoff
contextspec status
contextspec retro
```

目标：

> 从上下文管理进入真实产品开发流程。

---

## Phase 5：多项目 / context repo

实现：

```text
contextspec init --mode context-repo
contextspec link-project
```

目标：

> 支持更接近“小团队组织上下文”的使用方式。

---

# 20. 初版 README 可以这样写

```md
# ContextSpec

Role-based context for Claude Code and Codex.

ContextSpec helps AI-native builders and small teams turn product, business, engineering, QA, and decision knowledge into structured context packs for coding agents.

## Status

ContextSpec is currently in product and protocol design. The next implementation target is the v0.1 local file protocol and context pack compiler described in `CONTEXTSPEC_V0_1_SPEC.md`.

## Why ContextSpec

Instead of repeating the same background in every AI session, you define your context once:

- product context
- role responsibilities
- domain knowledge
- active initiatives
- project constraints
- lessons and decisions

Then use role-based commands like:

/pm-review improve-invite-flow
/growth-review improve-invite-flow
/engineer-handoff improve-invite-flow
/qa-review improve-invite-flow

## Knowledge base boundary

ContextSpec is not a project management tool or a knowledge base.
It is a local-first context layer for AI coding workflows.

Personal knowledge bases store raw knowledge. ContextSpec curates agent-ready context.
It can reference or distill notes, docs, customer feedback, and decisions from tools like Obsidian, Notion, Logseq, or local Markdown, but its source of truth is reviewed, task-relevant context that can be compiled into role-based context packs.

## Planned v0.1

- `.contextspec/` file protocol
- `registry.yaml` schema
- PM, Growth, Engineer, and QA role templates
- initiative templates
- Markdown context pack generation
- Claude Code slash command generation
- Codex `AGENTS.md` generation
```

---

# 21. 我的结论

现在已经可以进入初版设计阶段。

我建议当前版本定为：

```text
Name: ContextSpec
Positioning: Role-based context for Claude Code and Codex
Audience: AI-native solo founders and small teams
Core: context pack compiler
MVP: files + CLI + Claude commands + Codex AGENTS.md
Workflow: initiative → role review → handoff → implementation → QA → retro
```

还有缺失，但不是阻塞项。

真正需要马上补齐的是这 6 个：

```text
1. Context Pack 格式
2. Role 模板细节
3. registry.yaml schema
4. Claude Code / Codex 生成方式
5. 个人知识库 / Source 边界
6. 一个真实项目的手工验证样例
```

下一步最适合做的不是继续扩愿景，而是直接写：

> **ContextSpec v0.1 Spec**

也就是把文件结构、schema、命令、角色模板、context pack 格式具体定下来。
