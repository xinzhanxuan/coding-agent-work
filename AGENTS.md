# Repo Agent Execution Guide

本仓库的最终目标：

> 逐步做出一个接近 `Claude Code / Codex` 核心能力形态的 coding agent：能理解真实仓库、受控修改代码、运行验证、产出 Git 交付物，并且具备规则、审批、可观测和阶段化演进能力。

## 最终目标是什么

这里说的“像 Claude Code / Codex”，不是追求产品界面或品牌形态，而是对齐下面这些核心能力：

1. 在真实 repo 中工作，而不是只在对话里回答问题
2. 能检索代码、形成判断、生成最小 diff、执行验证
3. 能在受控边界内执行 shell / git / patch 操作
4. 能沉淀仓库规则、技能、风险边界，而不是只靠单次 prompt
5. 能逐步接近 `issue -> patch -> verify -> PR` 的完整工程流

这个仓库当前还远没有到那个成熟度。它现在更接近：

- 一个 `single-repo + local runtime + staged run record` 的骨架
- 一个用于理解 coding agent 技术细节的实验台
- 一个以后可以稳定长成产品级能力的最小底座

## 最高优先级原则

1. 不迈大步子。任何阶段都只解决一类核心问题。
2. 每一阶段都必须“能运行、能复现、能解释、能回放”。
3. 每新增一个能力，都要同时回答“它为什么现在做”和“它属于哪一层架构”。
4. 模型能力不是主线，工具稳定性、状态机、验证链、日志才是主线。
5. 如果一个机制还没有真正理解，就不要把它包装成“平台能力已完成”。

## 当前基线（2026-03-17）

已存在基础能力：

- CLI 入口：`agent/src/cli/index.ts`
- 编排入口：`agent/src/app/run-fix-task.ts`
- 测试执行：`agent/src/verification/run-tests.ts`
- 基础检索：`agent/src/retrieval/retrieve-evidence.ts`
- 命令执行：`agent/src/infra/run-command.ts`
- 日志落盘：`agent/src/artifacts/save-run-record.ts`

当前真实状态：

- 输入：单条 issue / 报错描述
- 环境：本地 repo 路径
- 执行：`retrieve + verify + save run`
- 产物：`runs/*.json`

当前关键缺口：

- LLM patch 生成
- patch 解析与 apply
- 多轮修复循环
- 多步骤验证链
- Git/PR 交付
- 固定任务集与评估

## 分阶段路线

整个项目按 `Phase 0 -> Phase 4` 推进。

### Phase 0：骨架校准

目标：

- 明确最终目标、非目标、阶段边界
- 统一 run artifact、failure taxonomy、阶段定义
- 把项目从“想法集合”收敛成清晰路线

这一阶段必须真正理解：

- 为什么 coding agent 不是聊天机器人
- 为什么状态机比自由对话更适合工程执行
- 为什么 run artifact 和 failure taxonomy 要先于更多模型能力

退出门槛：

- `AGENTS.md` 和 docs 能清楚说明终局、阶段、边界、验收

### Phase 1：单仓库修复闭环

目标：

- 在 playground 中跑通 `issue -> retrieve -> patch -> apply -> test`

这一阶段必须真正理解：

- evidence retrieval 如何决定 patch 质量上限
- unified diff / patch apply 为什么是 agent 的第一个硬门槛
- 为什么 verify 结果必须独立于 coder 结论
- 为什么最小 diff 比“看起来聪明”的大改动更重要

退出门槛：

- 至少 1 个 playground 失败任务自动修复成功
- 至少 3 条可回放 run artifact

### Phase 2：可靠执行器

目标：

- 把闭环升级成 `retrieve -> patch -> apply -> verify -> retry -> summarize`
- 支持 `lint + tsc + test + build`
- 产出 branch / commit / PR draft

这一阶段必须真正理解：

- 多轮修复循环的终止条件与“无进展”判断
- 错误解析器如何把日志变成下一轮输入
- 为什么 PR 文本只能引用已验证事实
- 为什么风险阈值、文件数限制、预算限制必须尽早进入系统

退出门槛：

- 至少 1 条“失败后自动修复成功”的 run
- 有固定任务集与 success rate

### Phase 3：异步工作流 agent

目标：

- 从本地串行执行器升级到更接近产品形态的 workflow agent
- 引入审批点、任务状态、外部触发、可恢复执行

这一阶段必须真正理解：

- durable execution / checkpoint / resume 的必要性
- issue / PR / CI failure 为什么必须统一成任务对象
- 人工审批在 agent 系统里不是 UX 点缀，而是治理节点
- skills / playbooks 为什么比“大 prompt”更可维护

退出门槛：

- 能稳定处理异步任务输入
- 能在关键节点暂停、恢复、交付

### Phase 4：产品级平台能力

目标：

- 接近 Claude Code / Codex 的核心工程能力形态
- 支持规则、审批、技能、可观测、外部系统接入

这一阶段必须真正理解：

- 为什么工具平台、runtime、policy、eval 才是真正的产品护城河
- 为什么 benchmark、accept rate、rollback rate 比单次 demo 更重要
- 为什么“平台能力”需要长期运维，而不是一次性实现

退出门槛：

- 具备稳定的任务流、交付流、治理流、评估流

## 明确不做什么

在 Phase 1 / Phase 2 期间，默认不做：

- 真正的多 agent 自由对话系统
- 泛语言、泛技术栈的大而全平台
- 自动 merge
- 复杂 UI 仪表盘先行
- 过早引入重型分布式基础设施

## 文档导航

- 总路线图：`docs/agent-plan/01-two-week-roadmap.md`
- Phase 1 详细计划（历史文件名保留）：`docs/agent-plan/02-week1-mvp-loop.md`
- Phase 2 详细计划（历史文件名保留）：`docs/agent-plan/03-week2-pr-grade.md`
- 每日执行模板：`docs/agent-plan/04-daily-checklist.md`
- 目标架构：`docs/agent-plan/05-target-architecture.md`
- 独立实现边界：`docs/agent-plan/06-solo-build-constraints.md`
- 学习与理解地图：`docs/agent-plan/07-phase-learning-map.md`

## 执行规则

1. 阶段内只解决该阶段的主问题，不并行扩很多方向。
2. 每天结束必须产出：
   - 可运行代码
   - 一条可复现命令
   - 一份 run artifact 或阶段性文档
3. 所有新增能力先接日志，否则视为未完成。
4. 每次失败必须归类：`retrieve / edit / apply / verify / infra / unknown`
5. 每次新增机制，必须写清“我学懂了什么”。
6. 高风险操作默认不自动化：大量删除、认证/计费、生产配置、数据库迁移。

## 文档更新规则

出现以下任一变化时，必须同步更新 `AGENTS.md` 或对应 docs：

- 新增一个 agent 阶段或阶段门槛变化
- 新增一种关键 failure type
- 引入新的验证步骤、交付物或风险边界
- 发现“原本以为理解了，其实没理解透”的机制，需要补学习文档
