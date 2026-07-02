(() => {
  // # 用途：统一封装前端到后端 API 的请求，失败时由 app.js 决定是否回退到本地模拟。
  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.payload ? JSON.stringify(options.payload) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "AI 服务暂时不可用，请稍后再试。");
    }

    return data;
  }

  function getHealth() {
    return requestJson("/api/health");
  }

  function generateQuestions(payload) {
    return requestJson("/api/generate-questions", {
      method: "POST",
      payload,
    });
  }

  function evaluateAnswer(payload) {
    return requestJson("/api/evaluate-answer", {
      method: "POST",
      payload,
    });
  }

  window.AIInterviewApi = {
    evaluateAnswer,
    generateQuestions,
    getHealth,
  };
})();
