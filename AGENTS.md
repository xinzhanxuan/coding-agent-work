# Repo Agent Execution Guide

本仓库的总目标：

> 输入一个 Issue（或报错/需求），自动在 repo 里定位相关代码 -> 生成最小 diff -> 应用 -> 运行验证（lint/tsc/test/build）-> 失败后根据日志再修复 -> 最终产出可合并 PR + 全链路日志。

## 北极星定位（2026-03-17）

这个仓库不是在做“会调工具的聊天机器人”，而是在逐步做成一个面向真实仓库的 `issue -> patch -> verify -> PR` 软件工程执行系统。

长期目标按 8 层理解：

1. 任务入口层：chat / issue / PR comment / CI failure
2. 编排层：state machine / workflow graph / durable execution
3. 模型层：planner / coder / verifier / reviewer 的职责拆分
4. 工具层：retrieve / file ops / shell / git / external systems
5. runtime 层：隔离 workspace、受控执行、可审计
6. context 层：repo context / skills / playbooks / policy
7. 治理层：权限、审批、风险分级、审计
8. eval/observability 层：trace、回放、基准任务、线上指标

当前仓库仍处于 `单仓库、单 runtime、半自动` 阶段。近期工作不是把 8 层一次性做完，而是把它们压缩进一个可演进的 MVP 骨架里。

## 当前基线（2026-03-17）

你已经有以下基础能力：

- CLI 入口：`agent/src/cli/index.ts`
- 流程编排：`agent/src/app/run-fix-task.ts`
- 测试执行：`agent/src/verification/run-tests.ts`
- 基础检索：`agent/src/retrieval/retrieve-evidence.ts` + `agent/src/infra/search-files.ts`
- 日志落盘：`agent/src/artifacts/save-run-record.ts`（JSON）

缺口主要在：`LLM patch 生成`、`apply patch`、`验证闭环重试`、`Git/PR 交付`、`评估指标`。

当前默认任务形态仍是：

- 输入：单条 issue / 报错描述
- 环境：本地 repo 路径
- 执行：一次 retrieve + verify
- 产物：`runs/*.json`

不要误判当前成熟度。现阶段代码更接近“状态机骨架 + 可观测底座”，不是完整 coding agent。

## 当前阶段与边界

### Phase 1（正在做）

目标：在 `agent-playground` 跑通单任务闭环。

必须完成：

- 标准化任务模型、运行日志、失败分类
- 检索相关代码并形成可解释 evidence
- 生成最小 diff 并安全应用
- 跑 `test`，再扩到 `lint + tsc + test + build`
- 最多 N 轮自动修复重试
- 输出 PR 草稿和回归结果

明确不做：

- 不做真正的多 agent 自由协作
- 不做复杂企业平台接入
- 不做全自动 merge
- 不为“未来平台化”提前引入过重基础设施

### Phase 2（Week 2 之后）

目标：从单闭环升级到 PR 级交付。

- Git branch / commit / PR draft
- 小型回归任务集和 success rate
- 基础 risk rule 和 approval gate
- 可回放的 trace 与 run artifact

### Phase 3（后续）

目标：平台化与企业级能力。

- durable execution / checkpoint / resume
- skills / playbooks / policy center
- MCP 化工具平台
- GitHub / Jira / CI / docs 集成
- benchmark / dashboard / BI

## 文档导航

- 总路线图：`docs/agent-plan/01-two-week-roadmap.md`
- Week 1（MVP 闭环）：`docs/agent-plan/02-week1-mvp-loop.md`
- Week 2（PR 级交付）：`docs/agent-plan/03-week2-pr-grade.md`
- 每日执行模板：`docs/agent-plan/04-daily-checklist.md`
- 目标架构与阶段映射：`docs/agent-plan/05-target-architecture.md`
- 独立实现限制评估：`docs/agent-plan/06-solo-build-constraints.md`

## 核心设计原则

1. 先做 `单 runtime + 多阶段节点`，不要过早做多 agent。
2. 先把 tool / log / verify 做稳定，再追求更强模型能力。
3. 模型负责判断，固定流程沉淀到代码、脚本、skills、policy。
4. 先证据后改动；每次 patch 必须绑定验证计划。
5. 优先最小 diff、最少文件、最短验证路径。
6. 所有新增能力先接日志，否则视为未完成。

## 执行规则

1. 严格按阶段推进，不跨阶段提前堆功能。
2. 每天结束必须产出：
   - 可运行代码
   - 一条可复现命令
   - 一份 run artifact（日志/结果）
3. 新增能力必须先接入日志，保证可观测。
4. 任何失败先归类（检索失败/补丁失败/验证失败/环境失败），再改策略。
5. 高风险操作默认不做自动化：删除大量文件、改认证/计费/生产配置、数据库迁移。
6. Week 1/2 默认只针对前端/Node/TS 任务收敛，不扩散到宽泛语言生态。

## 阶段门槛（Definition of Done）

- Week 1 完成门槛：
  - 可以在 `agent-playground` 完成“失败测试 -> 自动修复 -> 测试通过”的单任务闭环
  - 至少有 3 条可回放 run 日志
- Week 2 完成门槛：
  - 支持 `lint + tsc + test + build` 验证链
  - 支持最多 N 轮（建议 3）自动修复迭代
  - 自动生成 PR 文本（标题、变更摘要、验证结果、风险）
  - 有一个最小回归任务集并给出成功率

## 文档更新规则

出现以下任一变化时，必须同步更新 `AGENTS.md` 或对应 docs：

- 新增一个 agent 阶段或新的 failure type
- 引入新的验证步骤、交付物或风险边界
- 调整当前阶段目标、非目标或验收口径
- 增加一个后续里程碑，但短期不实现
