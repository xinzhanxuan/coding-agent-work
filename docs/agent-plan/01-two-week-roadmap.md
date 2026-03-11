# Two-Week Roadmap (14 days)

## 目标拆解

两周目标不是“一次做完平台”，而是完成三个可演示层级：

1. `Issue -> Patch -> Test` 最小闭环可跑通
2. `Patch 失败可重试` 的验证闭环可自愈
3. `可交付`（commit/PR 摘要/日志）

## 里程碑与 KPI

- M1（第 5 天）：MVP 闭环跑通，单测场景成功率 >= 70%
- M2（第 10 天）：PR 级流程可运行，多验证链成功率 >= 60%
- M3（第 14 天）：固定任务集回归，整体成功率 >= 70%，平均迭代轮数 <= 2.5

建议记录指标：

- `success_rate`
- `avg_iterations`
- `avg_duration_sec`
- `failure_type_distribution`
- `token_cost_per_run`（如果接入 LLM 计费）

## 按天计划

## Day 1

- 目标：盘点现状，统一 run artifact schema
- 任务：
  - 定义 `run.json` 字段（task/context/patch/verify/metrics）
  - 为 `runTests/retrieve` 输出补齐结构化字段
- 产物：`runs/*.json` 可稳定解析
- 验收：同一输入重复运行，日志字段完整且键名稳定

## Day 2

- 目标：工具层标准化（读/搜/改/跑）
- 任务：
  - 统一 `tools` 接口返回值（stdout/stderr/exitCode/duration）
  - 给 `runCmd` 加超时与错误分类
- 产物：工具调用规范文档 + 代码
- 验收：超时、命令失败都能被明确分类

## Day 3

- 目标：检索层升级到“可解释证据包”
- 任务：
  - `rg` 结果增加匹配片段而非仅文件名
  - 增加上下文构建器（Top-K 片段拼装）
- 产物：`context_bundle` 写入 run 日志
- 验收：能解释“为什么选这些文件”

## Day 4

- 目标：首版 LLM patch 生成
- 任务：
  - 加 `plan -> edit` prompt 模板
  - 强约束输出 unified diff（只允许白名单文件）
- 产物：`candidate.diff`
- 验收：diff 可被解析、且路径受控

## Day 5

- 目标：MVP 闭环打通
- 任务：
  - 实现 `git apply`（或等价安全 patch apply）
  - 执行 `test` 验证并回填结果
- 产物：首次“自动修复成功”演示
- 验收：对 playground 任务可自动修复并通过测试

## Day 6

- 目标：验证链扩展
- 任务：
  - 支持 `lint -> tsc --noEmit -> test -> build` 可配置流水线
- 产物：`verification_report`
- 验收：任一步失败都带结构化报错摘要

## Day 7

- 目标：失败日志理解与二次修复
- 任务：
  - 从 stderr 提取错误类型、文件、行号
  - 构造 `fix_prompt_round_n`
- 产物：自动重试第 2 轮
- 验收：同一任务可触发“失败->修复->再验”

## Day 8

- 目标：迭代控制与安全阈值
- 任务：
  - 增加 `maxIterations`、`budget`、`changedFilesLimit`
  - 增加“无进展终止”规则
- 产物：loop controller
- 验收：不再无限循环，失败可解释

## Day 9

- 目标：Git 交付层
- 任务：
  - 自动创建分支与 commit
  - 生成 PR 描述草稿（摘要/验证/风险）
- 产物：`artifacts/pr.md`
- 验收：输出符合可读、可审查标准

## Day 10

- 目标：最小评估体系
- 任务：
  - 定义 5~10 条固定任务作为 regression suite
  - 运行并统计核心指标
- 产物：`artifacts/eval-report.json`
- 验收：有可比的基线结果

## Day 11-14（缓冲与打磨）

- 聚焦：
  - 提升检索准确度（关键词规则、导入链补充）
  - 降低无效改动（最小 diff 约束）
  - 提高失败可解释性（错误 taxonomy）
- 最终演示：
  - 输入 issue
  - 自动修复
  - 自动验证
  - 产出 commit + PR 文本 + 运行日志
