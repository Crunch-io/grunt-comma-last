# grunt-comma-last
Did your team decide to use comma-first style for JavaScript? This tool makes easier to rollback such an awful decision

##Setup

Install `npm install grunt-comma-last@1.0.0`

Setup a new grunt task 

```JavaScript
'use strict'

module.exports = function(grunt) {

    grunt.initConfig({
        commaLast : {
            default : {
                files : [
                    { src : ['src/**/*.js'], dest : 'transforms' }
                ]
            }
        }
    })

    grunt.loadNpmTasks('grunt-comma-last')
}
```
