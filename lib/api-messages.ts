import "server-only";

import { getLanguage } from "@/lib/language-server";

export async function getApiMessages() {
  const language = await getLanguage();
  return language === "zh" ? {
    validCredentials: "请输入有效的邮箱和密码。",
    wrongCredentials: "邮箱或密码不正确。",
    validRegistration: "请填写有效信息；密码至少 8 位并包含字母和数字。",
    emailExists: "这个邮箱已经注册。",
    createAccountFailed: "暂时无法创建账号。",
    loginRequired: "请先登录。",
    invalidParameters: "参数无效。",
    conversationMissing: "对话不存在。",
    messageMissing: "消息不存在。",
    materialMissing: "资料不存在。",
    deleteForbidden: "没有删除权限。",
    fileAndCourseRequired: "请选择文件并填写标题与课程。",
    courseForbidden: "你没有访问这门课程的权限。",
    unsupportedFile: "暂不支持这种文件格式。",
    fileTooLarge: (max: number) => `文件必须小于 ${max} MB。`,
    ingestFailed: "资料解析失败。",
    adminRequired: "需要管理员权限。",
    incompleteCourse: "课程信息不完整。",
    courseExists: "课程代码已存在。",
  } : {
    validCredentials: "Enter a valid email address and password.",
    wrongCredentials: "The email address or password is incorrect.",
    validRegistration: "Enter valid details. The password must be at least 8 characters and include letters and numbers.",
    emailExists: "An account already exists for this email address.",
    createAccountFailed: "Unable to create the account right now.",
    loginRequired: "Please log in first.",
    invalidParameters: "The request parameters are invalid.",
    conversationMissing: "Conversation not found.",
    messageMissing: "Message not found.",
    materialMissing: "Material not found.",
    deleteForbidden: "You do not have permission to delete this material.",
    fileAndCourseRequired: "Choose a file and provide its title and course.",
    courseForbidden: "You do not have access to this course.",
    unsupportedFile: "This file format is not supported.",
    fileTooLarge: (max: number) => `The file must be smaller than ${max} MB.`,
    ingestFailed: "The material could not be parsed.",
    adminRequired: "Administrator access is required.",
    incompleteCourse: "The course information is incomplete.",
    courseExists: "That course code already exists.",
  };
}
