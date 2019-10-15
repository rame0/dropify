const {watch, series, src, dest} = require('gulp');
var $ = require('gulp-load-plugins')(),
    meta = require('./package.json');

var argv = require('minimist')(process.argv.slice(2));

var jsDir = 'src/js/',
    sassDir = 'src/sass/',
    fontsDir = 'src/fonts/',
    distDir = 'dist',
    banner = [
        '/*!',
        ' * =============================================================',
        ' * <%= name %> v<%= version %> - <%= description %>',
        ' * <%= homepage %>',
        ' *',
        ' * (c) 2017 - <%= author %>',
        ' * =============================================================',
        ' */\n\n'
    ].join('\n'),
    umdDeps = {
        dependencies: function () {
            return [
                {
                    name: '$',
                    amd: 'jquery',
                    cjs: 'jquery',
                    global: 'jQuery',
                    param: '$'
                }
            ];
        }
    };

var onError = function (err) {
    // $.util.beep();
    console.log(err.toString());
    this.emit('end');
};

function fonts() {
    return src(fontsDir + '**/*')
        .pipe(dest(distDir + "/fonts"));
}

function sass() {
    return src(sassDir + '*.scss')
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.sass())
        .pipe($.autoprefixer())

        .pipe($.header(banner, meta))
        .pipe(dest(distDir + "/css"))

        .pipe($.if(!argv.dev, $.cleanCss()))
        .pipe($.if(!argv.dev, $.rename(meta.name + '.min.css')))
        .pipe($.if(!argv.dev, dest(distDir + "/css")));
}

function scripts() {
    return src([jsDir + '*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(dest(distDir + "/js"))
        .pipe($.umd(umdDeps))

        .pipe($.header(banner, meta))
        .pipe($.rename(meta.name + '.js'))
        .pipe(dest(distDir + "/js"))

        .pipe($.if(!argv.dev, $.uglify()))
        .pipe($.if(!argv.dev, $.header(banner, meta)))
        .pipe($.if(!argv.dev, $.rename(meta.name + '.min.js')))
        .pipe($.if(!argv.dev, dest(distDir + "/js")));
}

function start_watch(cb) {
    // console.log($);
    watch([jsDir + '**/*.js'], scripts);
    watch([sassDir + '**/*.scss'], sass);

    cb();
}

exports.default = series(sass, scripts, fonts, start_watch);

exports.build = series(sass, scripts, fonts);
