# Week 2: PR 级交付（可重试、可交付、可评估）

## 本周定位

Week 2 的核心不是“再多接几个功能”，而是把 Week 1 的单次闭环升级成一个可交付、可重试、可比较的工程任务循环。

目标状态：

`retrieve -> patch -> apply -> verify -> retry -> summarize -> deliver`

## Week 2 目标

在 Week 1 MVP 基础上，升级到真实工程可用流程：

- 多验证链（lint/tsc/test/build）
- 自动重试修复
- Git 交付产物（branch/commit/PR draft）
- 可量化评估

## 本周非目标

- 不做真实 merge 自动化
- 不做复杂多模型路由平台
- 不做企业级 GitHub App / Jira webhook 全量集成
- 不做 durable execution 基础设施，只先把 run artifact 做完整

## 任务分解

## W2-D1: 验证链编排

- 实现项：
  - `verifyPipeline` 支持按配置执行：`lint -> tsc -> test -> build`
  - 每步记录耗时、退出码、错误摘要
- 机制理解重点：
  - 为什么需要分步验证：定位更快、修复更精准
- 工程约束：
  - 每一步都必须有结构化 step result，不能只有一坨 stdout

## W2-D2: 错误解析器

- 实现项：
  - 把 stderr 转成结构化错误：`type/file/line/message`
  - 支持 ESLint/TS/Jest(Vitest) 基础模式
- 机制理解重点：
  - 二次修复依赖“机器可读错误”，不是原始日志
- 工程约束：
  - parser 的输出要能直接供下一轮 prompt 和统计报表复用

## W2-D3: 多轮修复循环

- 实现项：
  - `for round in [1..maxIterations]`: retrieve -> patch -> apply -> verify
  - 终止策略：成功、超预算、无进展
- 机制理解重点：
  - loop controller 是 agent 的状态机核心
- 工程约束：
  - 必须记录每一轮改了什么、为什么停止

## W2-D4: Git 与 PR 文本

- 实现项：
  - 自动创建分支（如 `agent/fix-<timestamp>`）
  - 生成 commit message 和 `pr.md`
- 机制理解重点：
  - 交付质量取决于可审阅性，而不是“改对就行”
- 工程约束：
  - PR 文本只能引用已经验证过的事实，不允许模型臆测

## W2-D5: 回归评估与演示

- 实现项：
  - 建立 5~10 条任务集
  - 统计成功率、平均轮数、平均耗时
- 机制理解重点：
  - 没有评估就没有迭代方向
- 工程约束：
  - 回归任务必须可重放，输入和期望结果都要落盘

## Week 2 产物清单

- `artifacts/pr.md` 示例
- `artifacts/eval-report.json`
- 至少 1 条“失败后自动修复成功”的 run 记录
- 一份最小风险规则列表（哪些操作必须停下来）

## Week 2 风险与对策

- 风险：多轮修复越改越乱
  - 对策：限制每轮改动文件数 + 变化量阈值
- 风险：成本超标
  - 对策：上下文预算、轮次上限、失败快速终止
- 风险：PR 描述不可信
  - 对策：PR 文本只引用日志中的已验证结果

## Week 2 完成后该接什么

优先顺序：

1. `risk rules + approval gate`
2. `skills/playbooks` 把高频任务沉淀成稳定流程
3. `eval taskset` 扩到更真实的前端/全栈任务
4. 再考虑 GitHub App、CI failure triage、MCP 化
