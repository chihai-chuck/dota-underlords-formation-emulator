const gulp = require('gulp'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    htmlmin = require('gulp-htmlmin'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    csso = require('gulp-csso'),
    postcss = require('gulp-postcss'),
    pxtorem = require('postcss-pxtorem'),
    short = require('postcss-short'),
    cssnext = require('postcss-cssnext'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    base64 = require('gulp-base64'),
    webserver = require('gulp-webserver'),
    livereload = require('gulp-livereload'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('build:lib', () => {
    return gulp.src('./src/controllers/lib/**/*.*')
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev/controllers/lib'))
});

gulp.task('build:js', gulp.series('build:lib', () => {
    return gulp.src(['./src/controllers/**/*.js', '!./src/controllers/lib/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
            babelrc: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev/controllers'))
}));

gulp.task('build:less', () => {
    return gulp.src('./src/styles/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(base64({
            maxImageSize: 20480
        }))
        .pipe(postcss([
            pxtorem({
                rootValue: 20,
                propList: ["*"],
                minPixelValue: 2
            }),
            short(),
            cssnext()
        ]))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev/styles'))
});

gulp.task('build:image', () => {
    return gulp.src('./src/assets/images/**/*.*(png|jpg|jpeg|gif|svg|webp)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('./dev/images'))
});

gulp.task('build:html', () => {
    return gulp.src('./src/pages/*.html')
        .pipe(sourcemaps.init())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev'));
});

gulp.task('build:font', () => {
    return gulp.src('./src/assets/fonts/*.*(woff2?|eot|ttf|otf)')
        .pipe(gulp.dest('./dev/fonts'))
});

gulp.task('build:rev', gulp.series('build:image', 'build:less', 'build:js', 'build:html', 'build:font', () => {
    return gulp.src('./dev/**/*.*(html|js|css)')
        .pipe(replace('.less', '.css'))
        .pipe(gulp.dest('./dev'));
}));

gulp.task('replace:html', () => {
    return gulp.src('./dev/**/*.html')
        .pipe(replace('../styles', 'styles'))
        .pipe(replace('../controllers', 'controllers'))
        .pipe(replace('../assets/images', 'images'))
        .pipe(replace('../assets/fonts', 'fonts'))
        .pipe(replace('@click', '@touchstart'))
        .pipe(gulp.dest('./dev'));
});

gulp.task('replace:css', () => {
    return gulp.src('./dev/styles/**/*.css')
        .pipe(replace('../assets/images', '../images'))
        .pipe(replace('../assets/fonts', '../fonts'))
        .pipe(gulp.dest('./dev/styles'));
});

gulp.task('replace', gulp.series('build:rev', 'replace:css', 'replace:html'));

gulp.task('serve', () => {
    return gulp.src('./dev')
        .pipe(webserver({
            livereload: true,
            open: false,
            host: '0.0.0.0',
            port: 55105,
            proxies: [
                {
                    source: "/wiki",
                    target: "https://api.xiaoheihe.cn/wiki"
                }
            ]
        }));
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*', gulp.series('replace'));
    livereload.listen();
    gulp.watch('./dev/**/*').on('change', livereload.changed);
});

gulp.task('dev', gulp.series('replace', gulp.parallel('serve', 'watch')));
