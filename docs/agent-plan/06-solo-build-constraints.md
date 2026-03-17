# Solo Build Constraints And Decision Rules

## 结论先行

独立实现可以做出一个很强的 `单仓库 issue -> patch -> verify -> PR draft` coding agent，而且足够作为作品、求职展示和真实效率工具。

但如果目标是“大厂工程级平台”的完整形态，独立实现会天然受限，尤其在：

- runtime 隔离与基础设施
- 多系统集成
- 治理与审批
- 长任务 durability
- benchmark 与线上指标

这不是能力问题，而是人力、环境、权限和数据规模决定的。

## 哪些部分适合独立实现

这些能力非常适合当前仓库自研：

1. 单仓库 task schema 与 state model
2. retrieve/edit/apply/verify 的最小状态机
3. run artifact、failure taxonomy、trace 基础
4. patch 可靠性与最小 diff 约束
5. verification pipeline 与错误解析
6. PR 草稿生成与最小交付链
7. 小规模离线任务集与 success rate
8. skills/playbooks 的 repo 内沉淀

原因：

- 边界清晰
- 可复现
- 可验证
- 不强依赖组织权限或基础设施

## 哪些部分会明显受限

### 1. 真正的 sandbox/runtime

受限点：

- 很难做出接近企业级的容器编排、网络策略、secret 注入与资源隔离
- 本地运行更像“受控脚本”，不是强隔离执行环境

替代方案：

- 先做 repo 层面的安全边界
- 命令白名单 + timeout + 目录限制 + 输出脱敏
- 后续再切到 Docker 或外部 runner

### 2. 多入口系统集成

受限点：

- GitHub App、Jira、CI、Confluence 接入需要长期维护
- 真实组织环境常有权限、审计、网络和审批门槛

替代方案：

- 先用 CLI 统一 task 输入
- 后续先接 GitHub，再评估是否需要 Jira/CI

### 3. Durable execution / workflow infra

受限点：

- Temporal、LangGraph persistence、队列、worker、resume 机制会显著抬高复杂度
- 在任务量不大时，基础设施成本高于收益

替代方案：

- 先把 `RunRecord` 做成阶段化、轮次化、可回放
- 用 artifact 模拟 checkpoint
- 等 retry loop 稳定后，再考虑 durable runtime

### 4. 企业级治理与审批

受限点：

- 真正的权限系统、审批链、策略中心很难单人完整做出来
- 这类能力必须绑定组织流程才能有意义

替代方案：

- 先实现静态 risk rules
- 把高风险目录、高风险命令、改动文件数阈值显式文档化
- 人工审批先只体现在 CLI 或 PR 前停住

### 5. 评估数据规模

受限点：

- 缺少真实企业任务历史、失败样本、线上 accept/revert 数据
- 无法只靠公开 benchmark 证明“企业可用”

替代方案：

- 自建小型高质量任务集
- 优先前端/TS/Node 场景
- 指标聚焦 success rate、avg iterations、failure type、artifact completeness

## 独立实现最容易踩的坑

### 1. 过早做平台

表现：

- 还没跑通 patch/apply/verify，就开始做多 agent、dashboard、GitHub App

建议：

- 先把单链路成功率做上去

### 2. 过度依赖模型能力

表现：

- prompt 很长，但 tool、patch、verify、log 都不稳定

建议：

- 把工程问题拆回工具、状态机、验证链

### 3. 低估 patch/apply 难度

表现：

- 直接整文件改写、diff 不稳定、apply 后无法验证

建议：

- 最小 diff、严格格式校验、`git apply --check`、失败重试策略

### 4. 没有独立 verifier

表现：

- coder 自己判断“我修好了”

建议：

- success 只由 verify pipeline 定义，不由模型自述定义

### 5. 没有任务集

表现：

- 每次换一个 demo，无法知道是否进步

建议：

- 尽快固定 5~10 条可重放任务

## 推荐的独立实现路线

优先顺序：

1. 前端/Node/TS 任务闭环
2. patch/apply/verify 稳定性
3. retry + PR draft + eval suite
4. risk rules + approval gate
5. 再考虑 GitHub 集成与 sandbox 升级

不建议优先投入：

- 复杂多 agent 自由对话
- 泛语言通用平台
- 大规模 UI 平台
- 过早引入重型分布式基础设施

## 判断一个需求是否该现在做

新增需求进入 backlog 前，先判断：

1. 它能直接提升闭环成功率吗？
2. 它能提升可观测、可回放、可评估吗？
3. 它会不会让当前代码结构更清晰，而不是更抽象？
4. 它是否依赖暂时拿不到的组织权限或基础设施？

如果前 3 个都不是“是”，或者第 4 个是“是”，通常应该延后。
