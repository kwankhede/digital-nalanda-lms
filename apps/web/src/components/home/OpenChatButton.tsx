"use client";

// Opens the global Nalanda Assistant widget (listened for in ChatbotWidget).
export default function OpenChatButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-nalanda-chat"))}
      className={className}
    >
      {children}
    </button>
  );
}
