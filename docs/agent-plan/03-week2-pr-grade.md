# Week 2: PR 级交付（可重试、可交付、可评估）

## Week 2 目标

在 Week 1 MVP 基础上，升级到真实工程可用流程：

- 多验证链（lint/tsc/test/build）
- 自动重试修复
- Git 交付产物（branch/commit/PR draft）
- 可量化评估

## 任务分解

## W2-D1: 验证链编排

- 实现项：
  - `verifyPipeline` 支持按配置执行：`lint -> tsc -> test -> build`
  - 每步记录耗时、退出码、错误摘要
- 机制理解重点：
  - 为什么需要分步验证：定位更快、修复更精准

## W2-D2: 错误解析器

- 实现项：
  - 把 stderr 转成结构化错误：`type/file/line/message`
  - 支持 ESLint/TS/Jest(Vitest) 基础模式
- 机制理解重点：
  - 二次修复依赖“机器可读错误”，不是原始日志

## W2-D3: 多轮修复循环

- 实现项：
  - `for round in [1..maxIterations]`: retrieve -> patch -> apply -> verify
  - 终止策略：成功、超预算、无进展
- 机制理解重点：
  - loop controller 是 agent 的状态机核心

## W2-D4: Git 与 PR 文本

- 实现项：
  - 自动创建分支（如 `agent/fix-<timestamp>`）
  - 生成 commit message 和 `pr.md`
- 机制理解重点：
  - 交付质量取决于可审阅性，而不是“改对就行”

## W2-D5: 回归评估与演示

- 实现项：
  - 建立 5~10 条任务集
  - 统计成功率、平均轮数、平均耗时
- 机制理解重点：
  - 没有评估就没有迭代方向

## Week 2 产物清单

- `artifacts/pr.md` 示例
- `artifacts/eval-report.json`
- 至少 1 条“失败后自动修复成功”的 run 记录

## Week 2 风险与对策

- 风险：多轮修复越改越乱
  - 对策：限制每轮改动文件数 + 变化量阈值
- 风险：成本超标
  - 对策：上下文预算、轮次上限、失败快速终止
- 风险：PR 描述不可信
  - 对策：PR 文本只引用日志中的已验证结果
