# Phase Learning Map

## 为什么需要这份文档

本项目最重要的目标之一，不只是把 agent 做出来，还要真正理解每个阶段的技术细节。

所以每个阶段都必须同时交付两样东西：

1. 可运行结果
2. 对关键机制的清晰解释

## Phase 0 要学懂什么

- coding agent 与聊天机器人的本质差异
- 为什么真实工程流一定需要状态、验证、日志
- 为什么阶段化推进比“先搭个平台”更稳

如果还讲不清这些，就说明骨架没有校准好。

## Phase 1 要学懂什么

- retrieval 的输入、输出、失败模式
- 为什么 evidence 比文件列表更重要
- diff format、diff parser、patch apply 的基本机制
- `git apply --check` 这类预检查的意义
- 为什么 verify 必须独立判定 success

判断标准：

- 你能解释一次成功 run 到底是怎么成功的
- 你也能解释一次失败 run 到底卡在哪一层

## Phase 2 要学懂什么

- 为什么验证链必须分步
- 为什么 error parser 决定 retry 质量
- stop reason、无进展判断、预算限制如何设计
- branch / commit / PR draft 为什么属于工程交付
- 为什么任务集与 success rate 比单次 demo 更重要

判断标准：

- 你能解释 retry loop 为什么停下
- 你能解释某个 PR 草稿里的每一项内容从哪来

## Phase 3 要学懂什么

- 任务对象建模
- 异步任务状态迁移
- checkpoint / resume 的基本机制
- 审批节点应该放在哪
- skill / playbook 如何替代重复 prompt

判断标准：

- 你能画出完整任务状态图
- 你能解释人工审批不是多余步骤

## Phase 4 要学懂什么

- runtime / sandbox / policy 的边界
- 为什么 approvals、audit、observability 是产品级系统刚需
- eval、rollout、accept rate、rollback rate 的意义
- 为什么产品级 agent 的难点不在“会不会写代码”，而在系统稳定性与治理

判断标准：

- 你能解释为什么一个 demo 成功不代表平台可用

## 每阶段的学习动作

每推进一个阶段，至少做这 4 件事：

1. 写出输入输出模型
2. 写出失败分类
3. 写出一个成功案例和一个失败案例
4. 写出“如果向别人讲解，我会怎么解释”

## 红线

如果出现下面任一情况，说明理解还不够：

- 只能说“模型不太稳定”
- 说不清一次 run 失败到底卡在哪
- 说不清当前机制为什么放在这个阶段做
- 说不清某项能力和最终目标的关系
