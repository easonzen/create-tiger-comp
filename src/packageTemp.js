module.exports = {
    main: 'dist/index.js',
    module: 'dist/index.esm.js',
    types: 'dist/index.d.ts',
    files: ['LICENSE', 'README.md', 'dist', 'src'],
    scripts: {
        build: 'father-build'
    },
    peerDependencies: {
        '@babel/runtime': '^7.0.0',
        lodash: '^4.17.15',
        react: '^16.13.1',
        'react-dom': '^16.13.1'
    }
};
