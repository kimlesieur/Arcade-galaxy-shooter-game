// app.config.js
export default ({ config }) => ({
    ...config,
    name: "my-app",
    slug: "my-app",
    scheme: "arcadegalaxy",
    ios: {
        bundleIdentifier: "com.kimlesieur.my-app",
    },
    android: {
        package: "com.kimlesieur.myapp",
    },
    expo: {
        experiments: {
            reactCompiler: true,
        },
    },
}); 