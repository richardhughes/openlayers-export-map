module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '*.js',
                    dest: 'build',
                    ext: '.min.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);

};