function normalizeLogDetails(details) {
  if (details == null) {
    return {};
  }

  if (typeof details === "object" && !Array.isArray(details)) {
    return details;
  }

  return { summary: details };
}

module.exports = {
  uiPort: process.env.PORT || 1880,
  flowFile: "flows.json",
  credentialSecret: process.env.NODE_RED_CREDENTIAL_SECRET,

  functionExternalModules: false,

  functionGlobalContext: {
    formatLogEvent({ level = "info", scope = "app", event = "event", chatId = "unknown", details = {} } = {}) {
      const safeScope = String(scope || "app");
      const safeEvent = String(event || "event");

      return JSON.stringify({
        ts: new Date().toISOString(),
        level: String(level || "info"),
        chatId: String(chatId ?? "unknown"),
        step: safeScope + ":" + safeEvent,
        scope: safeScope,
        event: safeEvent,
        details: normalizeLogDetails(details)
      });
    }
  },

  logging: {
    console: {
      level: "info",
      metrics: false,
      audit: false
    }
  }
};
