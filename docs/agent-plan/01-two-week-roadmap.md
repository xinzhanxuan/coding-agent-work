# Staged Roadmap Toward A Claude Code / Codex-Like Agent

## 这份路线图的作用

最终目标是做出一个接近 `Claude Code / Codex` 核心能力形态的 coding agent，但实现路径必须分阶段推进。

原则不是“尽快堆功能”，而是：

1. 每阶段只解决一个主要技术问题
2. 每阶段都保留可运行结果
3. 每阶段都要求对关键机制有清楚理解
4. 只有前一阶段稳定后，才进入下一阶段

## 总体阶段

## Phase 0：骨架校准

目标：

- 定义终局、边界、阶段、文档体系
- 明确当前实现与终局之间的差距

核心问题：

- 这个项目到底在做什么
- 为什么要分阶段
- 为什么先做状态机、日志、验证，而不是先堆多 agent 和平台

阶段产物：

- `AGENTS.md`
- 架构文档
- 阶段路线图

## Phase 1：单仓库修复闭环

目标：

- 跑通 `issue -> retrieve -> patch -> apply -> test`

核心问题：

- 如何找到真正相关的代码
- 如何让模型输出可解析、可应用的 patch
- 如何把“修好了”交给验证链判断，而不是模型自述

阶段产物：

- 可成功修复的 playground case
- 结构化 run artifact
- 最小 patch/apply/verify 流程

## Phase 2：可靠执行器

目标：

- 升级到 `retrieve -> patch -> apply -> verify -> retry -> summarize`
- 加入 `lint + tsc + test + build`
- 产出 Git 交付物

核心问题：

- 如何安全地做多轮修复
- 如何避免越修越乱
- 如何把日志转成下一轮输入
- 如何保证 PR 文本只引用真实结果

阶段产物：

- retry loop
- verification pipeline
- branch / commit / PR draft
- regression taskset

## Phase 3：异步工作流 agent

目标：

- 进入更接近产品形态的任务流

核心问题：

- 如何统一 issue / PR / CI failure 输入
- 如何做 checkpoint / resume
- 如何引入审批节点
- 如何把高频流程沉淀成 skills / playbooks

阶段产物：

- task state machine
- async task model
- approval gate
- skills / playbooks 雏形

## Phase 4：产品级平台能力

目标：

- 接近真正产品化的 coding agent 平台

核心问题：

- 如何做 runtime / sandbox / policy
- 如何接 GitHub / CI / docs 等外部系统
- 如何做 eval / observability / rollout
- 如何长期维护模型、工具、规则版本

阶段产物：

- policy / approval / audit
- external integrations
- eval report / dashboard
- 更接近真实产品的运行方式

## 当前阶段聚焦

当前只允许聚焦 `Phase 1 -> Phase 2` 过渡。

近期主线：

1. patch generation
2. patch apply
3. verify pipeline
4. retry loop
5. PR draft
6. regression taskset

## 当前阶段 KPI

在进入 Phase 3 之前，至少要稳定拿到这些结果：

- `success_rate`
- `avg_iterations`
- `failure_type_distribution`
- `avg_duration_sec`
- `artifact_completeness`

如果接入模型计费，再补：

- `token_cost_per_run`

## 范围控制

在进入 Phase 3 之前，默认坚持这些边界：

- 单仓库优先
- Node/TS/前端或全栈常见场景优先
- CLI 和本地 repo 执行优先
- 单 runtime + 多阶段节点优先
- 先做结构化 artifact，后做复杂平台

明确延后：

- 真正的多 agent 自由协作
- 大规模 UI 平台
- 企业级多租户基础设施
- 全量 Jira / Slack / Docs 接入

## 推进节奏

每个阶段内按这个节奏推进：

1. 定义输入输出模型
2. 实现最小可运行链路
3. 写入日志与失败分类
4. 增加保护机制与边界
5. 建可复现 case
6. 写清楚“学懂了什么”

如果第 2 步没完成，不进入第 4 步。
