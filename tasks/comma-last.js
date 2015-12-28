'use strict'

let streamToPromise = require('stream-to-promise')
let through2 = require('through2')
let Q = require('q')
let fs = require('fs')
let path = require('path')

const END_STRING = 'END'

module.exports = function(grunt) {
    grunt.registerMultiTask('commaLast', function() {
        let done = this.async()
        Q.all(this.files.map(fileCfg => convert(grunt, fileCfg))).then(done)
    })
}

function convert(grunt, fileCfg) {
    createDir(grunt, fileCfg)
    return streamToPromise(
        read(fileCfg.src[0])
        .pipe(transform())
        .pipe(write(fileCfg.dest))
    )
}

function createDir(grunt, fileCfg) {
    grunt.file.mkdir(path.dirname(fileCfg.dest))
}

function read(path) {
    return fs.createReadStream(path)
}

function transform() {
    return through2(function (chunk, enc, next) {
        let transformed = toFile(toLines(chunk.toString('utf-8')).map(toCommaLast))
        this.push(transformed)
        next()
    })
}

function write(path) {

    return fs.createWriteStream(path)
}

function toLines(file) {
    return file.split('\n')
}

function toFile(lines) {
    return lines.join('\n')
}

function toCommaLast(line, index, file) {
    return addCommaLast(rmCommaFirst(line), index, file)
}

function addCommaLast(line, index, file) {
    return !isEmptyLine(line) && hasCommaFirst(next(file, index)) ?
        insertBeforeComments(line, ',') :
        line
}

function insertBeforeComments(line, char) {
    let commentStart = line.indexOf(`\/\/`)
    const COMMA = ','

    return commentStart === -1 ? line + COMMA :
    line.split('').reduce((str, char, i) =>  {
        let nextChar = (i+1) === commentStart ? COMMA : ''
        return str.concat(char).concat(nextChar)
    }, '')
}

function rmCommaFirst(line) {
    return hasCommaFirst(line) ? line.replace(/,\s*/i, '')
                               : line
}

function removeChar(str, target) {
    return str.split('')
       .filter((c,index) => index !== target)
       .join('')
}

//avoids empty lines
function next(file, index) {
    let nextIndex = index + 1
    let nextLine = file.length <= nextIndex ? END_STRING : file[nextIndex]

    return isEmptyLine(nextLine) ? next(file, nextIndex) : nextLine
}

function isEmptyLine(line) {
    return line !== END_STRING && (/^\s+$/gi.test(line) || line.length === 0)
}

function hasCommaFirst(line) {
    return (/^\s*,.+/gi).test(line)
}
