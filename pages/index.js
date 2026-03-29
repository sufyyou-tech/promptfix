import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const MODE_OPTIONS = {
  content: ["instagram", "twitter", "linkedin", "youtube", "tiktok", "newsletter"],
  writing: ["blog", "story", "caption", "email", "essay", "script"],
  business: ["strategy", "marketing", "pitch", "growth", "analysis", "competitor"],
  coding: ["basic", "production", "optimized", "debugging", "architecture", "review"],
  learning: ["beginner", "intermediate", "advanced", "tutorial", "quiz", "summary"],
  personal: ["advice", "reflection", "decision-making", "habit", "goal", "motivation"],
  travel: ["budget", "luxury", "weekend", "detailed", "food", "solo"],
};

const MODE_SELECT_OPTIONS = [
  { value: "content", label: "Create content" },
  { value: "writing", label: "Write something" },
  { value: "business", label: "Solve a business problem" },
  { value: "coding", label: "Build or debug code" },
  { value: "learning", label: "Learn something" },
  { value: "personal", label: "Get advice" },
  { value: "travel", label: "Plan a trip" },
];

const STYLE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "concise", label: "Concise" },
  { value: "creative", label: "Creative" },
  { value: "professional", label: "Professional" },
];

const IMPROVEMENT_SUGGESTIONS = {
  content: ["Stronger hook", "More engaging", "Add CTA", "Improve readability"],
  writing: ["More engaging", "Improve clarity", "Add storytelling", "Make concise"],
  business: ["More persuasive", "Add structure", "Make actionable", "Clarify strategy"],
  coding: ["Optimize performance", "Improve readability", "Add comments", "Handle edge cases"],
  learning: ["Simplify explanation", "Add examples", "Step-by-step", "Add analogy"],
  personal: ["Be more direct", "Add practical steps", "More empathetic", "Clarify thinking"],
  travel: ["Add budget details", "More detailed", "Add local tips", "Optimize plan"],
};

const PLACEHOLDERS = {
  content: "Describe the content you want to create...",
  writing: "What do you want to write?",
  business: "What business problem are you solving?",
  coding: "What do you want to build or fix?",
  learning: "What do you want to learn or explain?",
  personal: "What do you need advice or clarity on?",
  travel: "Where do you want to travel and what matters most?",
};

const LLM_LAYER = {
  chatgpt: {
    instruction: "Use clear structure with headings, bullets, and practical steps.",
    format: "Title -> Overview -> Key sections -> Action items -> Summary.",
  },
  claude: {
    instruction: "Use nuanced reasoning, honest tradeoffs, and strong explanation quality.",
    format: "Thoughtful prose with lists only when they truly help.",
  },
  gemini: {
    instruction: "Lead with the answer, stay direct, and cut filler aggressively.",
    format: "Answer first, justification second, each section compact.",
  },
};

const MODE_ENHANCERS = {
  content: {
    core: "Include a strong hook, audience awareness, engagement drivers, and a clear CTA when relevant.",
    sub: {
      instagram: "Keep it visual, punchy, and carousel-friendly.",
      twitter: "Prioritise brevity, punch, and quote-worthy lines.",
      linkedin: "Use insight-led storytelling with a professional edge.",
      youtube: "Include retention hooks, SEO title logic, and clear structure.",
      tiktok: "Optimise for a fast first two seconds and trend-aware pacing.",
      newsletter: "Make it scannable with a strong subject line and one clear CTA.",
    },
  },
  writing: {
    core: "Focus on voice, clarity, pacing, and emotional resonance.",
    sub: {
      blog: "Use SEO-aware headings, tight structure, and a strong close.",
      story: "Use scene, conflict, voice, and emotional movement.",
      caption: "Keep it compact, memorable, and tonally consistent.",
      email: "Drive one outcome with a sharp subject line and CTA.",
      essay: "Build around a clear thesis, evidence, and conclusion.",
      script: "Make dialogue sound spoken and pacing feel natural.",
    },
  },
  business: {
    core: "Ground the answer in execution, risks, KPIs, and real-world constraints.",
    sub: {
      strategy: "Use a clear framework, priorities, milestones, and measures.",
      marketing: "Cover ICP, positioning, channels, funnel, and budget logic.",
      pitch: "Move cleanly from problem to solution, traction, and ask.",
      growth: "Focus on acquisition, retention, experiments, and north-star impact.",
      analysis: "Call out methodology, findings, implications, and next decisions.",
      competitor: "Compare strengths, gaps, threats, and response options.",
    },
  },
  coding: {
    core: "Write maintainable code, explain tradeoffs, and handle edge cases cleanly.",
    sub: {
      basic: "Be beginner-friendly and explain the moving parts clearly.",
      production: "Include resilience, error handling, and test awareness.",
      optimized: "Discuss complexity, bottlenecks, and performance choices.",
      debugging: "Reproduce, isolate, fix, test, and document the issue.",
      architecture: "Clarify boundaries, data flow, and scalability decisions.",
      review: "Audit readability, reliability, performance, and coverage gaps.",
    },
  },
  learning: {
    core: "Make concepts stick with examples, analogies, and progressive explanation.",
    sub: {
      beginner: "Assume no prior knowledge and define jargon simply.",
      intermediate: "Add nuance, comparisons, and common pitfalls.",
      advanced: "Cover edge cases, tradeoffs, and expert-level depth.",
      tutorial: "Teach step by step with expected outcomes and troubleshooting.",
      quiz: "Use recall plus application questions with explanations.",
      summary: "Condense to the core ideas and important misconceptions.",
    },
  },
  personal: {
    core: "Be empathetic, candid, practical, and specific. Avoid platitudes.",
    sub: {
      advice: "Offer options, consequences, and concrete next steps.",
      reflection: "Use prompts that surface patterns and perspective shifts.",
      "decision-making": "Use values, reversibility, and downside analysis.",
      habit: "Work with cues, routines, friction, and consistency.",
      goal: "Use milestones, accountability, and measurable progress.",
      motivation: "Reconnect to why, momentum, and energy management.",
    },
  },
  travel: {
    core: "Anchor recommendations in logistics, budget, timing, and local insight.",
    sub: {
      budget: "Break down costs, low-cost wins, and transport savings.",
      luxury: "Focus on premium stays, curation, and seamless logistics.",
      weekend: "Optimise for short time windows and efficient routing.",
      detailed: "Make it day-by-day with timings, backups, and packing context.",
      food: "Recommend dishes, neighborhoods, timing, and local favorites.",
      solo: "Address safety, social opportunities, and solo-friendly choices.",
    },
  },
};

const VARIATION_CONFIGS = [
  {
    label: "Balanced",
    style: "structured, thorough, and reliable",
    instruction: "Prioritise clarity and completeness. This is the single premium default output.",
    format: "Clear headings. Logical section order. Practical finish.",
  },
];

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const glass = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.018))",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.11)",
  borderRadius: 20,
  boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
};

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  marginTop: 8,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f2f2f2",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: FONT,
  WebkitAppearance: "none",
  display: "block",
};

const sectionLabel = {
  fontSize: 11,
  color: "#666",
  letterSpacing: "0.08em",
  fontWeight: 600,
  display: "block",
  textTransform: "uppercase",
};

const ghostButton = {
  padding: "11px 14px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.05)",
  color: "#9d9d9d",
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: FONT,
  transition: "background 0.15s, color 0.15s, border-color 0.15s",
};

function analyzeInput(input) {
  const words = input.trim() ? input.trim().split(/\s+/) : [];
  const wordCount = words.length;
  return {
    depth:
      wordCount < 5
        ? "Input is brief - expand intelligently and state assumptions."
        : wordCount > 25
        ? "Rich context provided - use all details as anchors."
        : "Moderate context - infer sensible details and fill gaps logically.",
    wordCount,
    isQuestion: /\?/.test(input),
    isVague: wordCount < 5,
  };
}

function getTone(style) {
  if (style === "creative") {
    return {
      label: "expressive and imaginative",
      note: "Use distinctive framing and stronger creative angles.",
    };
  }
  if (style === "professional") {
    return {
      label: "formal and professional",
      note: "Keep the prompt polished, precise, and authoritative.",
    };
  }
  if (style === "concise") {
    return {
      label: "direct and efficient",
      note: "Bias toward brevity, clarity, and immediate usefulness.",
    };
  }
  return {
    label: "balanced and clear",
    note: "Keep the prompt clean, premium, and broadly usable.",
  };
}

function detectSubMode(mode, topic) {
  const options = MODE_OPTIONS[mode] || [];
  const lower = topic.toLowerCase();
  let best = "";
  let score = 0;

  options.forEach((option) => {
    const pattern = new RegExp(`\\b${option.replace(/\s+/g, "\\s+")}\\b`, "i");
    let nextScore = 0;
    if (pattern.test(lower)) nextScore += 2;
    if (lower.includes(option)) nextScore += 1;
    if (nextScore > score) {
      best = option;
      score = nextScore;
    }
  });

  return score > 0 ? best : "";
}

function buildPrompt(variationIndex, topic, mode, subMode, style, llm) {
  const analysis = analyzeInput(topic);
  const tone = getTone(style);
  const llmCfg = LLM_LAYER[llm];
  const varCfg = VARIATION_CONFIGS[variationIndex] || VARIATION_CONFIGS[0];
  const modeCfg = MODE_ENHANCERS[mode];
  const subEnhancer = subMode && modeCfg?.sub?.[subMode] ? modeCfg.sub[subMode] : "";
  const seed = Math.random().toFixed(8);
  const styleNote =
    style === "default"
      ? "No extra style bias - optimise for a clean premium default."
      : `Selected style: ${style}. Honour it explicitly.`;

  return `# ROLE
You are an elite ${mode} specialist and expert communicator. Your output will be used directly - make it production-ready.

# PRIMARY TASK
${topic}

# INPUT ANALYSIS
- Depth cue: ${analysis.depth}
- Word count: ${analysis.wordCount}${analysis.isVague ? " - this is sparse, so infer context intelligently." : ""}
${analysis.isQuestion ? "- This is a question - answer it directly first, then elaborate." : ""}

# STYLE
- Register: ${tone.label}
- Guidance: ${tone.note}
- Preference: ${styleNote}

# VARIATION
- Profile: ${varCfg.style}
- Instruction: ${varCfg.instruction}
- Format: ${varCfg.format}

# DOMAIN REQUIREMENTS (${mode.toUpperCase()}${subMode ? ` > ${subMode}` : ""})
${modeCfg?.core || ""}
${subEnhancer ? `\nFORMAT-SPECIFIC: ${subEnhancer}` : ""}

# LLM OPTIMISATION (${llm.toUpperCase()})
${llmCfg.instruction}
Response structure: ${llmCfg.format}

# QUALITY STANDARDS
- Never open with filler
- Be specific to this exact task
- State assumptions only when needed
- Cover likely pitfalls proactively
- Keep the answer realistic and useful

# DIFFERENTIATION SEED: ${seed}
This prompt should feel premium, clear, and immediately usable.

# OUTPUT STRUCTURE
1. Core deliverable
2. Key considerations / watch-outs
3. Immediate next steps
`;
}

function buildImprovementRequest(currentOutput, instruction) {
  return `Improve the following prompt:
${currentOutput}

Instruction:
${instruction}

Return a better version.`;
}

function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bp]);

  return isMobile;
}

export default function Home() {
  const isMobile = useIsMobile();

  const [mode, setMode] = useState("content");
  const [form, setForm] = useState({ llm: "chatgpt", topic: "", style: "default" });
  const [output, setOutput] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [mobileTab, setMobileTab] = useState("input");
  const [improvementText, setImprovementText] = useState("");
  const [showImprovementInput, setShowImprovementInput] = useState(false);

  const typingRef = useRef(null);
  const cancelTypingRef = useRef(false);
  const copyTimeoutRef = useRef(null);

  const stopTyping = useCallback(() => {
    cancelTypingRef.current = true;
    clearInterval(typingRef.current);
  }, []);

  const updateFormField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleModeChange = useCallback((event) => {
    setMode(event.target.value);
    setShowImprovementInput(false);
    setImprovementText("");
  }, []);

  const handleLlmChange = useCallback((event) => {
    updateFormField("llm", event.target.value);
  }, [updateFormField]);

  const handleStyleChange = useCallback((event) => {
    updateFormField("style", event.target.value);
  }, [updateFormField]);

  const handleTopicChange = useCallback((event) => {
    updateFormField("topic", event.target.value);
    if (error) setError("");
  }, [error, updateFormField]);

  const handleImprovementChange = useCallback((event) => {
    setImprovementText(event.target.value);
  }, []);

  const handleMobileTabChange = useCallback((event) => {
    const nextTab = event.currentTarget.dataset.tab;
    if (nextTab) setMobileTab(nextTab);
  }, []);

  const generateSinglePrompt = useCallback((topicValue) => {
    const resolvedSubMode = detectSubMode(mode, topicValue);
    return buildPrompt(0, topicValue, mode, resolvedSubMode, form.style, form.llm);
  }, [form.llm, form.style, mode]);

  const handleGenerate = useCallback(async (event) => {
    event.preventDefault();

    const topic = form.topic.trim();
    if (!topic) {
      setError("Please enter a prompt before generating.");
      return;
    }

    setError("");
    setCopied(false);
    stopTyping();
    setLoading(true);
    setOutput("");
    setDisplayed("");
    setIsTyping(false);
    setShowImprovementInput(false);
    setImprovementText("");

    try {
      const prompt = generateSinglePrompt(topic);
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.text) {
        throw new Error(data?.error || "Unable to generate a response right now. Please try again.");
      }

      setOutput(data.text);
      if (isMobile) setMobileTab("output");
    } catch (error) {
      setError(error?.message || "Unable to generate a response right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form.topic, generateSinglePrompt, isMobile, stopTyping]);

  const handleRegenerate = useCallback(() => {
    const topic = form.topic.trim();
    if (!topic) {
      setError("Please enter a prompt first.");
      return;
    }

    setError("");
    setCopied(false);
    stopTyping();
    setLoading(true);
    setOutput("");
    setDisplayed("");
    setIsTyping(false);

    const nextOutput = generateSinglePrompt(topic);
    setOutput(nextOutput);
    setLoading(false);

    if (isMobile) setMobileTab("output");
  }, [form.topic, generateSinglePrompt, isMobile, stopTyping]);

  const handleClear = useCallback(() => {
    stopTyping();
    setForm((prev) => ({ ...prev, topic: "", style: "default" }));
    setOutput("");
    setDisplayed("");
    setIsTyping(false);
    setCopied(false);
    setError("");
    setImprovementText("");
    setShowImprovementInput(false);
    if (isMobile) setMobileTab("input");
  }, [isMobile, stopTyping]);

  const handleSuggestionClick = useCallback((event) => {
    const suggestion = event.currentTarget.dataset.suggestion || "";
    setImprovementText(suggestion);
    setShowImprovementInput(true);
    if (isMobile) setMobileTab("output");
  }, [isMobile]);

  const handleApplyImprovement = useCallback(async (event) => {
    event.preventDefault();

    const instruction = improvementText.trim();
    if (!output || !instruction) return;

    const previousOutput = output;
    const previousDisplayed = output;

    setError("");
    setCopied(false);
    stopTyping();
    setIsTyping(false);
    setLoading(true);

    try {
      const prompt = buildImprovementRequest(output, instruction);
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.text) {
        throw new Error(data?.error || "Unable to improve the prompt right now. Please try again.");
      }

      setOutput(data.text);
      if (isMobile) setMobileTab("output");
    } catch (error) {
      setOutput(previousOutput);
      setDisplayed(previousDisplayed);
      setIsTyping(false);
      setError(error?.message || "Unable to improve the prompt right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [improvementText, isMobile, output, stopTyping]);

  const handleCopy = useCallback(async () => {
    const text = displayed || output;
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent clipboard fallback failure.
    }
  }, [displayed, output]);

  useEffect(() => {
    if (!output) {
      setDisplayed("");
      setIsTyping(false);
      return undefined;
    }

    cancelTypingRef.current = false;
    clearInterval(typingRef.current);
    let index = 0;

    setDisplayed("");
    setIsTyping(true);

    typingRef.current = setInterval(() => {
      if (cancelTypingRef.current) {
        clearInterval(typingRef.current);
        return;
      }

      index += 1;
      setDisplayed(output.slice(0, index));

      if (index >= output.length) {
        clearInterval(typingRef.current);
        setIsTyping(false);
      }
    }, 14);

    return () => {
      cancelTypingRef.current = true;
      clearInterval(typingRef.current);
    };
  }, [output]);

  useEffect(() => {
    return () => {
      stopTyping();
      clearTimeout(copyTimeoutRef.current);
    };
  }, [stopTyping]);

  const hasOutput = Boolean(output);

  const modeOptionMarkup = useMemo(() => {
    return MODE_SELECT_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  }, []);

  const styleOptionMarkup = useMemo(() => {
    return STYLE_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  }, []);

  const llmOptionMarkup = useMemo(() => {
    return Object.keys(LLM_LAYER).map((option) => (
      <option key={option} value={option}>
        {option.charAt(0).toUpperCase() + option.slice(1)}
      </option>
    ));
  }, []);

  const suggestionButtons = useMemo(() => {
    return (IMPROVEMENT_SUGGESTIONS[mode] || []).map((suggestion) => (
      <button
        key={suggestion}
        type="button"
        data-suggestion={suggestion}
        onClick={handleSuggestionClick}
        style={{
          ...ghostButton,
          padding: "10px 12px",
          color: "#d7d7d7",
          background: "rgba(255,255,255,0.035)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {suggestion}
      </button>
    ));
  }, [handleSuggestionClick, mode]);

  const mobileTabs = useMemo(() => {
    const tabs = [
      { id: "input", label: "Create" },
      { id: "output", label: "Output" },
    ];

    return tabs.map((tab) => {
      const active = mobileTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          data-tab={tab.id}
          onClick={handleMobileTabChange}
          style={{
            flex: 1,
            textAlign: "center",
            padding: "11px 12px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: active ? 600 : 500,
            background: active ? "rgba(255,255,255,0.11)" : "transparent",
            color: active ? "#f5f5f5" : "#8d8d8d",
            cursor: "pointer",
            border: "none",
            userSelect: "none",
            fontFamily: FONT,
            transition: "all 0.15s",
          }}
        >
          {tab.label}
        </button>
      );
    });
  }, [handleMobileTabChange, mobileTab]);

  // Keep this memoized JSX inside Home and render it as {InputPanel} to preserve textarea focus stability.
  const InputPanel = useMemo(() => (
    <form onSubmit={handleGenerate} style={{ ...glass, padding: isMobile ? 18 : 26 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...sectionLabel, margin: "0 0 10px" }}>Prompt setup</p>
        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? 22 : 24,
            lineHeight: 1.2,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "#f8f8f8",
          }}
        >
          Shape one premium prompt.
        </h2>
        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, color: "#9c9c9c" }}>
          Keep the brief simple. The output stays focused, clean, and ready to use.
        </p>
      </div>

      <label style={sectionLabel}>What do you want to do?</label>
      <select value={mode} onChange={handleModeChange} style={inputBase}>
        {modeOptionMarkup}
      </select>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 14,
          marginTop: 22,
        }}
      >
        <div>
          <label style={sectionLabel}>Target model</label>
          <select value={form.llm} onChange={handleLlmChange} style={inputBase}>
            {llmOptionMarkup}
          </select>
        </div>

        <div>
          <label style={sectionLabel}>Style (optional)</label>
          <select value={form.style} onChange={handleStyleChange} style={inputBase}>
            {styleOptionMarkup}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={sectionLabel}>Your prompt</label>
        <textarea
          placeholder={PLACEHOLDERS[mode]}
          value={form.topic}
          onChange={handleTopicChange}
          style={{
            ...inputBase,
            minHeight: isMobile ? 132 : 156,
            resize: "vertical",
            overflow: "auto",
            lineHeight: 1.7,
          }}
        />
        {error && <p style={{ fontSize: 12, color: "#f87171", margin: "8px 0 0" }}>{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px 16px",
          borderRadius: 14,
          background: loading
            ? "rgba(255,255,255,0.12)"
            : "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(214,214,214,0.94))",
          color: "#000",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 700,
          fontSize: 15,
          marginTop: 24,
          letterSpacing: "0.01em",
          fontFamily: FONT,
          boxShadow: "0 10px 30px rgba(255,255,255,0.08)",
        }}
      >
        {loading ? "Building prompt..." : "Generate prompt"}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <button type="button" onClick={handleRegenerate} style={ghostButton}>
          Regenerate
        </button>
        <button type="button" onClick={handleClear} style={ghostButton}>
          Clear
        </button>
      </div>
    </form>
  ), [
    error,
    form.llm,
    form.style,
    form.topic,
    handleClear,
    handleGenerate,
    handleLlmChange,
    handleModeChange,
    handleRegenerate,
    handleStyleChange,
    handleTopicChange,
    isMobile,
    llmOptionMarkup,
    loading,
    mode,
    modeOptionMarkup,
    styleOptionMarkup,
  ]);

  const OutputPanel = useMemo(() => (
    <div style={{ ...glass, padding: isMobile ? 18 : 26 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...sectionLabel, margin: "0 0 10px" }}>Output</p>
        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? 22 : 24,
            lineHeight: 1.2,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "#f8f8f8",
          }}
        >
          One refined result.
        </h2>
        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, color: "#9c9c9c" }}>
          Generate once, then sharpen it with focused improvements.
        </p>
      </div>

      {!hasOutput && (
        <div
          style={{
            padding: isMobile ? "42px 18px" : "64px 26px",
            textAlign: "center",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: 16,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.14)",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 14, color: "#a3a3a3", margin: 0 }}>
            Your generated prompt will appear here.
          </p>
          <p style={{ fontSize: 12, color: "#6d6d6d", marginTop: 8 }}>
            {isMobile ? "Write a brief, then switch to Output." : "Write a brief and generate a prompt."}
          </p>
        </div>
      )}

      {hasOutput && (
        <>
          <div
            style={{
              padding: isMobile ? 16 : 18,
              borderRadius: 16,
              background: "rgba(255,255,255,0.028)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#7dd3fc",
                    display: "inline-block",
                    boxShadow: "0 0 8px rgba(125,211,252,0.7)",
                  }}
                />
                <span style={{ fontSize: 12, color: "#d0d0d0", fontWeight: 600 }}>Generated prompt</span>
                {isTyping && <span style={{ fontSize: 10, color: "#6f6f6f", fontStyle: "italic" }}>writing...</span>}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!displayed && !output}
                style={{
                  padding: "6px 13px",
                  borderRadius: 10,
                  background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                  color: copied ? "#34d399" : "#b5b5b5",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: displayed || output ? "pointer" : "not-allowed",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT,
                  minWidth: 72,
                  minHeight: 32,
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre
              style={{
                fontSize: isMobile ? 12.5 : 13,
                lineHeight: 1.8,
                maxHeight: isMobile ? 260 : 360,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#d8d8d8",
                fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                margin: 0,
                padding: 0,
              }}
            >
              {displayed}
              {isTyping && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "0.9em",
                    background: "#7dd3fc",
                    marginLeft: 2,
                    verticalAlign: "text-bottom",
                    animation: "blink 0.7s step-end infinite",
                  }}
                />
              )}
            </pre>
          </div>

          <div style={{ marginTop: 26 }}>
            <p style={{ ...sectionLabel, margin: 0, color: "#7c7c7c" }}>Improve prompt</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))",
                gap: 10,
                marginTop: 12,
              }}
            >
              {suggestionButtons}
            </div>
          </div>

          {showImprovementInput && (
            <form
              onSubmit={handleApplyImprovement}
              style={{
                marginTop: 18,
                padding: isMobile ? 16 : 18,
                borderRadius: 16,
                background: "rgba(255,255,255,0.024)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <label style={sectionLabel}>Improvement instruction</label>
              <textarea
                placeholder="Describe how you want to improve this prompt..."
                value={improvementText}
                onChange={handleImprovementChange}
                style={{ ...inputBase, minHeight: 110, resize: "vertical", lineHeight: 1.7 }}
              />
              <button
                type="submit"
                disabled={!improvementText.trim() || loading}
                style={{
                  marginTop: 14,
                  width: isMobile ? "100%" : "auto",
                  minWidth: 180,
                  padding: "13px 16px",
                  borderRadius: 12,
                  background:
                    !improvementText.trim() || loading ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.92)",
                  color: "#000",
                  border: "none",
                  cursor: !improvementText.trim() || loading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: FONT,
                }}
              >
                {loading ? "Applying..." : "Apply improvement"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  ), [
    copied,
    displayed,
    handleApplyImprovement,
    handleCopy,
    handleImprovementChange,
    hasOutput,
    improvementText,
    isMobile,
    isTyping,
    loading,
    output,
    showImprovementInput,
    suggestionButtons,
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 34%), radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 20%), linear-gradient(180deg, #0b0d12 0%, #050608 100%)",
        padding: isMobile ? "20px 14px 42px" : "34px 24px 48px",
        color: "#fff",
        fontFamily: FONT,
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ marginBottom: isMobile ? 18 : 30 }}>
          <h1
            style={{
              fontSize: isMobile ? 30 : 42,
              fontWeight: 650,
              letterSpacing: "-0.05em",
              margin: 0,
              lineHeight: 1.02,
              color: "#fafafa",
            }}
          >
            PromptEngine Elite
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 15, color: "#8f8f8f", marginTop: 10, lineHeight: 1.65 }}>
            A minimal prompt tool with one polished output and a focused improvement loop.
          </p>
        </div>

        {isMobile && (
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.045)",
              borderRadius: 13,
              padding: 4,
              marginBottom: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {mobileTabs}
          </div>
        )}

        {isMobile ? (
          <>
            {mobileTab === "input" && InputPanel}
            {mobileTab === "output" && OutputPanel}
          </>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 400px) minmax(0, 1fr)",
              gap: 22,
              alignItems: "start",
            }}
          >
            {InputPanel}
            {OutputPanel}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        select option { background: #0a0c11; color: #f2f2f2; }
        textarea::placeholder,
        input::placeholder { color: #6b7280; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        *::-webkit-scrollbar { width: 4px; height: 4px; }
        pre { scrollbar-width: thin; }
      `}</style>
    </div>
  );
}
