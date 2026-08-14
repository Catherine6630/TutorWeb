"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileArchive,
  FileCode2,
  FileText,
  Filter,
  LoaderCircle,
  LockKeyhole,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge, Button, Input } from "@/components/ui";
import { formatFileSize } from "@/lib/utils";
import { materialTypes } from "@/lib/constants";
import type { AuthUser, Course, Material } from "@/lib/models";

function iconFor(material: Material) {
  if (material.materialType === "code") return FileCode2;
  if (["pdf", "docx", "pptx"].includes(material.filename.split(".").pop()?.toLowerCase() || "")) return FileArchive;
  return FileText;
}

const statusStyles: Record<string, string> = {
  ready: "border-[#d3eee9] bg-[#eefaf8] text-[#0b897b]",
  processing: "border-[#dedcff] bg-[#f0efff] text-[#5a54d8]",
  queued: "border-[#e5e6ed] bg-[#f6f7f9] text-[#697287]",
  failed: "border-[#ffd8d8] bg-[#fff3f3] text-[#b53c3c]",
};

export function MaterialLibrary({
  user,
  courses,
  materials,
  initialCourse = "all",
}: {
  user: AuthUser;
  courses: Course[];
  materials: Material[];
  initialCourse?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState(initialCourse);
  const [type, setType] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return materials.filter((material) => {
      const matchesQuery = !needle || `${material.title} ${material.filename} ${material.tags.join(" ")}`.toLowerCase().includes(needle);
      return matchesQuery && (course === "all" || material.courseId === course) && (type === "all" || material.materialType === type);
    });
  }, [materials, query, course, type]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return setUploadError("请选择一个文件。");
    setUploadError("");
    setUploading(true);
    const form = new FormData(event.currentTarget);
    form.set("file", selectedFile);
    try {
      const response = await fetch("/api/materials", { method: "POST", body: form });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "上传失败。");
      setUploadOpen(false);
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败。");
    } finally {
      setUploading(false);
    }
  }

  async function remove(material: Material) {
    if (!window.confirm(`确定删除“${material.title}”及其索引吗？`)) return;
    setDeleting(material.id);
    const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    setDeleting(null);
    if (response.ok) router.refresh();
  }

  return (
    <>
      <div className="app-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1"><Search size={17} className="absolute left-3.5 top-3 text-[#9097a8]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文件名、标题或标签…" className="pl-10" /></div>
          <div className="flex gap-2">
            <span className="relative flex-1 lg:w-48"><Filter size={15} className="pointer-events-none absolute left-3 top-3.5 text-[#9299a8]" /><select value={course} onChange={(event) => setCourse(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-[#dfe2ea] bg-white pl-9 pr-8 text-sm font-medium text-[#515a70] outline-none focus:border-[#817bf7]"><option value="all">所有课程</option>{courses.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></span>
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-11 flex-1 rounded-xl border border-[#dfe2ea] bg-white px-3 text-sm font-medium text-[#515a70] outline-none lg:w-44"><option value="all">所有类型</option>{materialTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          </div>
          <Button onClick={() => setUploadOpen(true)}><UploadCloud size={17} /> 上传资料</Button>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ececf2] px-5 py-4"><p className="text-sm font-bold">{filtered.length} 份资料</p><p className="text-xs text-[#9299a8]">上传内容会被切分并建立检索索引</p></div>
        <div className="divide-y divide-[#ececf2]">
          {filtered.map((material) => {
            const Icon = iconFor(material);
            const canDelete = user.role === "admin" || material.ownerId === user.id;
            return (
              <div key={material.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fbfbfd] sm:flex-row sm:items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#625bf6]"><Icon size={20} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-bold text-[#303950]">{material.title}</p>{material.visibility === "private" && <LockKeyhole size={13} className="text-[#8a92a5]" />}</div>
                  <p className="mt-1 truncate text-xs text-[#8a92a5]">{material.courseCode} · {material.filename} · {formatFileSize(material.byteSize)}</p>
                  {material.errorText && <p className="mt-1 text-xs text-[#b53c3c]">{material.errorText}</p>}
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  {material.tags.slice(0, 2).map((tag) => <Badge key={tag} className="hidden sm:inline-flex">{tag}</Badge>)}
                  <Badge className={statusStyles[material.processingStatus]}>{material.processingStatus === "ready" ? <><CheckCircle2 size={12} className="mr-1" /> 已索引</> : material.processingStatus}</Badge>
                  {canDelete && <button onClick={() => remove(material)} disabled={deleting === material.id} className="grid size-9 place-items-center rounded-lg text-[#9aa1b0] hover:bg-[#fff0f0] hover:text-[#c33d3d]" aria-label="删除资料">{deleting === material.id ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}</button>}
                </div>
              </div>
            );
          })}
          {!filtered.length && <div className="px-5 py-16 text-center"><FileText className="mx-auto text-[#c1c5cf]" /><p className="mt-3 text-sm font-semibold text-[#727b90]">没有符合筛选条件的资料</p><p className="mt-1 text-xs text-[#9aa1af]">更换筛选条件，或上传第一份资料。</p></div>}
        </div>
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#172036]/40 p-4 backdrop-blur-sm">
          <button className="absolute inset-0" onClick={() => !uploading && setUploadOpen(false)} aria-label="关闭上传窗口" />
          <form onSubmit={upload} className="relative w-full max-w-lg rounded-[22px] border border-white bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">上传学习资料</h2><p className="mt-1 text-xs leading-5 text-[#7f8799]">支持 PDF、DOCX、PPTX、Markdown、文本和常见代码文件，最大 15 MB。</p></div><button type="button" disabled={uploading} onClick={() => setUploadOpen(false)} className="grid size-9 place-items-center rounded-lg text-[#7f8799] hover:bg-[#f1f2f6]"><X size={18} /></button></div>
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-5 flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-[#d9d9ea] bg-[#fafaff] px-4 py-7 text-center hover:border-[#aaa6f5]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><UploadCloud size={21} /></span>
              <p className="mt-3 text-sm font-bold text-[#3b445b]">{selectedFile ? selectedFile.name : "选择要上传的文件"}</p>
              <p className="mt-1 text-xs text-[#8d94a5]">{selectedFile ? formatFileSize(selectedFile.size) : "点击浏览本地文件"}</p>
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} accept=".pdf,.docx,.pptx,.txt,.md,.markdown,.py,.js,.jsx,.ts,.tsx,.java,.c,.cpp,.cs,.go,.rs,.sql,.html,.css,.json" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#555e73]">标题<Input name="title" required defaultValue={selectedFile?.name.replace(/\.[^.]+$/, "") || ""} className="mt-1.5" placeholder="资料标题" /></label>
              <label className="text-xs font-semibold text-[#555e73]">课程<select name="courseId" required defaultValue={course !== "all" ? course : courses[0]?.id} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe2ea] bg-white px-3 text-sm outline-none">{courses.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label>
              <label className="text-xs font-semibold text-[#555e73]">类型<select name="materialType" defaultValue="lecture" className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe2ea] bg-white px-3 text-sm outline-none">{materialTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className="text-xs font-semibold text-[#555e73]">年份<Input name="year" defaultValue={new Date().getFullYear()} className="mt-1.5" /></label>
            </div>
            <label className="mt-3 block text-xs font-semibold text-[#555e73]">标签（逗号分隔）<Input name="tags" className="mt-1.5" placeholder="trees, exam, week-4" /></label>
            {user.role === "admin" && <label className="mt-3 block text-xs font-semibold text-[#555e73]">可见范围<select name="visibility" defaultValue="course" className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe2ea] bg-white px-3 text-sm outline-none"><option value="course">课程内公开</option><option value="private">仅自己可见</option></select></label>}
            {uploadError && <p className="mt-3 rounded-xl bg-[#fff2f2] px-3 py-2.5 text-xs text-[#b53c3c]">{uploadError}</p>}
            <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setUploadOpen(false)} disabled={uploading}>取消</Button><Button type="submit" disabled={uploading || !selectedFile}>{uploading ? <><LoaderCircle size={16} className="animate-spin" /> 解析与索引中…</> : <><UploadCloud size={16} /> 上传并索引</>}</Button></div>
          </form>
        </div>
      )}
    </>
  );
}
