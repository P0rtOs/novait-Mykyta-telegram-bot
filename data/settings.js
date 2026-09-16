module.exports = {
  uiPort: process.env.PORT || 1880,
  flowFile: "flows.json",
  credentialSecret: process.env.NODE_RED_CREDENTIAL_SECRET,

  functionExternalModules: false,

  logging: {
    console: {
      level: "info",
      metrics: false,
      audit: false
    }
  }
};
