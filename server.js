import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing-key" });

// # 用途：限制请求体大小，避免把过大的简历或回答直接送进后端。
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// # 用途：给前端检查后端、API Key 和模型配置是否就绪。
app.get("/api/health", (req, res) => {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  res.json({
    server: "ok",
    hasApiKey,
    model,
    aiReady: hasApiKey,
  });
});

// # 用途：生成面试题 API，前端点击“开始生成面试题”时调用。
app.post("/api/generate-questions", async (req, res) => {
  try {
    ensureApiKey();
    const { role, resumeText, parsedResume } = req.body;
    validateRole(role);
    validateText(resumeText, "简历内容", 40);

    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "你是一名中文 AI 模拟面试教练。请根据候选人简历和目标岗位生成 5 道具体、贴近经历、适合口头回答的面试题。",
        },
        {
          role: "user",
          content: JSON.stringify({
            role,
            resumeText,
            parsedResume,
            requirements: [
              "只返回 5 道题",
              "题目必须具体，避免泛泛而谈",
              "每道题尽量追问候选人的项目、技能、取舍、结果或排查过程",
              "使用中文",
            ],
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "interview_questions",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              questions: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: { type: "string" },
              },
            },
            required: ["questions"],
          },
        },
      },
    });

    const data = parseJsonOutput(response);
    res.json({
      questions: data.questions,
      source: "ai",
      model,
    });
  } catch (error) {
    sendError(res, error);
  }
});

// # 用途：回答评分 API，前端提交每一题回答后调用。
app.post("/api/evaluate-answer", async (req, res) => {
  try {
    ensureApiKey();
    const { role, question, answer, resumeText, parsedResume } = req.body;
    validateRole(role);
    validateText(question, "面试题", 10);
    validateText(answer, "回答", 30);
    validateText(resumeText, "简历内容", 40);

    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "你是一名严格但鼓励式的中文面试教练。请基于题目、简历和候选人回答给出可执行反馈。",
        },
        {
          role: "user",
          content: JSON.stringify({
            role,
            question,
            answer,
            resumeText,
            parsedResume,
            requirements: [
              "score 是 1 到 10 的整数",
              "strengths 给 2 到 4 条具体亮点",
              "weaknesses 给 2 到 4 条可改进点",
              "improvedAnswer 给一段更强回答方向，不要替用户编造不存在的经历",
              "使用中文",
            ],
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "answer_feedback",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "integer", minimum: 1, maximum: 10 },
              strengths: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: { type: "string" },
              },
              weaknesses: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: { type: "string" },
              },
              improvedAnswer: { type: "string" },
            },
            required: ["score", "strengths", "weaknesses", "improvedAnswer"],
          },
        },
      },
    });

    const data = parseJsonOutput(response);
    res.json({
      ...data,
      source: "ai",
      model,
    });
  } catch (error) {
    sendError(res, error);
  }
});

// # 用途：所有非 API 路由都回到首页，方便以后扩展前端路由。
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`AI interview coach running at http://localhost:${port}`);
});

function ensureApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("后端缺少 OPENAI_API_KEY，请先配置 .env。");
    error.status = 500;
    throw error;
  }
}

function validateRole(role) {
  if (!["backend", "swe", "data"].includes(role)) {
    const error = new Error("岗位类型无效。");
    error.status = 400;
    throw error;
  }
}

function validateText(value, label, minLength) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    const error = new Error(`${label}太短或格式不正确。`);
    error.status = 400;
    throw error;
  }
}

function parseJsonOutput(response) {
  try {
    return JSON.parse(response.output_text);
  } catch {
    const error = new Error("AI 返回格式异常，请稍后再试。");
    error.status = 502;
    throw error;
  }
}

function sendError(res, error) {
  const status = error.status || 500;
  const message = status >= 500 ? error.message || "服务器暂时不可用。" : error.message;
  res.status(status).json({ error: message });
}
