module.exports = {
    extensionsToTreatAsEsm: [".ts"],
    globals: { "ts-jest": { useESM: true } },
    transform: {
        "\\.[jt]sx?$": "ts-jest",
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
