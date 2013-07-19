module.exports = function (grunt) {
    grunt.initConfig({
        typescript: {
            base: {
                src: ['src/**/*.ts'],
                dest: 'build/coral.js',
                options: {
                    target: 'es5',
                    base_path: 'src/',
                    sourcemap: true,
                    fullSourceMapPath: true,
                    declaration: true,
                    comments: true,
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! coraljs 0.1-alpha - license MIT - http://coraljs.com */\n'
            },
            build: {
                src: 'build/coral.js',
                dest: 'build/coral.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['typescript', 'uglify']);
};