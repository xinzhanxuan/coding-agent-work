# Target Architecture And Phase Mapping

## 为什么要有这份文档

当前仓库只做到了 coding agent 的早期骨架，但后续会不断遇到同一个问题：

- 哪些能力应该现在做
- 哪些能力只是北极星，不该提前堆
- 新增能力属于哪一层，应该落到代码、脚本、文档还是平台

这份文档用于把长期目标压缩成一个稳定的分层框架，避免路线图反复漂移。

## 北极星架构

### 1. Task Intake

统一各种入口，最终收敛成标准任务对象。

建议目标模型：

```ts
type AgentTask = {
  id: string;
  source: "chat" | "github_issue" | "pr_comment" | "jira" | "ci_failure";
  repo: string;
  branch?: string;
  goal: string;
  constraints?: string[];
  attachments?: string[];
  metadata?: Record<string, unknown>;
};
```

当前仓库映射：

- 已有：CLI 入口
- 缺失：统一 task schema、source 分类、metadata 模型

### 2. Orchestrator / State Graph

把执行链建模成阶段化状态，而不是 while loop 式自由调用。

建议最小节点：

1. intake
2. bootstrap
3. retrieve
4. plan
5. edit
6. apply
7. verify
8. summarize
9. deliver

当前仓库映射：

- 已有：`run-fix-task.ts` 雏形
- 缺失：显式状态迁移、round 概念、resume/checkpoint

### 3. Model Responsibility Split

模型不应只剩一个“大 prompt”。

建议职责拆分：

- planner：分析 root cause、候选文件、验证方案
- coder：生成最小 diff
- verifier/reviewer：基于日志和 diff 做独立判断
- summarizer：生成 PR 文本和风险说明

当前仓库映射：

- 已有：无
- 近期目标：先接单模型，但在接口层保留 role 字段

### 4. Tool Platform

工具平台应按职责分组，而不是零散函数堆积。

最低分组：

- code understanding：search/read/repo map/import graph
- file ops：apply patch、write file、safe create/move
- execution：shell/test/lint/build
- delivery：git branch/commit/pr draft
- observability：log/artifact/metrics

当前仓库映射：

- 已有：search/read/run/save
- 缺失：patch、git、summary、统一 tool result schema 文档

### 5. Runtime / Sandbox

长期应做到：

- 每任务独立 workspace
- 独立 branch
- 可控 shell 执行
- 输出截断与脱敏
- timeout / quota / replay

当前仓库映射：

- 已有：本地 repo 目录执行、命令 timeout
- 缺失：真实隔离环境、secret policy、network policy、workspace lifecycle

### 6. Context / Skills / Playbooks

上下文分层：

- task context：issue、报错、最近输出
- repo context：模块边界、运行命令、测试入口
- org context：PR 模板、review 规则、发布规范
- persistent skills：高频任务流程模板

建议仓库结构目标：

```txt
.agent/
  skills/
  playbooks/
  policies/
  evals/
```

当前仓库映射：

- 已有：`AGENTS.md` + docs
- 缺失：skills/playbooks/policies/evals 的实体目录

### 7. Governance / Risk Control

最低要求：

- 权限分级
- 高风险操作审批
- 敏感目录边界
- shell/file 操作策略规则
- 审计可回放

当前仓库映射：

- 已有：文档级执行边界
- 缺失：真正的策略引擎与审批 gate

### 8. Eval / Observability

必须同时具备：

- 单次 run artifact
- 回归任务集
- 核心指标统计
- trace/replay

当前仓库映射：

- 已有：`runs/*.json`
- 缺失：标准 taskset、eval runner、report 聚合、成功率趋势

## 分阶段落地

## Phase 1: MVP Loop

聚焦：

- task schema
- evidence retrieval
- patch generation
- safe apply
- single verify
- run artifact

Definition of Done：

- playground 中至少 1 个失败任务可自动修复
- 至少 3 条可回放日志

## Phase 2: PR-Grade Delivery

聚焦：

- multi-step verify
- retry loop
- branch / commit / PR draft
- minimal eval suite
- minimal risk rules

Definition of Done：

- 5~10 条固定任务可跑出 success rate
- 输出 PR 文本只引用验证过的事实

## Phase 3: Platformization

聚焦：

- skills / playbooks / policies
- durable execution
- external integrations
- approval center
- dashboard / BI

Definition of Done：

- 同一个 agent runtime 能稳定服务多个任务入口
- 能中断恢复、审计、回放

## 设计决策准则

新增能力时，先问这 5 个问题：

1. 它属于哪一层？
2. 它是当前阶段 DoD 的必要条件吗？
3. 它应该落到代码、日志、skill、policy 还是后续平台？
4. 它有没有最小可验证版本？
5. 如果现在不做，会不会阻塞后续阶段？

如果第 2 和第 5 个问题都是否，优先延后。
