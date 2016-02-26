/**
 * Compile TS files to JS.
 *
 * @see https://github.com/TypeStrong/grunt-ts
 */
module.exports = function(grunt) {
    grunt.config.set('ts', {
        server_commonJs: {
            files: [
                {
                    src: [
                        'ap.i/**/*.ts'
                    ],
                    outDir: 'api'
                    //dest: ''// Will generate at the exact same location as the source.
                }
            ],

            options: {
                //compiler: 'node_modules/typescript/bin/tsc',
                module: 'commonjs',
                target: 'es5',
                fast: 'watch',
                comments: true,
                sourceMap: false,// Useless on the server side.
                declaration: false,// Always useful to have declarations available.
                noEmitOnError: true,// Force log errors.
                failOnTypeErrors: true,// Force log grunt errors pipeline.
                verbose: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
};
