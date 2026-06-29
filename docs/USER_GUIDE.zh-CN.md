# ContextSpec 用户指南

本指南从头到尾讲清楚**ContextSpec 能做什么、怎么做**。ContextSpec 是一个本地优先、
角色化的 coding agent 上下文层:你把产品、角色、项目上下文**定义一次**,然后按当前的
角色和 initiative 编译成一份任务级的 *context pack* —— 不必每开一个 Claude Code 或
Codex 会话都把背景重讲一遍。

它不写代码、不跑 LLM、不做云同步。它是一个把"经过整理的 Markdown"编译成"agent 可用上下文"
的确定性编译器。

> 英文版见 [`USER_GUIDE.md`](./USER_GUIDE.md)。

---

## 1. 心智模型

```
.contextspec/(你来写)  ──contextspec 编译器──▶  context pack(按 角色 + 任务)
                                   │
                                   ├─▶ Claude Code slash 命令 (.claude/commands/)
                                   └─▶ Codex AGENTS.md(托管块)
```

- 你在 `.contextspec/` 下维护一小批 Markdown 文件。
- `registry.yaml` 声明每个角色加载哪些文件、每个 initiative 关联哪些角色/领域/项目。
- `contextspec pack` 只编译**与「某角色 + 某任务 + 某 initiative」相关的那一片**,
  汇成一份 Markdown pack。
- 宿主适配器(`generate-claude`、`generate-codex`)把同一套协议暴露成 slash 命令和
  `AGENTS.md`,让 agent 替你调用。

事实来源是这些**文件**,而不是生成出来的产物。

---

## 2. 安装

ContextSpec 尚未发布到 npm。先从本地 checkout 用 link:

```bash
cd /path/to/contextspec     # 本仓库
npm install && npm run build
npm link                    # 把 `contextspec` 挂到 PATH
contextspec --version       # -> 0.1.0
```

`npm link` 很关键:生成的 slash 命令和 `AGENTS.md` 里**写死了** `contextspec pack ...`,
二进制必须在 PATH 上它们才调得动。

不想 link 也可以直接调 bin:
`node /path/to/contextspec/bin/contextspec.js <command>`。

发布之后,本节就变成 `npm i -g contextspec`。

---

## 3. 五分钟上手

在你**真正想要 agent 上下文的那个项目**里执行:

```bash
cd ~/your-product

# 1. 生成 .contextspec/ 骨架
contextspec init

# 2. 只填最小集(见 §6 —— 不要全填):
#    context.md、principles.md、constraints.md,以及你会用到的那一个角色。

# 3. 为你接下来真要做的一件事建一个 initiative
contextspec create-initiative add-csv-export --role engineer

# 4. 填它的 brief.md(问题 / 为什么现在做 / 范围外)

# 5. 接入你的 agent
contextspec generate-claude    # .claude/commands/*.md
contextspec generate-codex     # AGENTS.md 托管块

# 6. 自检设置
contextspec validate           # exit 0 = 一致

# 7. 用起来
contextspec pack --role engineer --initiative add-csv-export --task handoff --stdout
#   ...或在 Claude Code 里:   /engineer-handoff add-csv-export
```

整个循环就是这些。后面都是细节。

---

## 4. 你能做什么(能力地图)

| 你想…… | 这样做 |
|---|---|
| 给项目搭上下文 | `contextspec init`,然后编辑 Markdown |
| 开始一件被跟踪的工作 | `contextspec create-initiative <id> [--role …]` |
| 用某角色视角评审 initiative | `/pm-review <id>` · `/growth-review <id>` · `/engineer-review <id>`(或 `pack --task review`) |
| 把工作从一个角色交接到另一个 | `/engineer-handoff <id>`(或 `pack --task handoff`) |
| 为任意 agent / 任意工具编译上下文 | `contextspec pack … --stdout`,再粘贴 / 管道 |
| 查看所有 initiative 的当前状态 | `/context-status` |
| 完成后沉淀经验 | `/context-retro <id>`,再确认它建议的 memory 修改 |
| 引用外部笔记(Obsidian 等) | 在 `registry.yaml` 里声明 `source:`,用 `source://id/path` 链接 |
| 检查设置是否一致 | `contextspec validate [--strict]` |
| 刷新 slash 命令 / AGENTS.md | 重跑 `generate-claude` / `generate-codex`(幂等) |

---

## 5. 概念与目录结构

`contextspec init` 生成:

```
.contextspec/
  context.md          # 产品是什么、给谁用、当前阶段 + 目标
  principles.md       # 必须守住的取舍与红线
  glossary.md         # 共享术语
  constraints.md      # 硬约束:技术栈、合规、不能动的东西
  roles/
    pm.md             # 每个角色:Mission / Owns / Needs / Reviews /
    growth.md         #   Output Contract / Cannot Decide / Checklist / ...
    engineer.md
  memory/
    anti-patterns.md      # append-only:踩过的坑
    experiment-results.md # append-only:赢的、输的、没结论的
  registry.yaml       # 事实来源:角色、includes、关联关系
```

下面这些是**按需手动添加**(`registry.yaml` 里有注释好的模板):

- **`roles/qa.md`** —— QA 角色。建文件,再在 `roles:` 下加 `qa:` 条目。
- **`domains/<name>/`** —— 业务领域上下文(onboarding、billing 的流程/指标/决策)。
  通过 `initiatives.<id>.domains` 关联到 initiative。
- **`projects/<name>.md`** —— 单仓库工程上下文(技术栈、测试/部署约定)。
  通过 `initiatives.<id>.projects` 关联。
- **`sources:`** —— 只读引用的外部知识库(见 §9)。

一个 **initiative**(`contextspec create-initiative`)是一个工作单元:

```
initiatives/<id>/
  brief.md         # 问题、为什么现在做、范围外
  context-map.md   # 指向 .contextspec 其余部分的索引
  plan.md          # 分阶段方案
  tasks.md         # 具体工作项
  acceptance.md    # 可观察的完成标准
  decisions.md     # 约束本 initiative 的决策
  reviews/<role>.md(可选)  # 角色评审产物
  retro.md         (可选)   # 收尾后的经验
  packs/           # 编译产物 —— 生成物,加进 gitignore
```

不必填满每个文件。有信号的就填,其余留着。

### X 该放哪?(放置规则)

```
稳定的产品事实        -> context.md
原则 / 红线           -> principles.md / constraints.md
业务领域知识          -> domains/<name>/
当前在做的事          -> initiatives/<id>/
仓库 / 部署约束       -> projects/<name>.md
某角色如何做判断      -> roles/<role>.md
确认过的长期经验      -> memory/
未经整理的外部笔记    -> 留在外部,用 source:// 引用
```

经验法则:只有**经过整理、与任务相关**的上下文才放进来。ContextSpec 不是用来堆所有笔记的——
那是 `source://` 引用该干的事。

---

## 6. 撰写你的上下文(这一步决定了它到底值不值得用)

模板是**有主张的,不是空白的**——但第一天**不要**逐字重写。那本身就是又一次"把背景全讲一遍"
的税。第一遍只填:

1. **`context.md`** —— 约 5 行:产品、用户、阶段、当前最重要的目标。
2. **`principles.md`** —— 3–5 条真实取舍("不要为了增长牺牲 onboarding 流畅度")。
3. **`constraints.md`** —— 硬性的"不"(技术栈、合规、不能碰的区域)。
4. **你真正会用到的那一个角色** —— 多半是 `roles/engineer.md`。把它的
   **Output Contract** 和 **Checklist** 改得贴合你的项目。其它角色先留模板,等用到再说。

其余(`glossary.md`、没用到的角色、domains、projects)都可以等真有任务需要时再补。
让上下文随着 agent 暴露出来的缺口逐步生长 —— 这才是设计意图,而不是一上来搞一个文档工程。

---

## 7. 日常工作流

### 7.1 用某角色视角评审 initiative

在 Claude Code 里:

```
/pm-review add-csv-export
/growth-review add-csv-export
/engineer-review add-csv-export
```

或用 CLI(把 pack 喂给任意 agent):

```bash
contextspec pack --role pm --initiative add-csv-export --stdout
```

agent 会读取该角色的 **Output Contract**,并按那个形态回应:问题定义、风险、checklist、
建议 —— 基于你的上下文,而不只是看 diff。

### 7.2 角色之间交接

```
/engineer-handoff add-csv-export
```

```bash
contextspec pack --role engineer --initiative add-csv-export --task handoff --stdout
```

在 agent 写代码**之前**跑这个:它会产出一份工程交接,业务约束、验收标准、风险都已就位。

### 7.3 为任意工具编译 pack

`pack` 是核心原语。可以配合 Cursor、Aider、裸 API 调用或直接粘贴使用:

```bash
# 默认写文件:initiatives/<id>/packs/<role>-<task>.md
contextspec pack --role engineer --initiative add-csv-export --task handoff

# 或打印到 stdout 以便管道 / 复制
contextspec pack --role engineer --initiative add-csv-export --task handoff --stdout > brief.md
```

一份 pack 是一份 Markdown 文档,段落顺序固定:Task → Global Context → Role Context →
Domain Context → Initiative Context → Project Context → Relevant Memory →
Review Checklist → Output Contract → Sources。

当一个 initiative 跨多个仓库时,用 `--project <name>` 限定到其中一个关联项目。

### 7.4 查看当前状态

```
/context-status
```

基于你的 `.contextspec/initiatives/*` 对活跃 initiative、未决决策、待评审项进行推理。
(不接任何外部项目管理工具——它读你的文件。)

### 7.5 复盘:把经验回灌

```
/context-retro add-csv-export
```

agent 会**建议**对 `memory/`、角色 checklist 或领域上下文的修改。你审阅后自己落地。
ContextSpec 永远不会自动写 `memory/`、角色文件或你的正文 —— 只有经确认的 memory。

---

## 8. 在不同宿主里使用

**Claude Code。** `contextspec generate-claude` 把幂等的 slash 命令写到
`.claude/commands/`。默认 3 个角色下你会得到:`pm-review`、`growth-review`、
`engineer-handoff`、`engineer-review`,外加 `context-status`、`context-retro`。
加一个 `qa` 角色就会有 `qa-review`。重跑会逐字节刷新它们;用 `--no-force` 可保留你对其它
命令的手动修改。

**Codex。** `contextspec generate-codex` 在 `AGENTS.md` 里写一个托管块,由
`<!-- contextspec:begin -->` / `<!-- contextspec:end -->` 界定。**标记之外的一切都不动** ——
你自己的团队规则和约定在每次重生成时都安然无恙。重跑是字节稳定的。

**其它工具。** 用 `contextspec pack … --stdout`,再按那个工具吃上下文的方式交给它。

---

## 9. 引用外部知识(`source://`)

把原始笔记留在原处(Obsidian、Notion 导出、本地 Markdown),只读引用。在 `registry.yaml` 里:

```yaml
sources:
  notes:
    type: markdown_dir
    path: ~/notes
    include:
      - "Customers/**"
      - "Decisions/**"
    exclude:
      - "Daily/**"
      - "Private/**"
    mode: reference_only
```

然后在任意整理过的文件里链接:

```md
见这次流失访谈 [Q2 笔记](source://notes/Customers/q2-churn.md)。
```

`pack` 会把这些链接汇总到 pack 的 `## Sources` 段,并对每条按该 source 的
`include`/`exclude` glob 校验。`exclude` 优先于 `include`。这能防止 `.contextspec/`
悄悄变成第二个知识库 —— 跨越边界的只是引用,不是原始内容。

---

## 10. 保持设置健康

```bash
contextspec validate          # 引用文件存在吗?关联声明了吗?source:// 允许吗?
contextspec validate --strict # 额外标记:已提交的 pack 相对 source 是否过期
contextspec validate --quiet  # 只看 exit code,供脚本 / CI 用
```

在编辑 `registry.yaml` 之后、重生成之前、以及 CI 里都跑一下 `validate`。错误每条一行,
指明文件和出问题的 key —— 没有堆栈跟踪。

**你可以依赖的保证:**

- **确定性。** 相同输入 + 相同 `generated_at` → 字节完全一致的输出。生成文件在 PR 里 diff 干净。
- **编译不调 LLM。** `pack` 是纯文件拼装;无网络、无模型。
- **绝不覆盖你手写的文件。** CLI 只写:pack 产物、`.claude/commands/*`、`AGENTS.md` 的托管块,
  以及 `init`/`create-initiative` 创建的文件(除非 `--force`)。它不会碰你的上下文文件、
  角色文件、`memory/`,也不碰托管块之外的 `AGENTS.md`。

---

## 11. 命令速查

```bash
contextspec init [--cwd <path>] [--force]
contextspec create-initiative <id> [--role <r>]… [--domain <d>]… [--project <p>]… [--force]
contextspec pack --role <r> --initiative <id> [--task <t>] [--project <p>] [--cwd <path>] [--stdout]
contextspec generate-claude [--cwd <path>] [--no-force]
contextspec generate-codex  [--cwd <path>]
contextspec validate [--strict] [--quiet] [--cwd <path>]
```

- `pack --task` 默认 `review`。交接用 `--task handoff`。
- `create-initiative` 的 `--role/--domain/--project` 可重复;默认关联所有已声明角色。
- 生成的 pack 落在 `initiatives/<id>/packs/` —— 把这个目录加进 gitignore。

---

## 12. 易踩的坑

- **initiative id 只能是 kebab-case** —— 小写、连字符,不能有点或下划线,不能数字开头。
  `add-csv-export` ✓,`add_csv` ✗,`v0.1` ✗。版本号写进 brief,别放进 id。
- **发布前必须 `npm link`(或用完整 bin 路径)** —— 否则生成的 slash 命令找不到 `contextspec`。
- **两种命令形态都能用** —— `create-initiative` 和 `create initiative` 都能解析,
  `generate claude/codex` 同理。优先用带连字符的单 token 形态;带空格的形态在全局 flag 在前时
  可能误解析。
- **`packs/` 是生成物** —— 别手改,加 gitignore。源文件才是事实来源。
- **QA、domains、projects 是 opt-in** —— `init` 只给 context + pm/growth/engineer。
  其余通过编辑 `registry.yaml` 并创建对应文件来添加。

---

## 13. ContextSpec 不适合做什么

- 不是项目管理工具(没有 ticket、没有看板)。
- 不是知识库或笔记编辑器 —— 引用外部笔记,而不是把它们存在这里。
- 不是代码生成器,也不是多 agent 编排框架。
- 不是云服务 —— 设计上就是 git 下的本地文件。

它只干一件事:在合适的时机,把合适的结构化上下文,按当前的角色和任务,**每次都新鲜编译**地交给 agent。

---

*另见:[`README.md`](../README.md) 看定位、`VISION.md` 看初衷、
`CONTEXTSPEC_V0_1_SPEC.md` 看协议、`docs/v0-1-implementation-notes.md` 看实现。*
