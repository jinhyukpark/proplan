import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Slide, MemoStyle } from './types';

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkTitle: string;
  linkUrl: string;
  editingLinkId: string | null;
  onLinkTitleChange: (title: string) => void;
  onLinkUrlChange: (url: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LinkDialog({
  open,
  onOpenChange,
  linkTitle,
  linkUrl,
  editingLinkId,
  onLinkTitleChange,
  onLinkUrlChange,
  onConfirm,
  onCancel,
}: LinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingLinkId ? '링크 수정' : '링크 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">링크 제목</label>
            <Input
              value={linkTitle}
              onChange={(e) => onLinkTitleChange(e.target.value)}
              placeholder="링크 제목을 입력하세요"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">링크 URL</label>
            <Input
              value={linkUrl}
              onChange={(e) => onLinkUrlChange(e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={!linkTitle.trim() || !linkUrl.trim()}>
            {editingLinkId ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlideId: string;
  editingReferenceId: string | null;
  slides: Slide[];
  onSelectedSlideIdChange: (slideId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReferenceDialog({
  open,
  onOpenChange,
  selectedSlideId,
  editingReferenceId,
  slides,
  onSelectedSlideIdChange,
  onConfirm,
  onCancel,
}: ReferenceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingReferenceId ? '슬라이드 참조 수정' : '슬라이드 참조 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">참조할 슬라이드 선택</label>
            <Select value={selectedSlideId} onValueChange={onSelectedSlideIdChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="슬라이드를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {slides.map((slide, index) => (
                  <SelectItem key={slide.id} value={slide.id}>
                    슬라이드 {index + 1} {slide.title ? `- ${slide.title}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={!selectedSlideId}>
            {editingReferenceId ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memoTitle: string;
  memoContent: string;
  selectedMemoStyle: MemoStyle;
  editingMemoId: string | null;
  onMemoTitleChange: (title: string) => void;
  onMemoContentChange: (content: string) => void;
  onMemoStyleChange: (style: MemoStyle) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MemoDialog({
  open,
  onOpenChange,
  memoTitle,
  memoContent,
  selectedMemoStyle,
  editingMemoId,
  onMemoTitleChange,
  onMemoContentChange,
  onMemoStyleChange,
  onConfirm,
  onCancel,
}: MemoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingMemoId ? '메모 수정' : '메모 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">제목</label>
            <Input
              value={memoTitle}
              onChange={(e) => onMemoTitleChange(e.target.value)}
              placeholder="메모 제목을 입력하세요"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">내용</label>
            <textarea
              value={memoContent}
              onChange={(e) => onMemoContentChange(e.target.value)}
              placeholder="메모 내용을 입력하세요"
              className="mt-1 w-full min-h-[100px] px-3 py-2 border border-neutral-300 rounded-md resize-none"
              rows={5}
            />
          </div>
          <div>
            <label className="text-sm font-medium">스타일</label>
            <div className="mt-1 flex gap-2">
              {[
                { style: 'yellow' as const, label: '노란색', color: 'bg-yellow-100 border-yellow-300' },
                { style: 'pink' as const, label: '분홍색', color: 'bg-pink-100 border-pink-300' },
                { style: 'blue' as const, label: '파란색', color: 'bg-blue-100 border-blue-300' },
                { style: 'green' as const, label: '녹색', color: 'bg-green-100 border-green-300' },
                { style: 'purple' as const, label: '보라색', color: 'bg-purple-100 border-purple-300' },
              ].map(({ style, label, color }) => (
                <button
                  key={style}
                  onClick={() => onMemoStyleChange(style)}
                  className={cn(
                    "px-3 py-1 rounded border-2 text-xs transition-all",
                    color,
                    selectedMemoStyle === style && "ring-2 ring-offset-1 ring-neutral-900"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={!memoTitle.trim()}>
            {editingMemoId ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

