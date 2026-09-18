import { useState } from "react";
import { CloseIcon } from "./icons.jsx";

/** Free-form tags — type and press Enter or comma to add, click x to remove. */
export default function TagInput({ tags = [], onChange, placeholder = "Add a tag…" }) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    setDraft("");
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) return;
    onChange([...tags, value]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="tag-input">
      {tags.map((tag) => (
        <span className="tag-input__pill" key={tag}>
          {tag}
          <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
            <CloseIcon />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
