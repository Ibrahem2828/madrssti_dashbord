"use client";

import {Bell} from "lucide-react";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {Badge} from "@/components/ui/badge";
import {buttonClassName} from "@/components/ui/button";
import {Link} from "@/i18n/routing";
import {fetchSchoolNotifications} from "@/features/school/services/school-api";

export function NotificationLink() {
  const t = useTranslations("notifications");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    void fetchSchoolNotifications({is_read: "false", page: "1"}).then((result) => {
      if (!active) {
        return;
      }

      if (result.success) {
        setCount(result.data.count);
      } else {
        setCount(null);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Link href="/school/notifications" className={buttonClassName({variant: "ghost", size: "icon"})} aria-label={t("title")}>
      <span className="relative">
        <Bell className="h-4 w-4" aria-hidden="true" />
        {typeof count === "number" && count > 0 ? (
          <Badge variant="danger" className="absolute -end-3 -top-3 min-w-5 justify-center px-1 py-0.5 text-[10px]">
            {count > 99 ? "99+" : count}
          </Badge>
        ) : null}
      </span>
    </Link>
  );
}
