var less = require('less');
var path = require('path');

exports.summary = 'Compile LESS files to CSS';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<src>'
        ,describe : 'destination file'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, done) {
    var src = options.src;
    var dest = options.dest;

    exports.async.eachSeries(exports.files, function(inputFile, callback){
        var outputFile = dest;
        if(exports.file.isDirFormat(dest)){
            outputFile = path.join(dest , path.basename(inputFile) );
            // replace file extname to .css
            outputFile = outputFile.replace('.less', '.css');
        }

        exports.compileLess(inputFile, outputFile, options, callback);
    }, done);

};


var formatLessError = function(e) {
    if(less.formatError){
        return less.formatError(e);
    }else {
        var pos = '[' + 'L' + e.line + ':' + ('C' + e.column) + ']';
        return e.filename + ': ' + pos + ' ' + e.message;
    }
};


exports.compileLess = function (inputFile, outputFile, options, done) {

    options.paths = [path.dirname(inputFile)].concat(options.paths);
    options.filename = inputFile;

    var parser = new (less.Parser)(options);
    var data = exports.file.read(inputFile);
    parser.parse(data, function (err, tree) {
        if (err) {
            var message = formatLessError(err);
            return done('Error parsing LESS: ' + message);;
        }

        try {
            var css = tree.toCSS({
                silent: options.silent,
                verbose: options.verbose,
                ieCompat: options.ieCompat,
                compress: options.compress,
                yuicompress: options.yuicompress,
                maxLineLen: options.maxLineLen,
                strictMath: options.strictMath,
                strictUnits: options.strictUnits
            });

            if (outputFile) {
                exports.file.write(outputFile, css);
                exports.log(inputFile, ">", outputFile);
            }

            done(null, css);
        } catch (e) {
            var message = formatLessError(err);
            return done('Error compiling LESS: ' + message);;
        }
    
    });
};