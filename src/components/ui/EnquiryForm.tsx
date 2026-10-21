"use client";

import { useId, useState, type FormEvent } from "react";

import { services, site } from "@/data";

/**
 * ------------------------------------------------------------------
 * ENQUIRY FORM
 * ------------------------------------------------------------------
 * Two honest delivery routes, and no third:
 *
 * 1. If NEXT_PUBLIC_ENQUIRY_ENDPOINT is set, the form POSTs the enquiry
 *    there as JSON and reports what actually came back.
 * 2. Otherwise it opens the visitor's email client with the message
 *    composed, and says plainly that nothing has been sent yet.
 *
 * It never reports a success it cannot stand behind.
 * ------------------------------------------------------------------
 */
const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT;

const TIMELINES = [
  "As soon as possible",
  "Within a month",
  "One to three months",
  "Three months or more",
  "Still deciding",
];

interface Fields {
  name: string;
  email: string;
  company: string;
  projectType: string;
  timeline: string;
  details: string;
}

const EMPTY: Fields = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  timeline: "",
  details: "",
};

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "composed" }
  | { state: "sent" }
  | { state: "error"; message: string };

function validate(fields: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (fields.name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
    errors.email = "Please enter an email address we can reply to.";
  }
  if (fields.details.trim().length < 10) {
    errors.details = "Please tell us a little about the project.";
  }
  return errors;
}

export function EnquiryForm() {
  const formId = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const set = (key: keyof Fields) => (
    event: { target: { value: string } },
  ) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const buildMailto = () => {
    const subject = `Project enquiry — ${fields.name.trim()}`;
    const body = [
      `Name: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      fields.company.trim() ? `Company: ${fields.company.trim()}` : null,
      fields.projectType ? `Project type: ${fields.projectType}` : null,
      fields.timeline ? `Timeline: ${fields.timeline}` : null,
      "",
      fields.details.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    return `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ state: "idle" });
      // Move the visitor to the first field that needs attention.
      const firstKey = Object.keys(found)[0];
      document.getElementById(`${formId}-${firstKey}`)?.focus();
      return;
    }

    if (!ENDPOINT) {
      window.location.href = buildMailto();
      setStatus({ state: "composed" });
      return;
    }

    setStatus({ state: "sending" });
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setStatus({ state: "sent" });
      setFields(EMPTY);
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong sending your enquiry.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="enquiry-form">
      <div className="enquiry-grid">
        <div className="field">
          <label htmlFor={`${formId}-name`} className="meta field-label">
            Name <span className="text-signal">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            value={fields.name}
            onChange={set("name")}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            className="field-control"
          />
          {errors.name ? (
            <p id={`${formId}-name-error`} className="field-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={`${formId}-email`} className="meta field-label">
            Email <span className="text-signal">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            value={fields.email}
            onChange={set("email")}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            className="field-control"
          />
          {errors.email ? (
            <p id={`${formId}-email-error`} className="field-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={`${formId}-company`} className="meta field-label">
            Company
          </label>
          <input
            id={`${formId}-company`}
            name="company"
            value={fields.company}
            onChange={set("company")}
            autoComplete="organization"
            className="field-control"
          />
        </div>

        <div className="field">
          <label htmlFor={`${formId}-projectType`} className="meta field-label">
            Project type
          </label>
          <select
            id={`${formId}-projectType`}
            name="projectType"
            value={fields.projectType}
            onChange={set("projectType")}
            className="field-control"
          >
            <option value="">Select a category</option>
            {services.map((service) => (
              <option key={service.id} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </div>

        <div className="field field-wide">
          <label htmlFor={`${formId}-timeline`} className="meta field-label">
            Approximate timeline
          </label>
          <select
            id={`${formId}-timeline`}
            name="timeline"
            value={fields.timeline}
            onChange={set("timeline")}
            className="field-control"
          >
            <option value="">Select a timeline</option>
            {TIMELINES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${formId}-details`} className="meta field-label">
          About the project <span className="text-signal">*</span>
        </label>
        <textarea
          id={`${formId}-details`}
          name="details"
          rows={4}
          value={fields.details}
          onChange={set("details")}
          aria-invalid={Boolean(errors.details)}
          aria-describedby={
            errors.details ? `${formId}-details-error` : undefined
          }
          className="field-control"
        />
        {errors.details ? (
          <p id={`${formId}-details-error`} className="field-error">
            {errors.details}
          </p>
        ) : null}
      </div>

      <div className="enquiry-actions">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="pill pill-solid group disabled:opacity-55"
        >
          <span className="meta">
            {status.state === "sending"
              ? "Sending…"
              : ENDPOINT
                ? "Send enquiry"
                : "Compose enquiry"}
          </span>
          <span aria-hidden data-arrow>
            →
          </span>
        </button>

        <p className="enquiry-note">
          {ENDPOINT
            ? "Your enquiry is sent straight to the ŹPF team."
            : "This opens your email app with the message ready to send."}
        </p>
      </div>

      {/* Status is announced, and never overstated. */}
      <div role="status" aria-live="polite" className="enquiry-status">
        {status.state === "composed" ? (
          <p>
            <span className="text-bone">Your message is ready.</span> Your
            email app should have opened with it composed — nothing has been
            sent yet. If nothing opened, write to{" "}
            <a href={`mailto:${site.email}`} className="link-underline text-bone">
              {site.email}
            </a>
            .
          </p>
        ) : null}

        {status.state === "sent" ? (
          <p>
            <span className="text-bone">Thank you.</span> Your enquiry has been
            received and we will be in touch.
          </p>
        ) : null}

        {status.state === "error" ? (
          <p>
            <span className="text-bone">That did not send.</span>{" "}
            {status.message} Please email{" "}
            <a href={`mailto:${site.email}`} className="link-underline text-bone">
              {site.email}
            </a>{" "}
            instead.
          </p>
        ) : null}
      </div>
    </form>
  );
}
