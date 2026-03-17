# Phase 2: 可靠执行器与 PR 级交付

## 阶段目标

在 Phase 1 基础上，把系统升级到：

`retrieve -> patch -> apply -> verify -> retry -> summarize -> deliver`

这一步的意义是：从“能修一次”变成“能稳定执行、有失败控制、能交付给人审阅”。

## 这一阶段必须学懂什么

### 1. 验证链为什么必须分步

必须理解：

- 为什么 `lint / tsc / test / build` 不能混成一步
- 为什么越精细的 step result，越有利于定位和下一轮修复
- 为什么 verifier 逻辑必须独立于 coder

必须产物：

- `verifyPipeline`
- 每一步的结构化结果
- 报错摘要

### 2. 错误解析器是 retry loop 的前提

必须理解：

- 原始 stderr 为什么不适合作为下一轮输入
- 为什么需要抽取 `type/file/line/message`
- 为什么 parser 的质量会直接影响第二轮 patch

必须产物：

- ESLint / TypeScript / Jest(Vitest) 基础 parser
- 结构化 error model

### 3. 多轮修复不是“再试一次”这么简单

必须理解：

- 什么时候应该进入下一轮
- 什么时候应该终止
- 什么叫“无进展”
- 为什么必须限制改动文件数、轮次和预算

必须产物：

- retry loop
- stop reason
- round-level artifact

### 4. PR 交付物必须可审阅

必须理解：

- 为什么 PR 文本不能让模型自由发挥
- 为什么变更摘要、验证结果、风险都必须来自真实日志
- 为什么 branch / commit / PR draft 是工程 agent 的关键输出

必须产物：

- branch naming 规则
- commit message 规则
- `pr.md`

### 5. 没有任务集，就没有迭代方向

必须理解：

- 为什么单次 demo 不能证明系统变强了
- 为什么 success rate、平均轮数、失败分布比主观感觉更重要

必须产物：

- 5~10 条固定任务集
- eval report

## 实现顺序

1. 实现 `verifyPipeline`
2. 实现错误解析器
3. 做 retry loop
4. 做 Git 与 PR 草稿输出
5. 建固定任务集并跑 eval

## 本阶段明确不做

- 不做真正的 GitHub App / Jira / CI 异步接入
- 不做 durable execution 基础设施
- 不做真正的策略中心
- 不做多 agent 编排

## 验收标准

- 至少 1 条 run 经过失败后再次修复成功
- 支持 `lint + tsc + test + build`
- 能产出 branch / commit / PR draft
- 有固定任务集与 success rate

## 阶段复盘必须回答的问题

完成 Phase 2 后，必须能清楚回答：

1. retry loop 的 stop reason 有哪些
2. 哪类错误最适合自动修复，哪类错误最容易误修
3. 哪个验证步骤最常失败，为什么
4. PR 文本中哪些内容来自事实，哪些内容是解释
5. 当前系统距离异步工作流 agent 还差什么
