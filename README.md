# AI 模拟面试教练

这是一个 AI 驱动的模拟面试网站。用户可以粘贴或上传 `.txt` 简历，选择目标岗位，生成面试题，输入回答，并获得评分、亮点、改进建议和最终总结。

## 当前功能

- 粘贴简历文本或上传 `.txt` 简历
- 自动解析技能、项目、经历和教育信息
- 选择目标岗位：后端开发、软件工程师、数据方向
- 通过后端调用 OpenAI API 生成 5 道面试题
- 提交回答后调用 OpenAI API 获取评分和反馈
- 后端不可用时自动回退到本地模拟题库和本地评分
- 查看最终报告和回答历史

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量文件：

```bash
copy .env.example .env
```

3. 打开 `.env`，填入你的 OpenAI API Key：

```env
OPENAI_API_KEY=你的_key
OPENAI_MODEL=gpt-5.4-mini
PORT=3000
```

4. 启动服务：

```bash
npm run dev
```

5. 打开页面：

```txt
http://localhost:3000
```

## 主要文件

```txt
server.js              # 用途：Express 后端，负责调用 OpenAI API
index.html            # 用途：页面结构
styles.css            # 用途：页面视觉样式
src/apiClient.js      # 用途：前端 API 请求封装
src/app.js            # 用途：页面交互主流程
src/config.js         # 用途：岗位、题库和模板配置
src/interviewEngine.js # 用途：本地 fallback 题目生成和评分
src/render.js         # 用途：渲染反馈、报告和历史记录
src/resumeParser.js   # 用途：解析简历文本
src/utils.js          # 用途：通用工具函数
```

## 说明

如果你直接双击打开 `index.html`，页面仍然可以使用本地模拟模式；但真实 AI 生成题目和反馈需要通过 `npm run dev` 启动后端服务。
