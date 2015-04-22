module.exports = function( grunt )
{
  "use strict"
  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    banner: '/* Minijs v<%= pkg.version %> (<%= pkg.homepage %>)*/',
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      minijs: {
        src: [
          'src/core.js',
          'src/event.js',
          'src/fx.js',
          'src/fx_methods.js',
          'src/ajax.js',
          'src/data.js',
          'src/detect.js',
          'src/touch.js',
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some',
        banner: '<%= banner %>'
      },
      min: {
        src: '<%= concat.minijs.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);
  grunt.registerTask('default',['concat','uglify'])

}
