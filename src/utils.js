(() => {
  const { KNOWN_KEYWORDS } = window.AppConfig;

  // # 用途：限制 MVP 只处理纯文本简历，避免 PDF 等格式被误读。
  function isTextFile(file) {
    return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
  }

  function isLastQuestion(state) {
    return state.currentIndex === state.questions.length - 1;
  }

  // # 用途：提取简历关键词，用来生成更贴近经历的问题和判断回答是否扣题。
  function extractKeywords(text) {
    const matches = KNOWN_KEYWORDS.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase()),
    );

    const fallback = text
      .split(/[\s,.;:，。；：/()]+/)
      .filter((word) => word.length >= 4 && word.length <= 20)
      .slice(0, 5);

    return [...new Set([...matches, ...fallback])].slice(0, 5);
  }

  function answerIncludesResumeSignal(answer, resumeText) {
    return extractKeywords(resumeText).some((keyword) =>
      answer.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  // # 用途：根据平均分生成最终报告里的概览评价。
  function buildSummary(score) {
    if (score >= 8) {
      return "你的回答已经有较强的结构和细节。下一步重点是压缩表达，并让结果更量化。";
    }

    if (score >= 6.5) {
      return "整体方向不错，但还需要更多具体例子、技术取舍和结果指标。";
    }

    return "目前回答偏概括。建议用 STAR 结构练习，把背景、行动和结果说清楚。";
  }

  function collectTopItems(answers, key) {
    const items = answers.flatMap((answer) => answer.feedback[key]);
    return [...new Set(items)].slice(0, 3);
  }

  function getScoreClass(score) {
    if (score >= 8) {
      return "score-good";
    }

    if (score >= 6) {
      return "score-mid";
    }

    return "score-low";
  }

  window.AppUtils = {
    answerIncludesResumeSignal,
    buildSummary,
    collectTopItems,
    extractKeywords,
    getScoreClass,
    isLastQuestion,
    isTextFile,
  };
})();
