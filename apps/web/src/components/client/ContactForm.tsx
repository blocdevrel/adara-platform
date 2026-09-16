import { useState } from "react";

const inputClassName =
  "h-12 w-full rounded-full border border-border bg-background px-5 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:outline-none focus:ring-0";

const textareaClassName =
  "min-h-[140px] w-full resize-y rounded-3xl border border-border bg-background px-5 py-3.5 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:outline-none focus:ring-0";

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Adara inquiry");
    const body = encodeURIComponent(
      `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nCompany: ${formData.company || "—"}\n\n${formData.message}`
    );
    window.location.href = `mailto:info@adara.ai?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="bg-background py-20 text-foreground sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-light leading-[1.08] tracking-[-0.03em]">
          Contact us
        </h2>

        <form onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-base text-foreground">
                First name <span className="text-muted-foreground">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-base text-foreground">
                Last name <span className="text-muted-foreground">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-base text-foreground">
              Work email <span className="text-muted-foreground">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-base text-foreground">
              Company name
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-base text-foreground">
              How can we help? <span className="text-muted-foreground">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={textareaClassName}
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-adara-orange-hover sm:w-auto"
          >
            Open email
          </button>
        </form>
      </div>
    </section>
  );
}
