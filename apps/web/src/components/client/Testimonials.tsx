import { cn } from "@/lib/utils";



type Testimonial = {

  name: string;

  title: string;

  company: string;

  quote: string;

  initials: string;

  outcome: string;

  focus: string;

};



const featured: Testimonial = {

  name: "James Mwangi",

  title: "Product Lead",

  company: "AgriTech Kenya",

  quote:

    "Voice advice in Swahili for smallholder farmers changed how our product works in the field. Western AI missed our crops entirely.",

  initials: "JM",

  outcome: "Field-ready Swahili",

  focus: "Agriculture",

};



const stories: Testimonial[] = [

  {

    name: "Fatima Diallo",

    title: "Director",

    company: "Public Health NGO",

    quote:

      "Health messages in Wolof and French finally read naturally. Our community teams trust the translations.",

    initials: "FD",

    outcome: "Wolof + French",

    focus: "Public health",

  },

  {

    name: "Kwesi Mensah",

    title: "Head of AI",

    company: "Regional Bank",

    quote:

      "Mobile money fraud looks nothing like card fraud. Adara catches USSD scam patterns our old tools never flagged.",

    initials: "KM",

    outcome: "USSD fraud signals",

    focus: "Mobile money",

  },

  {

    name: "Sarah Chen",

    title: "Localization Lead",

    company: "Global Platform",

    quote:

      "Light UI translation wasn't enough. We needed cultural depth for West Africa, Adara gave us that in weeks, not months.",

    initials: "SC",

    outcome: "Weeks, not months",

    focus: "West Africa",

  },

];



function Avatar({ initials, className }: { initials: string; className?: string }) {

  return (

    <span

      className={cn(

        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/5 text-sm font-medium text-primary ring-1 ring-primary/20",

        className,

      )}

      aria-hidden

    >

      {initials}

    </span>

  );

}



function StoryCard({ person, className }: { person: Testimonial; className?: string }) {

  return (

    <article

      className={cn(

        "group flex h-full flex-col rounded-2xl border border-border/70 bg-background p-6 transition-colors hover:border-primary/30 sm:p-7",

        className,

      )}

    >

      <div className="flex items-start justify-between gap-4">

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{person.outcome}</p>

        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">

          {person.focus}

        </span>

      </div>

      <blockquote className="mt-5 flex-1 text-base leading-relaxed text-foreground/90 sm:text-[17px] sm:leading-[1.65]">

        &ldquo;{person.quote}&rdquo;

      </blockquote>

      <footer className="mt-7 flex items-center gap-3 border-t border-border/60 pt-5">

        <Avatar initials={person.initials} />

        <div className="min-w-0">

          <p className="truncate text-sm font-medium text-foreground">{person.name}</p>

          <p className="truncate text-xs text-muted-foreground">

            {person.title}, {person.company}

          </p>

        </div>

      </footer>

    </article>

  );

}



export function Testimonials() {

  return (

    <section id="testimonials" className="border-t border-border/50 bg-background py-20 text-foreground sm:py-28">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="max-w-2xl">

          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Customer stories</p>

          <h2 className="mt-4 text-[clamp(2rem,4vw,3.15rem)] font-light leading-[1.08] tracking-[-0.035em]">

            How teams ship AI that works locally

          </h2>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">

            Specific outcomes from health, finance, and platform teams building for African markets.

          </p>

        </div>



        <article className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-border/60 bg-[#0B0F0D] p-8 text-white sm:p-10 lg:p-12">

          <div

            aria-hidden

            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"

          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">

            <div>

              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-adara-orange-light">

                {featured.outcome}

              </p>

              <blockquote className="mt-5 max-w-2xl text-xl leading-relaxed sm:text-2xl sm:leading-[1.45]">

                &ldquo;{featured.quote}&rdquo;

              </blockquote>

            </div>

            <footer className="relative flex items-center gap-3 lg:pb-1">

              <Avatar initials={featured.initials} className="bg-white/10 text-white ring-white/20" />

              <div>

                <p className="text-sm font-medium">{featured.name}</p>

                <p className="text-xs text-white/55">

                  {featured.title}, {featured.company}

                </p>

              </div>

            </footer>

          </div>

        </article>



        <div className="mt-5 grid gap-5 lg:grid-cols-3">

          {stories.map((person) => (

            <StoryCard key={person.name} person={person} />

          ))}

        </div>

      </div>

    </section>

  );

}


