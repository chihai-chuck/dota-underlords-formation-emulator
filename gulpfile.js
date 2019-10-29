const gulp = require('gulp'),
    clean = require('gulp-clean'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    htmlmin = require('gulp-htmlmin'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    csso = require('gulp-csso'),
    postcss = require('gulp-postcss'),
    pxtorem = require('postcss-pxtorem'),
    short = require('postcss-short'),
    cssnext = require('postcss-cssnext'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    base64 = require('gulp-base64'),
    cheerio = require('gulp-cheerio'),
    order = require('gulp-order'),
    inject = require('gulp-inject'),
    rename = require('gulp-rename'),
    clipboard = require('gulp-clipboard'),
    pipeconsole = require('gulp-pipeconsole');

gulp.task('clean', () => {
    return gulp.src('./dist', {read: false, allowEmpty: true})
        .pipe(clean());
});

gulp.task('build:lib', () => {
    return gulp.src('./src/controllers/lib/**/*.*')
        .pipe(gulp.dest('./dist/controllers/lib'))
});

gulp.task('build:js', gulp.series('build:lib', () => {
    return gulp.src(['./src/controllers/**/*.js', '!./src/controllers/lib/*.js'])
        .pipe(babel({
            babelrc: true
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/controllers'))
}));

gulp.task('build:less', () => {
    return gulp.src('./src/styles/*.less')
        .pipe(less())
        .pipe(base64())
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
        .pipe(gulp.dest('./dist/styles'))
});

gulp.task('build:image', () => {
    return gulp.src('./src/assets/images/**/*.*(png|jpg|jpeg|gif|svg|webp)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('./dist/images'))
});

gulp.task('build:html', () => {
    return gulp.src('./src/pages/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build:font', () => {
    return gulp.src('./src/assets/fonts/*.*(woff2?|eot|ttf|otf)')
        .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('build:rev', gulp.series('build:image', 'build:less', 'build:js', 'build:html', 'build:font', () => {
    return gulp.src('./dist/**/*.*(html|js|css)')
        .pipe(replace('.less', '.css'))
        .pipe(gulp.dest('./dist'));
}));

gulp.task('replace:css', () => {
    return gulp.src('./dist/styles/**/*.css')
        .pipe(replace('../assets/images', './images'))
        .pipe(replace('../assets/fonts', './fonts'))
        .pipe(concat('main.css'))
        .pipe(replace('\n', ''))
        .pipe(gulp.dest('./dist'));
});

gulp.task('replace:js', () => {
    return gulp.src('./dist/controllers/**/*.js')
        .pipe(order([
            "lib/*.js",
            "base.js",
            "supply-box-lottery.js",
            "index.js"
        ]))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./dist'))
});

gulp.task('clean:js', () => {
    return gulp.src('./dist/controllers', {read: false})
        .pipe(clean());
});
gulp.task('clean:css', () => {
    return gulp.src('./dist/styles', {read: false})
        .pipe(clean());
});

gulp.task('replace:html', () => {
    //TODO 此处替换@click为@tap，是因为小黑盒词条默认使用FastClick，但是在IOS在11之后已经修复click事件的300ms延时问题，使用了反而会造成点击卡顿，所以改为@tap使用小黑盒词条注入的点击事件
    return gulp.src('./dist/index.html')
        .pipe(replace('../assets/images', 'images'))
        .pipe(replace('../assets/fonts', 'fonts'))
        .pipe(replace('@click="', '@tap="'))
        .pipe(cheerio($ => {
            $("script").remove();
            $("link").remove();
            $("meta").remove();
        }))
        .pipe(inject(gulp.src(['dist/main.js', 'dist/main.css']), {
            relative: true,
            removeTags: true,
            transform: (filePath, file) => {
                if(filePath.slice(-3) === '.js') {
                    return `<script>${file.contents}</script>`;
                }
                if(filePath.slice(-4) === '.css') {
                    return `<style>${file.contents}</style>`;
                }
                return file.contents;
            }
        }))
        .pipe(replace('<!DOCTYPE html><html><head>', ''))
        .pipe(replace('</head><body>', ''))
        .pipe(replace('</body></html>', ''))
        .pipe(rename(path => {
            path.basename = "compile";
            path.extname = ".txt";
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('clipboard:copy', () => {
    return gulp.src('./dist/compile.txt')
        .pipe(clipboard())
        .pipe(pipeconsole("编译内容文本已自动复制到剪贴板，此代码目前仅支持在小黑盒APP的词条中正常运行。"));
});

gulp.task('build', gulp.series('clean', 'build:rev', 'replace:css', 'clean:css', 'replace:js', 'clean:js', 'replace:html', 'clipboard:copy', () => {
    return gulp.src(['dist/main.js', 'dist/main.css', './dist/index.html'], {read: false})
        .pipe(clean());
}));
