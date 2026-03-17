# Target Architecture

## 目标定义

最终目标不是做一个“能调用终端的 LLM”，而是做出一个接近 `Claude Code / Codex` 核心能力形态的 coding agent 系统。

这个目标拆成 8 层。

## 1. Task Intake

负责把不同来源的请求统一成任务对象。

目标能力：

- chat 输入
- GitHub issue / PR comment
- CI failure
- 统一 task schema

为什么重要：

- 不统一任务对象，后续 workflow 无法稳定复用

当前仓库状态：

- 已有 CLI 输入
- 缺统一 task model

## 2. Orchestrator / State Graph

负责定义任务如何流经各阶段。

目标能力：

- 明确节点：retrieve / plan / edit / apply / verify / summarize / deliver
- round 概念
- stop reason
- checkpoint / resume

为什么重要：

- 工程 agent 的本质不是“连续对话”，而是“状态推进”

当前仓库状态：

- 已有单次流程雏形
- 缺显式状态机

## 3. Model Roles

负责把模型职责拆开。

目标能力：

- planner
- coder
- verifier / reviewer
- summarizer

为什么重要：

- 不同阶段的目标完全不同，不能长期靠一个大 prompt 兜底

当前仓库状态：

- 还未接入明确角色层

## 4. Tool Platform

负责让模型使用稳定、受控的工具，而不是零散 helper。

目标能力：

- code search / read
- patch apply
- shell exec
- verify exec
- git delivery
- artifact/log collection

为什么重要：

- coding agent 的成功率，很多时候取决于工具层是否稳定

当前仓库状态：

- 已有 search / read / run / save
- 缺 patch / git / tool schema 统一层

## 5. Runtime / Sandbox

负责提供受控执行环境。

目标能力：

- isolated workspace
- branch isolation
- timeouts / quotas
- audit
- output truncation / masking

为什么重要：

- 真正能改代码、跑命令的 agent 必须被约束

当前仓库状态：

- 只有本地 repo 执行 + timeout

## 6. Context / Skills / Playbooks

负责把 repo 规则和高频流程沉淀下来。

目标能力：

- repo context
- AGENTS 规则
- skills
- playbooks
- policy docs

为什么重要：

- 长期可维护性来自沉淀，不来自 prompt 越写越长

当前仓库状态：

- 已有 `AGENTS.md` 和 docs
- 缺技能与流程实体目录

## 7. Governance / Approval

负责高风险控制与人机协作边界。

目标能力：

- risk rules
- approval gates
- sensitive path rules
- command restrictions
- audit trail

为什么重要：

- 越接近真实工程流，越不能只追求自动化

当前仓库状态：

- 只有文档级约束

## 8. Eval / Observability

负责判断系统是否真的变强了。

目标能力：

- run artifacts
- replay
- regression taskset
- success metrics
- cost metrics

为什么重要：

- 没有 eval，就只有 demo，没有工程闭环

当前仓库状态：

- 已有 `runs/*.json`
- 缺 taskset、eval runner、聚合视图

## 层与阶段映射

### Phase 0

- 主要建设：1, 2, 8 的文档与骨架

### Phase 1

- 主要建设：2, 4, 8

### Phase 2

- 主要建设：2, 4, 7, 8

### Phase 3

- 主要建设：1, 2, 6, 7

### Phase 4

- 主要建设：全部 8 层

## 使用方式

新增需求时，先问：

1. 它属于哪一层？
2. 它属于哪个阶段？
3. 它是这个阶段的主问题吗？
4. 它要求我先学懂什么机制？
5. 如果今天不做，会不会阻塞当前阶段主线？

如果第 3 个问题是否，第 5 个问题也是否，通常先不做。
