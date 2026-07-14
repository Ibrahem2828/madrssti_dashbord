import {buttonClassName} from "@/components/ui/button";
import {Link} from "@/i18n/routing";

export function LegacyRouteNotice({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center">
      <div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-5">
          <Link href={href} className={buttonClassName()}>
            {actionLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
