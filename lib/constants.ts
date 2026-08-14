import {
  BookOpen,
  BrainCircuit,
  Bug,
  FileQuestion,
  GraduationCap,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

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
    label: "概念讲解",
    shortLabel: "讲解",
    description: "从直觉、定义到示例，逐层讲清知识点。",
    instruction: "Explain the concept progressively: intuition, precise definition, a concrete example, pitfalls, and a short recap.",
    icon: BookOpen,
  },
  {
    id: "socratic",
    label: "引导学习",
    shortLabel: "引导",
    description: "通过提示和问题，帮助你自己推导答案。",
    instruction: "Use a Socratic approach. Ask one useful question at a time, give graduated hints, and avoid revealing the full answer too early.",
    icon: BrainCircuit,
  },
  {
    id: "debug",
    label: "代码助手",
    shortLabel: "代码",
    description: "定位错误、解释原因并给出可验证的修复。",
    instruction: "Act as a careful code tutor. Identify the cause before proposing a minimal fix. Explain complexity, edge cases, and how to verify the change.",
    icon: Bug,
  },
  {
    id: "exam",
    label: "考试练习",
    shortLabel: "考试",
    description: "按课程范围拆题、提示并检查解题过程。",
    instruction: "Treat the task as exam preparation. Identify the assessed concept, allocate marks or effort, provide hints first, then a model solution when requested.",
    icon: GraduationCap,
  },
  {
    id: "paper",
    label: "Past Paper 分析",
    shortLabel: "试卷",
    description: "分析历年题目的考点、难度与答题框架。",
    instruction: "Analyze past-paper questions by topic, difficulty, command verbs, common traps, and a concise answer plan. Do not invent marking schemes.",
    icon: FileQuestion,
  },
  {
    id: "quiz",
    label: "Quiz 模式",
    shortLabel: "测验",
    description: "一次一题，回答后获得评分和反馈。",
    instruction: "Run an interactive quiz one question at a time. Wait for the learner's answer, then score it, explain the gap, and continue at an adaptive difficulty.",
    icon: ListChecks,
  },
];

export const quickPrompts = [
  "用一个生活中的类比解释这个概念",
  "根据本周课件生成 5 道复习题",
  "帮我分析这段代码的时间复杂度",
  "总结这门课目前最容易混淆的知识点",
];

export const materialTypes = [
  { value: "lecture", label: "Lecture Notes" },
  { value: "tutorial", label: "Tutorial / Lab" },
  { value: "past-paper", label: "Past Paper" },
  { value: "solution", label: "参考答案" },
  { value: "reading", label: "补充阅读" },
  { value: "code", label: "代码文件" },
];
