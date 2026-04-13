import Image from "next/image";

export function BrandHero() {
  return (
    <section className="card-float rounded-lg px-8 py-12 text-center transition-shadow hover:shadow-floatHover">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative h-48 w-48 transition-transform hover:scale-105">
          <Image
            src="/logo.svg"
            alt="CLASS KING Logo"
            width={192}
            height={192}
            priority
            className="drop-shadow-lg"
          />
        </div>

        {/* 品牌名称 */}
        <div className="space-y-2">
          <h1 className="font-impact text-5xl font-black tracking-wider text-primary md:text-6xl">
            CLASS KING
          </h1>
          <div className="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        </div>

        {/* 标语 */}
        <p className="text-xl font-semibold text-ink md:text-2xl">
          懂人心，更懂执行的班长大脑
        </p>

        {/* 副标题 */}
        <p className="max-w-2xl text-sm leading-relaxed text-textSecondary">
          将混乱的通知、群聊和临时事项，收拢成一张可执行的班务时间图
        </p>

        {/* 装饰线 */}
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary"></div>
          <div className="h-2 w-2 rotate-45 bg-primary"></div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary"></div>
        </div>
      </div>
    </section>
  );
}
