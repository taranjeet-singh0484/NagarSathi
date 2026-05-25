import disposableDomains from "disposable-email-domains" with { type: "json" };

export const isDisposableEmail = (email) => {
  if (!email) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return disposableDomains.includes(domain);
};
