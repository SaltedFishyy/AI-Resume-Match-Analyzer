(() => {
  // # 用途：集中保存岗位、题库和本地 fallback 所需的固定配置。
  window.AppConfig = {
    ROLE_LABELS: {
      backend: "后端开发",
      swe: "软件工程师",
      data: "数据方向",
    },

    ROLE_QUESTION_BANKS: {
      backend: [
        "请挑一个你简历中的后端项目，解释它的核心架构、主要 API，以及你负责的部分。",
        "如果这个项目的请求量突然增长 10 倍，你会优先检查和优化哪些地方？",
        "请解释你在项目中如何设计数据库表、索引或数据访问逻辑。",
        "如果线上接口响应变慢，你会如何定位问题？请按排查顺序说明。",
        "请讲一个你处理认证、权限、缓存或错误处理的具体经历。",
      ],
      swe: [
        "请挑一个最能代表你工程能力的项目，说明问题背景、技术选择和最终结果。",
        "请讲一次你 debug 复杂问题的经历，你是如何缩小范围并验证原因的？",
        "如果让你重构简历中的一个项目，你会优先改哪里，为什么？",
        "请解释你如何保证代码质量，例如测试、代码 review、模块设计或文档。",
        "请讲一个你在团队协作中做过技术取舍的例子。",
      ],
      data: [
        "请挑一个数据项目，说明数据来源、清洗过程、分析方法和业务结论。",
        "如果数据中有大量缺失值或异常值，你会如何处理并验证处理是否合理？",
        "请解释你做过的一个指标分析，为什么选择这些指标？",
        "如果一个实验结果看起来显著，你会如何判断它是否真的可靠？",
        "请讲一个你用 SQL、统计或机器学习解决问题的具体经历。",
      ],
    },

    KNOWN_KEYWORDS: [
      "React",
      "Node",
      "Express",
      "Python",
      "Java",
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "AWS",
      "Docker",
      "API",
      "Machine Learning",
      "Data",
      "Dashboard",
      "Testing",
      "Authentication",
      "FastAPI",
      "Redis",
      "Flask",
      "Django",
      "MySQL",
      "TypeScript",
      "Pandas",
      "NumPy",
      "scikit-learn",
      "Tableau",
      "Power BI",
    ],

    ROLE_TIPS: {
      backend: "后端岗位建议补充接口设计、数据库、稳定性、性能或排查步骤。",
      swe: "软件工程师岗位建议补充工程质量、测试、协作和技术取舍。",
      data: "数据岗位建议补充数据来源、指标定义、验证方式和业务结论。",
    },

    PRACTICE_TOPICS: {
      backend: ["项目架构讲解", "数据库与索引", "线上问题排查"],
      swe: ["项目深挖", "代码质量与测试", "技术取舍表达"],
      data: ["SQL 与指标分析", "实验设计", "业务结论表达"],
    },

    ANSWER_TEMPLATES: {
      backend: {
        title: "建议使用 STAR 结构组织你的回答",
        steps: ["Situation 背景", "Task 任务", "Action 行动", "Result 结果"],
      },
      swe: {
        title: "建议使用 STAR 结构组织你的回答",
        steps: ["Situation 背景", "Task 任务", "Action 行动", "Result 结果"],
      },
      data: {
        title: "建议使用 STAR 结构组织你的回答",
        steps: ["Situation 背景", "Task 任务", "Action 行动", "Result 结果"],
      },
    },
  };
})();
