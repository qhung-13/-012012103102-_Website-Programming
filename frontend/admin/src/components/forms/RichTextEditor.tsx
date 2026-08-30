"use client";

import * as React from "react";
import {
  Bold,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

type Command =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock"
  | "createLink"
  | "removeFormat"
  | "undo"
  | "redo";

const ToolbarButton = ({
  label,
  onMouseDown,
  children,
}: {
  label: string;
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="h-8 w-8"
    aria-label={label}
    title={label}
    onMouseDown={onMouseDown}
  >
    {children}
  </Button>
);

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, disabled = false, className, ...props }, forwardedRef) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const setEditorRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    React.useEffect(() => {
      if (contentRef.current && contentRef.current.innerHTML !== value) {
        contentRef.current.innerHTML = value || "";
      }
    }, [value]);

    const emitValue = () => {
      onChange(contentRef.current?.innerHTML ?? "");
    };

    const runCommand = (
      event: React.MouseEvent<HTMLButtonElement>,
      command: Command,
      commandValue?: string,
    ) => {
      event.preventDefault();
      if (disabled) return;
      contentRef.current?.focus();
      if (command === "createLink") {
        const url = window.prompt("Nhập đường dẫn liên kết:", "https://");
        if (!url || !/^https?:\/\//i.test(url.trim())) return;
        document.execCommand(command, false, url.trim());
      } else {
        document.execCommand(command, false, commandValue);
      }
      emitValue();
    };

    return (
      <div
        {...props}
        ref={setEditorRef}
        className={cn(
          "overflow-hidden rounded-md border bg-background focus-within:ring-1 focus-within:ring-ring",
          disabled && "opacity-60",
          className,
        )}
      >
        <div
          className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1"
          onMouseDown={(event) => event.preventDefault()}
        >
          <ToolbarButton label="Đậm" onMouseDown={(event) => runCommand(event, "bold")}>
            <Bold />
          </ToolbarButton>
          <ToolbarButton label="Nghiêng" onMouseDown={(event) => runCommand(event, "italic")}>
            <Italic />
          </ToolbarButton>
          <ToolbarButton label="Gạch chân" onMouseDown={(event) => runCommand(event, "underline")}>
            <Underline />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <ToolbarButton
            label="Tiêu đề cấp 2"
            onMouseDown={(event) => runCommand(event, "formatBlock", "<h2>")}
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton label="Trích dẫn" onMouseDown={(event) => runCommand(event, "formatBlock", "<blockquote>")}>
            <Quote />
          </ToolbarButton>
          <ToolbarButton
            label="Danh sách gạch đầu dòng"
            onMouseDown={(event) => runCommand(event, "insertUnorderedList")}
          >
            <List />
          </ToolbarButton>
          <ToolbarButton
            label="Danh sách đánh số"
            onMouseDown={(event) => runCommand(event, "insertOrderedList")}
          >
            <ListOrdered />
          </ToolbarButton>
          <ToolbarButton label="Thêm liên kết" onMouseDown={(event) => runCommand(event, "createLink")}>
            <LinkIcon />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <ToolbarButton label="Hoàn tác" onMouseDown={(event) => runCommand(event, "undo")}>
            <Undo2 />
          </ToolbarButton>
          <ToolbarButton label="Làm lại" onMouseDown={(event) => runCommand(event, "redo")}>
            <Redo2 />
          </ToolbarButton>
          <ToolbarButton label="Xóa định dạng" onMouseDown={(event) => runCommand(event, "removeFormat")}>
            <RemoveFormatting />
          </ToolbarButton>
        </div>
        <div
          ref={contentRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          className="min-h-56 px-3 py-3 text-sm leading-6 outline-none [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
          onInput={emitValue}
          onBlur={emitValue}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emitValue();
          }}
          aria-placeholder="Nhập nội dung bài viết..."
        />
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
