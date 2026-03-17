# Phase 1: 单仓库修复闭环

## 阶段目标

在 `agent-playground` 上稳定跑通：

`issue -> retrieve -> patch -> apply -> test -> save run`

这不是“先做个 demo”，而是整个项目最关键的技术底盘。后面的审批、skills、异步任务、GitHub 集成，都会建立在这条链是否稳定上。

## 这一阶段必须学懂什么

### 1. Retrieval 不是找文件，而是构建证据

必须理解：

- 为什么只给模型整个仓库通常会失败
- 为什么 evidence 需要 `文件 + 片段 + 命中理由`
- 为什么 retrieval 错了，patch 大概率也会错

必须产物：

- evidence bundle
- 命中理由
- 上下文长度控制策略

### 2. Patch 是工程约束问题，不是文采问题

必须理解：

- 为什么要强约束 unified diff 格式
- 为什么必须限制改动文件白名单
- 为什么 patch 无法解析时必须直接失败

必须产物：

- `generatePatch(issue, evidence)`
- diff parser
- 非法 diff 的失败路径

### 3. Apply 是第一道硬门槛

必须理解：

- 为什么“模型说改好了”不等于 patch 能落地
- `git apply --check` 这类预检查为什么重要
- apply 失败和 edit 失败为什么要分开记

必须产物：

- `applyPatch(diff)`
- apply 前检查
- apply 失败日志

### 4. Verify 必须独立

必须理解：

- 为什么 success 只能由验证链定义
- 为什么最开始只跑 test 就够
- 为什么 verify 输出需要结构化，而不是一整坨 stdout/stderr

必须产物：

- `verify` 结果结构
- 至少 1 个自动修复成功案例

## 实现顺序

1. 统一 `RunRecord` 与 failure taxonomy
2. 把 retrieve 产物升级为 evidence bundle
3. 接入 patch 生成
4. 做 patch apply
5. 接入最小 verify
6. 跑通完整 playground case

## 本阶段明确不做

- 不做多轮修复
- 不做 `lint + tsc + build`
- 不做 Git branch / commit / PR
- 不做复杂审批和权限中心
- 不做异步任务系统

## 验收标准

- playground 至少 1 个失败 case 被自动修复
- 至少有 3 条可回放 run artifact
- failure type 至少能区分：
  - `retrieve_failed`
  - `edit_failed`
  - `apply_failed`
  - `verify_failed`
  - `infra_failed`

## 阶段复盘必须回答的问题

完成 Phase 1 后，必须能清楚回答：

1. retrieval 为什么选中了这些文件
2. patch 为什么是这个 diff，而不是另一个 diff
3. apply 为什么成功或失败
4. verify 为什么判定这次 run 成功或失败
5. 当前成功率受限于 retrieval、patch、apply、还是 verify
