// One island for every Wix form on the site (contact, partnerships, story submission).
// Renders from the live schema, so fields the owner changes in the dashboard follow.
import { useWixForm, FORM_ERROR, otherValue, otherText } from "../../hooks/forms/useWixForm";
import type { FormDto, FormFieldDto } from "../../wix/forms/types";

const INPUT_TYPES: Record<string, string> = {
  text: "text", email: "email", url: "url", phone: "tel", password: "password",
  number: "number", rating: "number", date: "date", time: "time", datetime: "datetime-local",
};

const fieldClass = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-base text-foreground";

export default function WixFormView({ formId, initialForm, submitLabel }: { formId: string; initialForm?: FormDto; submitLabel: string }) {
  const f = useWixForm(formId, { initialForm });

  if (f.outcome) {
    if (f.outcome.url && typeof window !== "undefined") {
      if (f.outcome.newTab) window.open(f.outcome.url);
      else window.location.assign(f.outcome.url);
    }
    return (
      <div role="status" className="rounded-lg border border-border p-6">
        {(f.outcome.message || "Thank you. Your message was sent.").split("\n").map((p, i) => <p key={i}>{p}</p>)}
        <button type="button" onClick={f.reset} className="mt-4 text-sm underline">Send another</button>
      </div>
    );
  }
  if (f.errors[FORM_ERROR] && !f.form) return <p role="alert" className="text-destructive">{f.errors[FORM_ERROR]}</p>;
  if (!f.form) return <div className="h-96 animate-pulse rounded-lg bg-secondary" aria-busy="true" />;
  if (f.closed) return <p>{f.form.disabledMessage || "This form is not accepting responses right now."}</p>;

  const step = f.form.steps[f.step];
  const last = f.step === f.form.steps.length - 1;
  const fields = f.form.fields.filter((x) => !step || x.stepId === step.id);

  return (
    <form noValidate onSubmit={async (e) => { await f.submit(e); }} className="flex max-w-2xl flex-col gap-6">
      {fields.map((field) => (
        <Field key={field.target} field={field} f={f} />
      ))}
      {f.errors[FORM_ERROR] ? <p role="alert" className="text-destructive">{f.errors[FORM_ERROR]}</p> : null}
      <div className="flex gap-3">
        {f.step > 0 ? (
          <button type="button" onClick={f.previous} className="rounded-control border border-border px-5 py-2.5">{f.form.previousText || "Back"}</button>
        ) : null}
        {last ? (
          <button type="submit" disabled={f.loading} className="rounded-control bg-primary px-6 py-2.5 font-medium text-primary-foreground disabled:opacity-50">
            {f.loading ? "Sending…" : f.form.submitText || submitLabel}
          </button>
        ) : (
          <button type="button" onClick={(e) => f.next(e)} className="rounded-control bg-primary px-6 py-2.5 font-medium text-primary-foreground">{f.form.nextText || "Continue"}</button>
        )}
      </div>
    </form>
  );
}

function Field({ field, f }: { field: FormFieldDto; f: ReturnType<typeof useWixForm> }) {
  const id = `field-${field.target}`;
  const errId = `err-${field.target}`;
  const error = f.errors[field.target];
  const label = (
    <span className={field.showLabel ? "font-medium" : "sr-only"}>
      {field.label}
      {field.required ? <span aria-hidden="true"> *</span> : null}
    </span>
  );
  const describe = error ? errId : undefined;
  const errorText = error ? <p id={errId} className="text-sm text-destructive">{error}</p> : null;
  const help = field.description ? <p className="text-sm text-muted-foreground">{field.description}</p> : null;

  if (field.control === "textarea") {
    return (
      <label className="flex flex-col gap-2" htmlFor={id}>
        {label}{help}
        <textarea id={id} rows={6} {...f.bind(field.target)} aria-invalid={!!error} aria-describedby={describe} className={fieldClass} />
        {errorText}
      </label>
    );
  }
  if (field.control === "select") {
    return (
      <label className="flex flex-col gap-2" htmlFor={id}>
        {label}{help}
        <select id={id} {...f.bind(field.target)} aria-invalid={!!error} aria-describedby={describe} className={fieldClass}>
          <option value="">Choose…</option>
          {field.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {errorText}
      </label>
    );
  }
  if (field.control === "checkbox") {
    return (
      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            name={field.target}
            checked={!!f.values[field.target]}
            onChange={(e) => f.setValues((v) => ({ ...v, [field.target]: e.target.checked }))}
            onBlur={() => f.validate(field.target)}
            aria-invalid={!!error}
            aria-describedby={describe}
            className="mt-1 size-4"
          />
          {label}
        </label>
        {errorText}
      </div>
    );
  }
  if (field.control === "radio" || field.control === "checkboxGroup" || field.control === "tags") {
    const multi = field.control !== "radio";
    const value = f.values[field.target];
    const chosen: string[] = multi ? (Array.isArray(value) ? value.map(String) : []) : value ? [String(value)] : [];
    const otherChosen = field.otherOption ? chosen.find((v) => otherText(field, v) !== null) : undefined;
    const setChoice = (v: string, on: boolean) =>
      f.setValues((vals) => {
        if (!multi) return { ...vals, [field.target]: on ? v : "" };
        const cur = Array.isArray(vals[field.target]) ? (vals[field.target] as string[]) : [];
        return { ...vals, [field.target]: on ? [...cur, v] : cur.filter((x) => x !== v) };
      });
    return (
      <fieldset className="flex flex-col gap-2" aria-describedby={describe}>
        <legend className="mb-1">{label}</legend>
        {help}
        {field.choices.map((c) => (
          <label key={c.value} className="flex items-center gap-3">
            <input
              type={multi ? "checkbox" : "radio"}
              name={field.target}
              value={c.value}
              checked={chosen.includes(String(c.value))}
              onChange={(e) => setChoice(String(c.value), e.target.checked)}
              onBlur={() => f.validate(field.target)}
              className="size-4"
            />
            {c.label}
          </label>
        ))}
        {field.otherOption ? (
          <label className="flex items-center gap-3">
            <span>{field.otherOption.label}</span>
            <input
              type="text"
              className={fieldClass}
              placeholder={field.otherOption.placeholder}
              defaultValue={otherChosen ? otherText(field, otherChosen) ?? "" : ""}
              onBlur={(e) => {
                const text = e.target.value.trim();
                f.setValues((vals) => {
                  const cur = multi ? (Array.isArray(vals[field.target]) ? (vals[field.target] as string[]) : []) : [];
                  const kept = cur.filter((x) => otherText(field, x) === null);
                  const next = text ? otherValue(field, text) : null;
                  return { ...vals, [field.target]: multi ? (next ? [...kept, next] : kept) : next ?? "" };
                });
              }}
            />
          </label>
        ) : null}
        {errorText}
      </fieldset>
    );
  }
  const type = INPUT_TYPES[field.control];
  if (!type) {
    return <p className="text-sm text-muted-foreground">The field “{field.label}” is not available on this page.</p>;
  }
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      {label}{help}
      <input
        id={id}
        type={type}
        {...f.bind(field.target)}
        placeholder={field.placeholder}
        min={field.validation.minDate ?? field.validation.minimum}
        max={field.validation.maxDate ?? field.validation.maximum}
        step={field.validation.multipleOf}
        aria-invalid={!!error}
        aria-describedby={describe}
        className={fieldClass}
      />
      {errorText}
    </label>
  );
}
