(() => {
  const initialState = {
    role: "backend",
    resumeText: "",
    parsedResume: null,
    questions: [],
    currentIndex: 0,
    answers: [],
  };

  const state = { ...initialState };

  function resetState() {
    Object.assign(state, {
      ...initialState,
      questions: [],
      answers: [],
    });
  }

  window.AppState = {
    initialState,
    state,
    resetState,
  };
})();
