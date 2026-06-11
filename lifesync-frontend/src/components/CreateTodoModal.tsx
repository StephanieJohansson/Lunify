import { useState } from "react";
import type { TodoTask } from "../types/TodoTask";

type CreateTodoModalProps = {
    mode?: "create" | "edit";
    todo?: TodoTask;
    onClose: () => void;
    onSave: (title: string, description: string) => void;
};

export default function CreateTodoModal({
                                            mode = "create",
                                            todo,
                                            onClose,
                                            onSave,
                                        }: CreateTodoModalProps) {
    const [title, setTitle] = useState(todo?.title ?? "");
    const [description, setDescription] = useState(todo?.description ?? "");

    const isEditMode = mode === "edit";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 text-white shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">
                    {isEditMode ? "Edit Todo" : "Create Todo"}
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="w-full rounded-xl bg-slate-900 p-3 outline-none"
                    />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="w-full rounded-xl bg-slate-900 p-3 outline-none"
                        rows={4}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-slate-700 px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(title, description)}
                        className="rounded-xl bg-violet-600 px-4 py-2"
                    >
                        {isEditMode ? "Save changes" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}