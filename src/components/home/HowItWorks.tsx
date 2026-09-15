import { useTranslations } from "next-intl";

const items = [
  {
    key: "source",
    number: "01",
  },
  {
    key: "normalize",
    number: "02",
  },
  {
    key: "consensus",
    number: "03",
  },
] as const;

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section
      id="how-it-works"
      className="border-t border-zinc-200 bg-zinc-950 px-6 py-28 text-white sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs tracking-[0.28em] text-zinc-500">
          {t("eyebrow")}
        </p>

        <div className="mt-6 max-w-4xl">
          <h2 className="font-[family:var(--font-space-grotesk)] text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            {t("title")}
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.key}
              className="bg-zinc-950 p-8 transition-colors duration-300 hover:bg-zinc-900 sm:p-10"
            >
              <span className="font-mono text-xs text-zinc-600">
                {item.number}
              </span>

              <h3 className="mt-16 font-[family:var(--font-space-grotesk)] text-2xl font-medium">
                {t(`${item.key}.title`)}
              </h3>

              <p className="mt-4 text-sm leading-6 text-zinc-500">
                {t(`${item.key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
