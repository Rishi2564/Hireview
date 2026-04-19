const BOTPRESS_URL =
  "https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/04/19/15/20260419155245-HV8A5KTT.json";

export default function BotpressChatButton() {
  return (
    <a
      href={BOTPRESS_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full border border-brand-700/40 bg-surface/85 px-4 py-3 text-sm font-semibold text-white shadow-glass backdrop-blur-md transition hover:border-brand-600 hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface"
      aria-label="Open chat in new tab"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-brand-sm"
      >
        {/* chat bubble */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 9.5H16.5M7.5 13H13.5M12 21C17.5228 21 22 17.1944 22 12.5C22 7.80558 17.5228 4 12 4C6.47715 4 2 7.80558 2 12.5C2 14.8946 3.16357 17.0576 5.0519 18.5815C5.28115 18.7666 5.43442 19.0363 5.44339 19.3305L5.5 21L7.82139 20.1871C8.12077 20.0822 8.45045 20.1024 8.73576 20.2356C9.75774 20.7128 10.8587 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="hidden sm:inline">Chat with us</span>
      <span className="sm:hidden">Chat</span>
    </a>
  );
}

