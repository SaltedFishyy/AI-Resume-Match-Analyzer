(() => {
  const { ROLE_QUESTION_BANKS, ROLE_TIPS } = window.AppConfig;
  const { answerIncludesResumeSignal, extractKeywords } = window.AppUtils;

  // # 用途：没有后端或 OpenAI 调用失败时，仍然能在浏览器本地生成一轮面试题。
  function generateQuestions(role, resumeText, parsedResume) {
    const baseQuestions = ROLE_QUESTION_BANKS[role];
    const keywords = buildQuestionKeywords(resumeText, parsedResume);
    const targetedQuestions = buildTargetedQuestions(role, parsedResume);
    const questionPool = [...targetedQuestions, ...baseQuestions];

    return questionPool.slice(0, 5).map((question, index) => {
      const keyword = keywords[index % keywords.length];
      return keyword ? `${question} 回答时请尽量结合你简历中提到的「${keyword}」。` : question;
    });
  }

  // # 用途：从简历解析结果和全文里提取关键词，让 fallback 题目更贴近用户经历。
  function buildQuestionKeywords(resumeText, parsedResume) {
    const parsedSkills = parsedResume?.skills || [];
    return [...new Set([...parsedSkills, ...extractKeywords(resumeText)])].slice(0, 6);
  }

  // # 用途：根据简历技能生成更具体的追问，再按岗位相关性排序。
  function buildTargetedQuestions(role, parsedResume) {
    const skills = parsedResume?.skills || [];
    const projects = parsedResume?.projects || [];
    const questions = [];

    if (skills.includes("Redis")) {
      questions.push("如果要在你的项目中加入 Redis 缓存层，你会缓存哪些数据，如何处理过期和一致性？");
    }

    if (skills.includes("FastAPI")) {
      questions.push("你会如何用 FastAPI 设计一个可维护的 API 服务？请说明路由、校验、错误处理和测试思路。");
    }

    if (skills.includes("PostgreSQL") || skills.includes("SQL")) {
      questions.push("请结合你的项目说明数据库表设计、索引选择，以及如何优化慢查询。");
    }

    if (skills.includes("React")) {
      questions.push("请讲一个你用 React 构建复杂交互的例子，你如何拆组件和管理状态？");
    }

    if (skills.includes("Pandas") || skills.includes("Python")) {
      questions.push("请讲一个你用 Python 或 Pandas 处理数据的场景，如何验证数据结果是可靠的？");
    }

    if (projects.length > 0) {
      questions.push(`请深挖这个项目经历：${projects[0]}。你负责了什么，最大的技术难点是什么？`);
    }

    return prioritizeQuestionsForRole(role, questions);
  }

  function prioritizeQuestionsForRole(role, questions) {
    const roleSignals = {
      backend: ["Redis", "FastAPI", "数据库", "API", "缓存"],
      swe: ["React", "组件", "状态", "项目", "测试"],
      data: ["数据", "Pandas", "SQL", "指标", "验证"],
    };

    const signals = roleSignals[role];

    return questions.sort((a, b) => {
      const aScore = signals.some((signal) => a.includes(signal)) ? 1 : 0;
      const bScore = signals.some((signal) => b.includes(signal)) ? 1 : 0;
      return bScore - aScore;
    });
  }

  // # 用途：本地模拟评分逻辑，作为真实 AI 接口失败时的备用反馈。
  function evaluateAnswer({ role, answer, resumeText }) {
    let score = 5;
    const strengths = [];
    const weaknesses = [];

    if (answer.length > 180) {
      score += 1;
      strengths.push("回答比较完整，有一定展开。");
    } else {
      weaknesses.push("回答还偏短，建议补充更多上下文和具体细节。");
    }

    if (/\d|%|倍|用户|请求|延迟|成本|准确率|提升|减少/.test(answer)) {
      score += 1;
      strengths.push("回答中出现了可量化结果或影响，可信度更强。");
    } else {
      weaknesses.push("缺少量化结果，例如性能提升、用户数量、准确率或业务影响。");
    }

    if (/我|负责|实现|设计|优化|分析|排查|解决|built|designed|implemented/i.test(answer)) {
      score += 1;
      strengths.push("你说明了自己的行动，面试官更容易判断你的贡献。");
    } else {
      weaknesses.push("需要更明确地说出你本人做了什么，而不只是描述项目。");
    }

    if (/因为|所以|tradeoff|取舍|原因|why|考虑/.test(answer)) {
      score += 1;
      strengths.push("回答里有技术选择的理由，体现了思考过程。");
    } else {
      weaknesses.push("可以补充为什么这样设计，以及你考虑过哪些取舍。");
    }

    if (resumeText && answerIncludesResumeSignal(answer, resumeText)) {
      score += 1;
      strengths.push("回答和简历内容有关联，能形成更一致的候选人故事。");
    }

    weaknesses.push(ROLE_TIPS[role]);

    return {
      score: Math.max(4, Math.min(10, score)),
      strengths,
      weaknesses,
      improvedAnswer: buildImprovedAnswer(role),
    };
  }

  function buildImprovedAnswer(role) {
    const roleFocus = {
      backend:
        "我会补充系统背景、API 或数据库设计、遇到的瓶颈、我的优化动作，以及最后的性能或稳定性结果。",
      swe:
        "我会补充项目目标、我的具体贡献、关键技术取舍、如何保证质量，以及最终对用户或团队的影响。",
      data:
        "我会补充数据来源、清洗和建模过程、指标选择原因、验证方法，以及分析结论如何影响业务决策。",
    };

    return `可以这样加强：先用一句话交代背景，再明确你的任务和责任，然后说明具体行动。${roleFocus[role]} 最后用一个量化结果收尾，例如“响应时间降低 30%”“准确率提升 8%”或“减少每周 5 小时人工分析”。`;
  }

  window.InterviewEngine = {
    buildImprovedAnswer,
    evaluateAnswer,
    generateQuestions,
  };
})();
