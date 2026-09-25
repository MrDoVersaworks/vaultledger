import Link from 'next/link';

interface FooterProps {
  platformName: string;
  techStack: string;
  contactLink?: string;
  creatorName?: string;
}

export function UnifiedFooter({ platformName, techStack, contactLink, creatorName = 'Oyewole Favour' }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-10 text-sm text-[var(--text-secondary)] sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center">
        {contactLink && (
          <Link
            href={contactLink}
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-2.5 font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
          >
            Contact support
          </Link>
        )}

        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {platformName}
          </p>
          <p className="mt-1">
            Built with {techStack} · Maintained by <span className="text-[var(--text-primary)]">{creatorName}</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-[var(--border-default)] pt-5">
          <Link href="/terms" className="transition-colors hover:text-[var(--text-primary)]">
            Terms of Service
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[var(--text-primary)]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
