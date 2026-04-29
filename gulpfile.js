'use strict'

const gulp = require('gulp')
const del = require('del')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const gulpIf = require('gulp-if')
const babel = require('gulp-babel')

const src = 'src'
const dest = 'dist'
const ext_dir = 'extension'
const bookmarklet_name = 'pagezipper.js'
const ext_name = 'pagezipper.js'

var isProd = false

const srcs = {
  headers: ['header.js'],
  libs: ['lib/jquery.js', 'lib/jstoolkit.js', 'lib/levenshtein.js'],
  pgzp_srcs: [
    'pagezipper.js',
    'compat.js',
    'image.js',
    'menu.js',
    'nextlink.js',
    'next_url_trials.js',
    'next_url.js',
    'page_loader_ajax.js',
    'page_loader_iframe.js',
    'page_loader.js',
    'util.js'
  ]
}

function build_pgzp(output_name, loader_file, destLoc, isProd = false) {
  const curr_headers = srcs.headers.map((f) => `${src}/${f}`)
  const curr_libs = srcs.libs.map((f) => `${src}/${f}`)
  const curr_pgzp_srcs = srcs.pgzp_srcs.map((f) => `${src}/${f}`)
  curr_pgzp_srcs.push(loader_file)

  const allJsFiles = curr_headers
    .concat(curr_libs)
    .concat([`${destLoc}/${output_name}`])

  gulp
    .src(curr_pgzp_srcs)
    .pipe(concat(output_name, { newLine: '\n\n' }))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest(destLoc))
    .on('end', function () {
      gulp
        .src(allJsFiles)
        .pipe(concat(output_name, { newLine: '\n\n' }))
        .pipe(gulp.dest(destLoc))
    })
}

gulp.task('clean', () => {
  const deleted = del.sync([`${dest}/*`])
  console.log(`deleted ${deleted.join(', ')}`)
})

gulp.task('make_bookmarklet', () => {
  build_pgzp(bookmarklet_name, `${src}/loader_bookmarklet.js`, dest, isProd)
})

gulp.task('make_chrome_ext', ['copy_ext'], () => {
  build_pgzp(ext_name, `${src}/loader_chrome.js`, `${dest}/${ext_dir}`, isProd)
})

gulp.task('copy_ext', () => {
  const merge = require('merge-stream')
  return merge(
    gulp.src(`${src}/${ext_dir}/**/*`).pipe(gulp.dest(`${dest}/${ext_dir}`)),
    gulp
      .src(`${src}/options/**/*`)
      .pipe(gulp.dest(`${dest}/${ext_dir}/options`)),
    gulp
      .src(`${src}/lib/jquery.js`)
      .pipe(gulp.dest(`${dest}/${ext_dir}/options/lib`))
  )
})

gulp.task('build', ['clean', 'make_bookmarklet', 'make_chrome_ext'])

gulp.task('watch', () => {
  gulp.watch(['src/**/*.js', 'src/**/*.html', 'src/**/*.css'], ['build'])
})

gulp.task('prod', () => {
  isProd = true
  gulp.start('build')
  console.log('Built in production mode')
})

gulp.task('default', ['build'])
