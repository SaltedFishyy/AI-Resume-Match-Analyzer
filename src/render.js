(() => {
  const { ANSWER_TEMPLATES, PRACTICE_TOPICS } = window.AppConfig;
  const { collectTopItems, getScoreClass } = window.AppUtils;

  // # 用途：把当前题号和题目展示到中间面试区。
  function renderQuestion(elements, state) {
    const currentNumber = state.currentIndex + 1;
    elements.questionCounter.textContent = `第 ${currentNumber} / ${state.questions.length} 题`;
    elements.questionBox.classList.remove("idle");
    elements.questionBox.textContent = state.questions[state.currentIndex];
    elements.answerInput.focus();
  }

  function renderLatestScore(elements, score) {
    elements.latestScore.innerHTML = score
      ? `<strong>${score}/10</strong><span>得分</span>`
      : "<strong>--</strong><span>得分</span>";
    elements.latestScore.className = `score-badge ${score ? getScoreClass(score) : ""}`.trim();
  }

  // # 用途：渲染 AI 或本地 fallback 返回的评分、亮点、问题和优化方向。
  function renderFeedback(elements, feedback) {
    elements.feedbackContent.innerHTML = [
      createCard("评分", `<p class="${getScoreClass(feedback.score)}">${feedback.score}/10</p>`),
      createCard("回答亮点", createList(feedback.strengths)),
      createCard("可以改进", createList(feedback.weaknesses)),
      createCard("更强回答方向", `<p>${feedback.improvedAnswer}</p>`),
    ].join("");
  }

  function renderEmptyFeedback(elements) {
    elements.feedbackContent.innerHTML = `
      <div class="empty-state feedback-empty">
        <div class="empty-illustration" aria-hidden="true">
          <span>★</span>
        </div>
        <span>暂无反馈</span>
        <p>完成这一题后，你会看到具体建议。</p>
      </div>
    `;
  }

  function renderAnswerTemplate(elements, role) {
    const template = ANSWER_TEMPLATES[role];

    elements.templatePanel.innerHTML = `
      <h3>${template.title}</h3>
      <ul class="template-steps">
        ${template.steps.map((step) => `<li><b>${step[0]}</b>${step}</li>`).join("")}
      </ul>
    `;
  }

  // # 用途：显示简历解析结果，让用户知道系统识别到了哪些信息。
  function renderParsedResume(elements, parsedResume) {
    if (!parsedResume) {
      elements.parsedResumePanel.innerHTML = `
        <div class="panel-title">
          <span class="mini-icon" aria-hidden="true">▣</span>
          <h3>简历解析结果</h3>
        </div>
        <p>开始面试后会显示解析出的技能、项目、经历和教育信息。</p>
      `;
      return;
    }

    elements.parsedResumePanel.innerHTML = `
      <div class="panel-title">
        <span class="mini-icon" aria-hidden="true">▣</span>
        <h3>简历解析结果</h3>
      </div>
      ${createParsedGroup("Skills", parsedResume.skills, "parsed-tags")}
      ${createParsedGroup("Projects", parsedResume.projects, "parsed-list")}
      ${createParsedGroup("Experience", parsedResume.experience, "parsed-list")}
      ${createParsedGroup("Education", parsedResume.education, "parsed-list")}
    `;
  }

  // # 用途：面试结束后汇总平均分、答题数、优势和后续练习方向。
  function renderReport(elements, state) {
    const answered = state.answers.filter(Boolean);
    const average = answered.reduce((total, item) => total + item.feedback.score, 0) / answered.length;
    const roundedAverage = Math.round(average * 10) / 10;

    elements.sessionStatus.innerHTML = '<span class="status-dot" aria-hidden="true"></span>面试完成';
    elements.nextButton.disabled = true;
    elements.submitButton.disabled = true;
    elements.answerInput.disabled = true;

    elements.reportGrid.innerHTML = [
      createReportCard("平均得分", `<p class="${getScoreClass(roundedAverage)}">${roundedAverage}/10</p>`),
      createReportCard("回答题目", `<p>${answered.length} 题</p>`),
      createReportCard("优秀表现", createList(collectTopItems(answered, "strengths"))),
      createReportCard("待改进项", createList(PRACTICE_TOPICS[state.role])),
    ].join("");

    elements.reportPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderAnswerHistory(elements, answers) {
    const answered = answers.filter(Boolean);

    if (answered.length === 0) {
      elements.historyList.innerHTML = `
        <div class="empty-state history-empty">
          <div class="empty-illustration clipboard" aria-hidden="true">
            <span>✓</span>
          </div>
          <span>暂无回答记录</span>
          <p>完成第一题后，历史记录会出现在这里。</p>
        </div>
      `;
      return;
    }

    elements.historyList.innerHTML = answered
      .map((item, index) => createHistoryCard(item, index))
      .join("");
  }

  function showInlineMessage(elements, message) {
    elements.feedbackContent.innerHTML = createCard("提示", `<p>${message}</p>`);
  }

  function createCard(title, content) {
    return `
      <div class="feedback-card">
        <h3>${title}</h3>
        ${content}
      </div>
    `;
  }

  function createReportCard(title, content) {
    return `
      <div class="report-card">
        <h3>${title}</h3>
        ${content}
      </div>
    `;
  }

  function createList(items) {
    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function createParsedGroup(title, items, className) {
    if (!items || items.length === 0) {
      return "";
    }

    return `
      <div class="parsed-group">
        <strong>${title}</strong>
        <ul class="${className}">
          ${items.map((item) => `<li>${escapeHtml(truncateText(item, 80))}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function createHistoryCard(item, index) {
    return `
      <article class="history-card">
        <div class="history-card-header">
          <h3>第 ${index + 1} 题</h3>
          <span class="history-meta ${getScoreClass(item.feedback.score)}">${item.feedback.score}/10</span>
        </div>
        <p><strong>题目：</strong>${escapeHtml(truncateText(item.question, 90))}</p>
        <p><strong>回答：</strong>${escapeHtml(truncateText(item.answer, 120))}</p>
      </article>
    `;
  }

  function truncateText(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AppRender = {
    renderAnswerHistory,
    renderAnswerTemplate,
    renderEmptyFeedback,
    renderFeedback,
    renderLatestScore,
    renderQuestion,
    renderReport,
    renderParsedResume,
    showInlineMessage,
  };
})();
