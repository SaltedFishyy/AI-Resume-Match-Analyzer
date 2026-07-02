(() => {
  const { KNOWN_KEYWORDS } = window.AppConfig;

  // # 用途：识别常见简历区块标题，支持中英文简历。
  const SECTION_ALIASES = {
    skills: ["skills", "technical skills", "technologies", "技能", "技术栈", "专业技能"],
    projects: ["projects", "project experience", "personal projects", "项目", "项目经历"],
    experience: ["experience", "work experience", "employment", "经历", "工作经历", "实习经历"],
    education: ["education", "学历", "教育经历", "education background"],
  };

  // # 用途：把纯文本简历拆成技能、项目、经历和教育，供题目生成使用。
  function parseResume(text) {
    const lines = normalizeLines(text);
    const sections = splitIntoSections(lines);

    return {
      skills: extractSkills(text, sections.skills),
      projects: extractHighlights(sections.projects, 3),
      experience: extractHighlights(sections.experience, 3),
      education: extractHighlights(sections.education, 2),
    };
  }

  function normalizeLines(text) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function splitIntoSections(lines) {
    const sections = {
      skills: [],
      projects: [],
      experience: [],
      education: [],
      other: [],
    };
    let currentSection = "other";

    lines.forEach((line) => {
      const detectedSection = detectSection(line);

      if (detectedSection.section) {
        currentSection = detectedSection.section;
        if (detectedSection.inlineContent) {
          sections[currentSection].push(detectedSection.inlineContent);
        }
        return;
      }

      sections[currentSection].push(line);
    });

    return sections;
  }

  function detectSection(line) {
    const [rawTitle, ...rest] = line.split(/[:：]/);
    const normalized = rawTitle.toLowerCase().trim();
    const inlineContent = rest.join(":").trim();

    const matchedSection = Object.entries(SECTION_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalized === alias || normalized.includes(alias)),
    )?.[0];

    return {
      section: matchedSection,
      inlineContent,
    };
  }

  function extractSkills(text, skillLines) {
    const knownMatches = KNOWN_KEYWORDS.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase()),
    );

    const sectionSkills = skillLines
      .join(",")
      .split(/[,，|/;；•·]+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2 && item.length <= 30);

    return [...new Set([...knownMatches, ...sectionSkills])].slice(0, 12);
  }

  function extractHighlights(lines, maxItems) {
    return lines
      .filter((line) => line.length >= 8)
      .map((line) => stripBullet(line))
      .slice(0, maxItems);
  }

  function stripBullet(line) {
    return line.replace(/^[-*•·]\s*/, "");
  }

  window.ResumeParser = {
    parseResume,
  };
})();
