var gulp         = require('gulp'),
	sass         = require('gulp-sass'),
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify-es').default,
	cleancss     = require('gulp-clean-css'),
	autoprefixer = require('gulp-autoprefixer'),
	rsync        = require('gulp-rsync'),
	newer        = require('gulp-newer'),
	rename       = require('gulp-rename'),
	responsive   = require('gulp-responsive'),
	del          = require('del'),
	pug 	     = require('gulp-pug'),
	spritesmith  = require('gulp.spritesmith'),
	sourcemaps   = require('gulp-sourcemaps');

// Local Server
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			port: 9000,
			baseDir: "app"
		},
		notify: false,
		// online: false, // Work offline without internet connection
		// tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
	})
});
function bsReload(done) { browserSync.reload(); done(); };

// Pug Compile
gulp.task('Pug', function() {
	return gulp.src('app/template/index.pug')
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest('app'))
	.pipe(browserSync.reload({ stream: true }))
});

// Custom Styles
gulp.task('styles', function() {
	return gulp.src('app/scss/main.scss')
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
	.pipe(concat('styles.min.css'))
	.pipe(autoprefixer({
		grid: true,
		overrideBrowserslist: ['last 10 versions']
	}))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

// Scripts & JS Libraries
gulp.task('scripts', function() {
	return gulp.src([
		'app/libs/js__src/common.js'
		])
	.pipe(sourcemaps.init())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Minify js (opt.)
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('app/js/'))
	.pipe(browserSync.reload({ stream: true }));
});

//JS:Libraries
gulp.task('JS:Libraries', function() {
	return gulp.src([
		//'app/libs/jquery/jquery-3.4.1.min.js'
		//'app/libs/wow/wow.min.js'
		])
	.pipe(sourcemaps.init())
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('app/js/'));
});

/* Sprite */
gulp.task('sprite', function(cb) {
	const spriteData = gulp.src('app/img/icons/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '../sprites/sprite.png',
		cssName: '_sprite.scss'
	}));

	spriteData.img.pipe(gulp.dest('app/sprites/'));
	spriteData.css.pipe(gulp.dest('app/scss/global/'));
	cb();
});

// Responsive Images
gulp.task('img-responsive', async function() {
	return gulp.src('app/img/_src/**/*.{png,jpg,jpeg,webp,raw}')
		.pipe(newer('app/img/@1x'))
		.pipe(responsive({
			'*': [{
				// Produce @2x images
				width: '100%', quality: 90, rename: { prefix: '@2x/', },
			}, {
				// Produce @1x images
				width: '50%', quality: 90, rename: { prefix: '@1x/', }
			}]
		})).on('error', function () { console.log('No matching images found') })
		.pipe(rename(function (path) {path.extname = path.extname.replace('jpeg', 'jpg')}))
		.pipe(gulp.dest('app/img'))
});
gulp.task('img', gulp.series('img-responsive', bsReload));

// Clean @*x IMG's
gulp.task('cleanimg', function() {
	return del(['app/img/@*'], { force: true })
});



// Deploy
gulp.task('rsync', function() {
	return gulp.src('app/')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Included files
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excluded files
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', function() {
	gulp.watch('app/template/**/*.pug', gulp.parallel('Pug'));
	gulp.watch('app/scss/**/*.scss', gulp.parallel('styles'));
	gulp.watch('app/libs/js__src/**/*.js', gulp.parallel('scripts'));
	gulp.watch('app/img/_src/**/*', gulp.parallel('img'));
});

gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch'));
