(() => {
  const { ROLE_LABELS } = window.AppConfig;
  const {
    getHealth,
    generateQuestions: generateQuestionsFromApi,
    evaluateAnswer: evaluateAnswerFromApi,
  } = window.AIInterviewApi;
  const { evaluateAnswer, generateQuestions } = window.InterviewEngine;
  const {
    renderAnswerHistory,
    renderAnswerTemplate,
    renderEmptyFeedback,
    renderFeedback,
    renderLatestScore,
    renderParsedResume,
    renderQuestion,
    renderReport,
    showInlineMessage,
  } = window.AppRender;
  const { resetState, state } = window.AppState;
  const { isLastQuestion, isTextFile } = window.AppUtils;
  const { parseResume } = window.ResumeParser;

  // # 用途：集中保存页面节点，避免交互逻辑里到处重复查询 DOM。
  const elements = {
    resumeFile: document.querySelector("#resumeFile"),
    fileName: document.querySelector("#fileName"),
    resumeInput: document.querySelector("#resumeInput"),
    parsedResumePanel: document.querySelector("#parsedResumePanel"),
    roleButtons: document.querySelectorAll(".role-button"),
    startButton: document.querySelector("#startButton"),
    resetButton: document.querySelector("#resetButton"),
    sessionStatus: document.querySelector("#sessionStatus"),
    aiStatus: document.querySelector("#aiStatus"),
    aiStatusText: document.querySelector("#aiStatusText"),
    systemBanner: document.querySelector("#systemBanner"),
    systemBannerText: document.querySelector("#systemBannerText"),
    questionCounter: document.querySelector("#questionCounter"),
    questionSource: document.querySelector("#questionSource"),
    questionBox: document.querySelector("#questionBox"),
    answerInput: document.querySelector("#answerInput"),
    submitButton: document.querySelector("#submitButton"),
    nextButton: document.querySelector("#nextButton"),
    feedbackContent: document.querySelector("#feedbackContent"),
    feedbackHint: document.querySelector("#feedbackHint"),
    feedbackSource: document.querySelector("#feedbackSource"),
    latestScore: document.querySelector("#latestScore"),
    templatePanel: document.querySelector("#templatePanel"),
    historyList: document.querySelector("#historyList"),
    reportPanel: document.querySelector("#reportPanel"),
    reportGrid: document.querySelector("#reportGrid"),
  };

  bindEvents();
  bindCharacterCounters();
  renderAnswerTemplate(elements, state.role);
  checkAiHealth();

  function bindEvents() {
    elements.roleButtons.forEach((button) => {
      button.addEventListener("click", () => selectRole(button.dataset.role));
    });

    elements.resumeFile.addEventListener("change", handleResumeFileUpload);
    elements.startButton.addEventListener("click", startInterview);
    elements.submitButton.addEventListener("click", submitAnswer);
    elements.nextButton.addEventListener("click", goToNextQuestion);
    elements.resetButton.addEventListener("click", resetDemo);
  }

  // # 用途：同步 textarea 右下角字数，让用户知道输入是否接近限制。
  function bindCharacterCounters() {
    document.querySelectorAll(".textarea-wrap").forEach((wrap) => {
      const textarea = wrap.querySelector("textarea");
      const counter = wrap.querySelector(".char-count");

      if (!textarea || !counter) {
        return;
      }

      const updateCounter = () => {
        counter.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
      };

      textarea.addEventListener("input", updateCounter);
      updateCounter();
    });
  }

  // # 用途：页面打开后检查后端服务、API Key 和当前模型，给用户明确状态。
  async function checkAiHealth() {
    updateAiStatus("pending", "正在检查 AI", "正在确认后端服务和模型配置。");

    try {
      const health = await getHealth();

      if (health.aiReady) {
        updateAiStatus("ready", "AI 已连接", `后端已启动，当前模型：${health.model}。`);
      } else {
        updateAiStatus("fallback", "本地模拟模式", "后端已启动，但没有配置 OPENAI_API_KEY。");
      }
    } catch (error) {
      updateAiStatus("fallback", "本地模拟模式", "后端未连接，当前只能使用本地模拟。");
    }
  }

  function updateAiStatus(status, label, detail) {
    elements.aiStatus.className = `ai-status-pill ${status}`;
    elements.aiStatusText.textContent = label;
    elements.systemBanner.className = `system-banner ${status}`;
    elements.systemBanner.querySelector("strong").textContent = label;
    elements.systemBannerText.textContent = detail;
  }

  function updateSourceLabel(type, source, extra = "") {
    const label = source === "ai" ? "由 AI 生成" : "由本地模拟生成";
    const text = extra ? `${label}：${extra}` : label;

    if (type === "question") {
      elements.questionSource.textContent = `题目来源：${text}`;
    }

    if (type === "feedback") {
      elements.feedbackSource.textContent = `反馈来源：${text}`;
    }
  }

  function selectRole(role) {
    state.role = role;

    elements.roleButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.role === role);
    });

    renderAnswerTemplate(elements, role);
  }

  function handleResumeFileUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!isTextFile(file)) {
      showInlineMessage(elements, "目前只支持上传 .txt 文本简历。PDF 会在后续版本加入。");
      elements.resumeFile.value = "";
      elements.fileName.textContent = "或直接粘贴文本";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      elements.resumeInput.value = String(reader.result || "").trim();
      elements.resumeInput.dispatchEvent(new Event("input"));
      elements.fileName.textContent = file.name;
      showInlineMessage(elements, "简历文本已导入，可以选择岗位并开始面试。");
    };

    reader.onerror = () => {
      showInlineMessage(elements, "文件读取失败，请直接粘贴简历文本再试一次。");
    };

    reader.readAsText(file, "UTF-8");
  }

  // # 用途：开始面试时优先调用真实 AI 接口，接口不可用时自动回退到本地题库。
  async function startInterview() {
    const resumeText = elements.resumeInput.value.trim();

    if (resumeText.length < 40) {
      showInlineMessage(elements, "请先粘贴或上传更完整的简历内容，至少 40 个字符。");
      return;
    }

    state.resumeText = resumeText;
    state.parsedResume = parseResume(resumeText);
    state.currentIndex = 0;
    state.answers = [];

    setBusy("questions", true);
    showInlineMessage(elements, "正在生成面试题，请稍等...");
    updateSourceLabel("question", "local", "生成中");
    let fallbackNotice = "";

    try {
      const result = await generateQuestionsFromApi({
        role: state.role,
        resumeText,
        parsedResume: state.parsedResume,
      });
      if (!Array.isArray(result.questions) || result.questions.length !== 5) {
        throw new Error("AI 返回的题目格式不正确。");
      }
      state.questions = result.questions;
      updateSourceLabel("question", "ai", result.model || "OpenAI");
      updateAiStatus("ready", "AI 已连接", `本轮题目由 AI 生成，模型：${result.model || "OpenAI"}。`);
    } catch (error) {
      state.questions = generateQuestions(state.role, resumeText, state.parsedResume);
      fallbackNotice = `${error.message} 已临时使用本地模拟题库。`;
      updateSourceLabel("question", "local", "AI 不可用");
      updateAiStatus("fallback", "本地模拟模式", fallbackNotice);
    } finally {
      setBusy("questions", false);
    }

    elements.answerInput.disabled = false;
    elements.submitButton.disabled = false;
    elements.nextButton.disabled = true;
    elements.answerInput.value = "";
    elements.answerInput.dispatchEvent(new Event("input"));
    elements.feedbackHint.textContent = "提交回答后，这里会显示评分、亮点、问题和优化示例。";
    elements.feedbackSource.textContent = "反馈来源：等待提交";
    elements.sessionStatus.innerHTML = `<span class="status-dot" aria-hidden="true"></span>${ROLE_LABELS[state.role]} 面试中`;

    renderLatestScore(elements, null);
    renderParsedResume(elements, state.parsedResume);
    renderQuestion(elements, state);
    renderEmptyFeedback(elements);

    if (fallbackNotice) {
      showInlineMessage(elements, fallbackNotice);
    }
  }

  // # 用途：提交回答后优先请求 AI 评分，失败时保留可用的本地评分体验。
  async function submitAnswer() {
    const answer = elements.answerInput.value.trim();

    if (answer.length < 30) {
      showInlineMessage(elements, "回答太短了。请至少写 30 个字符，让反馈更有参考价值。");
      return;
    }

    const question = state.questions[state.currentIndex];
    setBusy("feedback", true);
    showInlineMessage(elements, "AI 正在分析你的回答...");

    let feedback;

    try {
      feedback = await evaluateAnswerFromApi({
        role: state.role,
        question,
        answer,
        resumeText: state.resumeText,
        parsedResume: state.parsedResume,
      });
      updateSourceLabel("feedback", "ai", feedback.model || "OpenAI");
      updateAiStatus("ready", "AI 已连接", `本题反馈由 AI 生成，模型：${feedback.model || "OpenAI"}。`);
    } catch (error) {
      feedback = evaluateAnswer({
        role: state.role,
        answer,
        resumeText: state.resumeText,
      });
      feedback.weaknesses = [`${error.message} 已临时使用本地模拟反馈。`, ...feedback.weaknesses];
      updateSourceLabel("feedback", "local", "AI 不可用");
      updateAiStatus("fallback", "本地模拟模式", `${error.message} 已临时使用本地模拟反馈。`);
    } finally {
      setBusy("feedback", false);
    }

    state.answers[state.currentIndex] = {
      question,
      answer,
      feedback,
    };

    renderFeedback(elements, feedback);
    renderLatestScore(elements, feedback.score);
    renderAnswerHistory(elements, state.answers);

    elements.submitButton.disabled = true;
    elements.nextButton.disabled = false;

    if (isLastQuestion(state)) {
      elements.nextButton.innerHTML = '<span aria-hidden="true">▦</span>生成最终报告';
    }
  }

  function goToNextQuestion() {
    if (isLastQuestion(state)) {
      renderReport(elements, state);
      return;
    }

    state.currentIndex += 1;
    elements.answerInput.value = "";
    elements.answerInput.dispatchEvent(new Event("input"));
    elements.submitButton.disabled = false;
    elements.nextButton.disabled = true;
    elements.nextButton.innerHTML = '<span aria-hidden="true">›</span>下一题';

    renderLatestScore(elements, null);
    renderQuestion(elements, state);
    renderEmptyFeedback(elements);
    elements.feedbackSource.textContent = "反馈来源：等待提交";
  }

  function resetDemo() {
    resetState();

    elements.resumeFile.value = "";
    elements.fileName.textContent = "或直接粘贴文本";
    elements.resumeInput.value = "";
    elements.resumeInput.dispatchEvent(new Event("input"));
    elements.answerInput.value = "";
    elements.answerInput.dispatchEvent(new Event("input"));
    elements.answerInput.disabled = true;
    elements.submitButton.disabled = true;
    elements.nextButton.disabled = true;
    elements.nextButton.innerHTML = '<span aria-hidden="true">›</span>下一题';
    elements.questionCounter.textContent = "还未开始面试";
    elements.questionSource.textContent = "题目来源：等待生成";
    elements.feedbackSource.textContent = "反馈来源：等待提交";
    elements.questionBox.classList.add("idle");
    elements.questionBox.innerHTML = `
      <div class="question-empty-art" aria-hidden="true">
        <span>?</span>
      </div>
      <h3>请先在左侧填写简历内容并选择岗位</h3>
      <p>准备就绪后，点击「开始生成面试题」我们将为你生成个性化面试问题。</p>
    `;
    elements.sessionStatus.innerHTML = '<span class="status-dot" aria-hidden="true"></span>准备开始';
    renderEmptyReport();

    selectRole("backend");
    renderLatestScore(elements, null);
    renderParsedResume(elements, state.parsedResume);
    renderEmptyFeedback(elements);
    renderAnswerHistory(elements, state.answers);
    checkAiHealth();
  }

  function setBusy(type, isBusy) {
    if (type === "questions") {
      elements.startButton.disabled = isBusy;
      elements.startButton.innerHTML = isBusy
        ? '<span aria-hidden="true">...</span>正在生成面试题'
        : '<span aria-hidden="true">▶</span>开始生成面试题';
    }

    if (type === "feedback") {
      elements.submitButton.disabled = isBusy;
      elements.submitButton.innerHTML = isBusy
        ? '<span aria-hidden="true">...</span>正在分析回答'
        : '<span aria-hidden="true">✈</span>提交回答并获取反馈';
    }
  }

  function renderEmptyReport() {
    elements.reportGrid.innerHTML = `
      <div class="report-card metric-card">
        <span class="metric-icon blue" aria-hidden="true">♙</span>
        <h3>平均得分</h3>
        <p>--</p>
      </div>
      <div class="report-card metric-card">
        <span class="metric-icon green" aria-hidden="true">▤</span>
        <h3>回答题目</h3>
        <p>--</p>
      </div>
      <div class="report-card metric-card">
        <span class="metric-icon purple" aria-hidden="true">☆</span>
        <h3>优秀表现</h3>
        <p>--</p>
      </div>
      <div class="report-card metric-card">
        <span class="metric-icon orange" aria-hidden="true">◉</span>
        <h3>待改进项</h3>
        <p>--</p>
      </div>
    `;
  }
})();
