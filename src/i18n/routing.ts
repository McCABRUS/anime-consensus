import { defineRouting } from "next-intl/routing";
import { localeCodes } from "./locales";

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale: "en",
});
