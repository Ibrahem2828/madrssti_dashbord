import {getTranslations} from "next-intl/server";

import {LegacyRouteNotice} from "@/components/feedback/legacy-route-notice";

export default async function LegacyAdminPointsPage({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: "legacy"});

  return (
    <LegacyRouteNotice
      title={t("pointsTitle")}
      description={t("pointsDescription")}
      href={`/${locale}/school`}
      actionLabel={t("goToDashboard")}
    />
  );
}
