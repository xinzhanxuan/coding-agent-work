# Repo Agent Execution Guide

本仓库的总目标：

> 输入一个 Issue（或报错/需求），自动在 repo 里定位相关代码 -> 生成最小 diff -> 应用 -> 运行验证（lint/tsc/test/build）-> 失败后根据日志再修复 -> 最终产出可合并 PR + 全链路日志。

## 当前基线（2026-03-11）

你已经有以下基础能力：

- CLI 入口：`agent/src/cli/index.ts`
- 流程编排：`agent/src/app/run-fix-task.ts`
- 测试执行：`agent/src/verification/run-tests.ts`
- 基础检索：`agent/src/retrieval/retrieve-evidence.ts` + `agent/src/infra/search-files.ts`
- 日志落盘：`agent/src/artifacts/save-run-record.ts`（JSON）

缺口主要在：`LLM patch 生成`、`apply patch`、`验证闭环重试`、`Git/PR 交付`、`评估指标`。

## 文档导航（分阶段）

- 总路线图：`docs/agent-plan/01-two-week-roadmap.md`
- Week 1（MVP 闭环）：`docs/agent-plan/02-week1-mvp-loop.md`
- Week 2（PR 级交付）：`docs/agent-plan/03-week2-pr-grade.md`
- 每日执行模板：`docs/agent-plan/04-daily-checklist.md`

## 执行规则

1. 严格按阶段推进，不跨阶段提前堆功能。
2. 每天结束必须产出：
   - 可运行代码
   - 一条可复现命令
   - 一份 run artifact（日志/结果）
3. 新增能力必须先接入日志，保证可观测。
4. 任何失败先归类（检索失败/补丁失败/验证失败/环境失败），再改策略。

## 阶段门槛（Definition of Done）

- Week 1 完成门槛：
  - 可以在 `agent-playground` 完成“失败测试 -> 自动修复 -> 测试通过”的单任务闭环
  - 至少有 3 条可回放 run 日志
- Week 2 完成门槛：
  - 支持 `lint + tsc + test + build` 验证链
  - 支持最多 N 轮（建议 3）自动修复迭代
  - 自动生成 PR 文本（标题、变更摘要、验证结果、风险）
  - 有一个最小回归任务集并给出成功率
