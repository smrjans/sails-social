module.exports = function (grunt) {
  grunt.registerTask('watchTasks', ['compileAssets', 'linkAssets', 'clean:ts', 'ts:server_commonJs']);
};
