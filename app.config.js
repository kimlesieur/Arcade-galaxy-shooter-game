// app.config.js
export default ({ config }) => ({
    ...config,
    name: "my-app",
    slug: "my-app",
    scheme: "arcadegalaxy",
    ios: {
        bundleIdentifier: "com.kimlesieur.my-app",
    },
}); 