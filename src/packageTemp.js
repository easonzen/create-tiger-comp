module.exports = {
    main: 'dist/index.js',
    module: 'dist/index.esm.js',
    types: 'dist/index.d.ts',
    files: ['LICENSE', 'dist', 'src'],
    scripts: {
        build: 'father-build'
    },
    peerDependencies: {
        '@babel/runtime': '^7.0.0',
        react: '^16.13.1',
        'react-dom': '^16.13.1'
    }
};
