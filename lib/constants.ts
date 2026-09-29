import {
  BookOpen,
  BrainCircuit,
  Bug,
  FileQuestion,
  GraduationCap,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import type { AppLanguage } from "@/lib/language";

export type LearningMode = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  instruction: string;
  icon: LucideIcon;
};

export const learningModes: LearningMode[] = [
  {
    id: "explain",
    label: "Concept explanation",
    shortLabel: "Explain",
    description: "Build understanding from intuition and definitions to examples.",
    instruction: "Explain the concept progressively: intuition, precise definition, a concrete example, pitfalls, and a short recap.",
    icon: BookOpen,
  },
  {
    id: "socratic",
    label: "Guided learning",
    shortLabel: "Guide",
    description: "Use questions and hints to help you derive the answer.",
    instruction: "Use a Socratic approach. Ask one useful question at a time, give graduated hints, and avoid revealing the full answer too early.",
    icon: BrainCircuit,
  },
  {
    id: "debug",
    label: "Code helper",
    shortLabel: "Code",
    description: "Find the cause, explain it, and propose a verifiable fix.",
    instruction: "Act as a careful code tutor. Identify the cause before proposing a minimal fix. Explain complexity, edge cases, and how to verify the change.",
    icon: Bug,
  },
  {
    id: "exam",
    label: "Exam practice",
    shortLabel: "Exam",
    description: "Break down questions, give hints, and check your reasoning.",
    instruction: "Treat the task as exam preparation. Identify the assessed concept, allocate marks or effort, provide hints first, then a model solution when requested.",
    icon: GraduationCap,
  },
  {
    id: "paper",
    label: "Past-paper analysis",
    shortLabel: "Paper",
    description: "Analyse topics, difficulty, and answer structure in past papers.",
    instruction: "Analyze past-paper questions by topic, difficulty, command verbs, common traps, and a concise answer plan. Do not invent marking schemes.",
    icon: FileQuestion,
  },
  {
    id: "quiz",
    label: "Quiz mode",
    shortLabel: "Quiz",
    description: "Answer one question at a time, then receive a score and feedback.",
    instruction: "Run an interactive quiz one question at a time. Wait for the learner's answer, then score it, explain the gap, and continue at an adaptive difficulty.",
    icon: ListChecks,
  },
];

const chineseLearningLabels: Record<string, Pick<LearningMode, "label" | "shortLabel" | "description">> = {
  explain: { label: "概念讲解", shortLabel: "讲解", description: "从直觉、定义到示例，逐层讲清知识点。" },
  socratic: { label: "引导学习", shortLabel: "引导", description: "通过提示和问题，帮助你自己推导答案。" },
  debug: { label: "代码助手", shortLabel: "代码", description: "定位错误、解释原因并给出可验证的修复。" },
  exam: { label: "考试练习", shortLabel: "考试", description: "按课程范围拆题、提示并检查解题过程。" },
  paper: { label: "Past Paper 分析", shortLabel: "试卷", description: "分析历年题目的考点、难度与答题框架。" },
  quiz: { label: "Quiz 模式", shortLabel: "测验", description: "一次一题，回答后获得评分和反馈。" },
};

export function getLearningModes(language: AppLanguage): LearningMode[] {
  if (language === "en") return learningModes;
  return learningModes.map((mode) => ({ ...mode, ...chineseLearningLabels[mode.id] }));
}

export const quickPrompts = [
  "Explain this concept with an everyday analogy",
  "Create five revision questions from this week's lecture",
  "Help me analyse the time complexity of this code",
  "Summarise the most commonly confused ideas in this course",
];

export const materialTypes = [
  { value: "lecture", label: "Lecture Notes" },
  { value: "tutorial", label: "Tutorial / Lab" },
  { value: "past-paper", label: "Past Paper" },
  { value: "solution", label: "Solutions" },
  { value: "reading", label: "Further Reading" },
  { value: "code", label: "Code File" },
];

export function getMaterialTypes(language: AppLanguage) {
  if (language === "en") return materialTypes;
  const labels: Record<string, string> = {
    lecture: "课件",
    tutorial: "Tutorial / Lab",
    "past-paper": "Past Paper",
    solution: "参考答案",
    reading: "补充阅读",
    code: "代码文件",
  };
  return materialTypes.map((type) => ({ ...type, label: labels[type.value] ?? type.label }));
}
