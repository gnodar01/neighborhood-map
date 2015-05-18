/* First you should run ' npm init ' to creat the package.json file;
	then run ' npm install --save-dev gulp ' to install gulp locally, and add it to our package.json file (see below)
*/

// Set up dependencies
var gulp = require('gulp'), // npm install --save-dev gulp
	uglify = require('gulp-uglify'), // npm install --save-dev gulp-uglify
	minifyCSS = require('gulp-minify-css'), // npm install --save-dev gulp-minify-css
	rename = require("gulp-rename"), // npm install --save-dev gulp-rename
	jshint = require('gulp-jshint'), // npm install --save-dev gulp-jshint
	concat = require('gulp-concat'); // npm install --save-dev gulp-concat

/* alternatively, right after 'npm install -save-dev gulp', we can just put
	'npm install gulp-uglify gulp-minify-css gulp-rename gulp-jshint gulp-concat --save-dev'
	in the command line */

// Lint Task (to run just this task, type 'gulp lint' in command line)
gulp.task('lint', function() {
    return gulp.src(['js/*.js', '!js/knockout.js'])
        .pipe(jshint()) // Run lint
        .pipe(jshint.reporter('default')); // Log lint errors
});

/* Concatenate all js files, minify it, and save it in 'dist' folder inside root dir */
gulp.task('scripts', function(){
	return gulp.src(['js/*.js', '!js/knockout.js'])
		.pipe(concat('app.min.js')) // Concatinated file will be named 'all.js'
		.pipe(uglify()) // Minify new concat file
		.pipe(gulp.dest('dist')); // Save alongside concat. file in 'dist'
});

/* Takes CSS file, copies it, minifies it, renames it 'style.min.css' and saves it in 'dist' */
gulp.task('styles', function() {
	return gulp.src('css/*.css')
		.pipe(minifyCSS())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest('dist'));
});

/* Wathces all js files and css files, and if changed, runs the gulp tasks */
gulp.task('watch', function(){
	gulp.watch('js/*.js', ['lint', 'scripts']); // Runs both 'lint' and 'scripts' tasks on all js files within /js folder
	gulp.watch('css/*.css', ['styles']);
});

// This is run when you type just 'gulp' in the command line; runs all tasks in array
gulp.task('default', ['lint', 'scripts', 'styles', 'watch']);
