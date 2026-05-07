"use client";

import toast, { Toast as HotToast } from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
    duration?: number;
    entity?: string;
    entity_id?: number;
};

type ConfirmOptions = {
    confirmText?: string;
    cancelText?: string;
};

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="shrink-0" />,
    error: <XCircle size={18} className="shrink-0" />,
    warning: <AlertTriangle size={18} className="shrink-0" />,
    info: <Info size={18} className="shrink-0" />,
};

const styles: Record<ToastType, string> = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
};

// ─── Base Toast Renderer ──────────────────────────────────────────────────────

const renderToast = (
    t: HotToast,
    message: string,
    type: ToastType,
    options?: ToastOptions
) => {
    const handleClick = () => {
        if (options?.entity === "request" && options.entity_id) {
            window.location.href = `/${options.entity}s/${options.entity_id}`;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-sm
        transition-all duration-300 cursor-pointer
        ${styles[type]}
        ${t.visible ? "animate-enter" : "animate-leave"}
        ${options?.entity ? "hover:brightness-90" : ""}
      `}
        >
            {icons[type]}
            <span className="flex-1 text-sm font-medium">{message}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                }}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// ─── Confirmation Toast ───────────────────────────────────────────────────────

const renderConfirmToast = (
    t: HotToast,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmOptions?: ConfirmOptions
) => (
    <div
        className={`
      flex flex-col gap-3 px-4 py-4 rounded-lg shadow-lg min-w-[300px] max-w-sm
      bg-white border border-gray-200 text-gray-800
      ${t.visible ? "animate-enter" : "animate-leave"}
    `}
    >
        <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
            <span className="text-sm font-medium">{message}</span>
        </div>
        <div className="flex gap-2 justify-end">
            <button
                onClick={() => {
                    toast.dismiss(t.id);
                    onCancel?.();
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
                {confirmOptions?.cancelText ?? "No"}
            </button>
            <button
                onClick={() => {
                    toast.dismiss(t.id);
                    onConfirm();
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
                {confirmOptions?.confirmText ?? "Yes"}
            </button>
        </div>
    </div>
);

// ─── Promise Toast ────────────────────────────────────────────────────────────

const renderConfirmToastPromise = (
    message: string,
    confirmOptions?: ConfirmOptions
): Promise<boolean> =>
    new Promise((resolve) => {
        toast.custom(
            (t) =>
                renderConfirmToast(
                    t,
                    message,
                    () => resolve(true),
                    () => resolve(false),
                    confirmOptions
                ),
            { duration: Infinity }
        );
    });

// ─── Toast Utility ────────────────────────────────────────────────────────────

const AppToast = {
    /**
     * Show a success toast.
     */
    success: (message: string, options?: ToastOptions) =>
        toast.custom(
            (t) => renderToast(t, message, "success", options),
            { duration: options?.duration ?? 4000 }
        ),

    /**
     * Show an error toast.
     */
    error: (message: string, options?: ToastOptions) =>
        toast.custom(
            (t) => renderToast(t, message, "error", options),
            { duration: options?.duration ?? 5000 }
        ),

    /**
     * Show a warning toast.
     */
    warning: (message: string, options?: ToastOptions) =>
        toast.custom(
            (t) => renderToast(t, message, "warning", options),
            { duration: options?.duration ?? 4000 }
        ),

    /**
     * Show an info toast.
     */
    info: (message: string, options?: ToastOptions) =>
        toast.custom(
            (t) => renderToast(t, message, "info", options),
            { duration: options?.duration ?? 4000 }
        ),

    /**
     * Show a success toast and run a callback after dismissal.
     */
    successThen: (
        message: string,
        onConfirm: () => void,
        onClose?: () => void,
        options?: ToastOptions
    ) => {
        const id = toast.custom(
            (t) => (
                <div
                    className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-sm
            bg-emerald-600 text-white cursor-pointer
            ${t.visible ? "animate-enter" : "animate-leave"}
          `}
                    onClick={() => {
                        toast.dismiss(id);
                        onConfirm();
                        onClose?.();
                    }}
                >
                    {icons.success}
                    <span className="flex-1 text-sm font-medium">{message}</span>
                    <span className="text-xs underline opacity-80">OK</span>
                </div>
            ),
            { duration: options?.duration ?? 4000 }
        );
        return id;
    },

    /**
     * Show a confirmation toast with Yes/No buttons (callback style).
     */
    confirm: (
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmOptions?: ConfirmOptions
    ) =>
        toast.custom(
            (t) =>
                renderConfirmToast(t, message, onConfirm, onCancel, confirmOptions),
            { duration: Infinity }
        ),

    /**
     * Show a confirmation toast and return a Promise<boolean> (async/await style).
     */
    confirmAsync: (message: string, confirmOptions?: ConfirmOptions) =>
        renderConfirmToastPromise(message, confirmOptions),

    /**
     * Wrap an async operation with loading → success/error toasts.
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: { loading: string; success: string; error: string }
    ) =>
        toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        }),

    /**
     * Dismiss a specific or all toasts.
     */
    dismiss: (id?: string) => toast.dismiss(id),
};

export default AppToast;