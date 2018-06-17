import autoPrefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
// import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import cssNano from 'gulp-cssnano';
import del from 'del';
import dependencies from 'gulp-dependencies';
import esLint from 'gulp-eslint';
import gulp from 'gulp';
import mustache from 'gulp-mustache';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import source from 'vinyl-source-stream';
import sourceMaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import webServer from 'gulp-webserver';

////////////////////////////////////////////////////////////////////////////////

export function clean() {
	return del('./dist');
}

////////////////////////////////////////////////////////////////////////////////

const buildJsSrc = './src/**/*.js';
export function buildJs() {
	const buildJsDest = './dist/';
	return gulp.src(buildJsSrc)
		.pipe(mustache())
		.pipe(esLint())
		.pipe(esLint.format())
		.pipe(babel())
		.pipe(gulp.dest(buildJsDest))
		.pipe(rename((path) => path.basename += '.min'))
		.pipe(sourceMaps.init())
		.pipe(uglify())
		.pipe(sourceMaps.write('.'))
		.pipe(gulp.dest(buildJsDest));
}

////////////////////////////////////////////////////////////////////////////////

// const browserifyJsSrc = './dist/scripts/main.js';
// export function browserifyJs() {
// 	const browserifyJsDist = './dist/scripts/';
// 	const browserifyJsFile = 'bundle.js';
// 	return browserify(browserifyJsSrc)
// 		.bundle()
// 		.pipe(source(browserifyJsFile))
// 		.pipe(gulp.dest(browserifyJsDist))
// 		.pipe(buffer())
// 		.pipe(rename((path) => path.basename += '.min'))
// 		.pipe(sourceMaps.init())
// 		.pipe(uglify())
// 		.pipe(sourceMaps.write('.'))
// 		.pipe(gulp.dest(browserifyJsDist));
// }

////////////////////////////////////////////////////////////////////////////////

const buildSassSrc = './src/**/*.scss';
export function buildSass() {
	const buildSassDest = './dist/';
	return gulp.src(buildSassSrc)
		.pipe(mustache())
		.pipe(sass())
		.pipe(autoPrefixer())
		.pipe(gulp.dest(buildSassDest))
		.pipe(rename((path) => path.basename += '.min'))
		.pipe(sourceMaps.init())
		.pipe(cssNano())
		.pipe(sourceMaps.write('.'))
		.pipe(gulp.dest(buildSassDest));
}


////////////////////////////////////////////////////////////////////////////////

const buildHtmlSrc = './src/**/*.html';
export function buildHtml() {
	const buildHtmlDest = './dist/';
	return gulp.src(buildHtmlSrc)
		.pipe(mustache())
		.pipe(dependencies({ dest: buildHtmlDest, prefix: '/vendors' })) // NOT WORKING
		.pipe(gulp.dest(buildHtmlDest));
}

////////////////////////////////////////////////////////////////////////////////

export const build = gulp.series(clean, gulp.parallel(buildJs, buildSass, buildHtml));
// const buildBrowserifyJs = gulp.series(buildJs, browserifyJs);
// export const build = gulp.series(clean, gulp.parallel(buildBrowserifyJs, buildSass, buildHtml));
export default build;

////////////////////////////////////////////////////////////////////////////////

export const serve = gulp.series(build, () => {
	const servePath = '.'; // './src';
	gulp.src(servePath)
		.pipe(webServer({
			directoryListing: { enable: true, path: servePath },
			livereload: true,
			open: true,
			port: 8080
		}));

	gulp.watch(buildJsSrc, () => buildJs());
	// gulp.watch(buildJsSrc, () => buildBrowserifyJs());
	gulp.watch(buildSassSrc, () => buildSass());
	gulp.watch(buildHtmlSrc, () => buildHtml());

	const templateGlob = './src/**/*.template.html';
	gulp.watch(templateGlob, () => build());
});
