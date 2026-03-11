# Week 1: MVP 闭环（Issue -> Patch -> Test）

## Week 1 目标

在 `agent-playground` 上稳定完成：

- 输入 issue
- 自动检索相关代码
- 生成并应用最小补丁
- 运行测试验证
- 输出结构化日志

## 任务分解

## W1-D1: 统一运行数据模型

- 实现项：
  - `RunRecord` 类型定义（建议放 `src/domain/run-record.ts`）
  - `saveRun` 支持阶段化字段：`retrieve/edit/apply/verify`
- 机制理解重点：
  - 为什么要“事件溯源式日志”：便于复盘和回归
- 验收命令：
  - `pnpm agent fix --repo ../agent-playground --issue "sum test is failing"`

## W1-D2: 工具层稳定性

- 实现项：
  - `runCmd` 增加 `timeoutMs`
  - 为 `search/read/run/apply` 统一返回格式
- 机制理解重点：
  - coding agent 的失败通常来自工具层不稳定，而不是模型能力
- 验收标准：
  - 超时、非 0 退出码、stderr 都能入日志

## W1-D3: 检索与上下文构建

- 实现项：
  - `retrieve` 输出 `evidence`（文件 + 片段 + 命中理由）
  - 限制上下文长度（避免 token 爆炸）
- 机制理解重点：
  - context retrieval 决定 patch 质量上限
- 验收标准：
  - 可解释“为何选中该文件”

## W1-D4: 首版 patch 生成

- 实现项：
  - `generatePatch(issue, evidence)`
  - prompt 三段式：`task`, `constraints`, `expected_diff_format`
- 机制理解重点：
  - 约束输出比“让模型自由发挥”更关键
- 验收标准：
  - 仅修改白名单文件，输出 unified diff

## W1-D5: apply + verify 闭环

- 实现项：
  - `applyPatch(diff)`（建议先 `git apply --check` 再 apply）
  - `verify` 先只跑 test
- 机制理解重点：
  - “可验证”是 agent 区别于普通 chat 的核心
- 验收标准：
  - playground 任务至少成功 1 次完整自动修复

## Week 1 产物清单

- `runs/*.json`（至少 3 条）
- 一条成功 case 的全链路日志
- 一份失败类型统计（哪一步最容易挂）

## Week 1 风险与对策

- 风险：LLM diff 格式不稳定
  - 对策：严格格式校验，不合法直接重试
- 风险：检索误召回导致改错文件
  - 对策：路径白名单 + Top-K 截断 + 命中理由
- 风险：测试输出噪音太大
  - 对策：提取关键报错（文件/行号/错误类型）
