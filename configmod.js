#! /usr/bin/env node

var fs = require('fs');
var xml2js = require('./xml2js');
var parser = require('json-parser');
var xpath = require("xml2js-xpath");
const {
    gitDescribe,
    gitDescribeSync
} = require('git-describe');

var shell = require("shelljs");
var commandLineArgs = require('command-line-args');
var optionDefinitions = [

    {
        name: 'src',
        type: String,
        defaultOption: true
    },
    {
        name: 'appSettings',
        alias: 'a',
        multiple: true,
        type: String
    },
    {
        name: 'connStrings',
        alias: 'c',
        multiple: true,
        type: String
    },
    {
        name: 'verSettings',
        alias: 'v',
        type: String
    }
];

var options = commandLineArgs(optionDefinitions)

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();
fs.readFile(options.src, function (err, data) {
    parser.parseString(data, function (err, result) {

        if (options.verSettings && options.verSettings.length > 1) {

            try {
                console.log(options.verSettings);
                var gitInfo = gitDescribeSync();
                console.log(gitInfo.raw);
                var matches = xpath.find(result, "/configuration/appSettings//add[@key='" + options.verSettings + "']")[0];
                if (gitInfo.tag) {
                    if (matches && matches.$) {
                        matches.$.value = gitInfo.tag;
                    }
                } else {
                    if (matches && matches.$) {
                        matches.$.value = gitInfo.raw;
                    }
                }
            } catch (e) {
                console.log(e);
            }


        }

        //console.log(options.appSettings);
        if (options.appSettings) {
            for (var a = 0; a < options.appSettings.length; a++) {

                try {
                    var optsVals = options.appSettings[a].split(':');
                    var val = options.appSettings[a].substring(optsVals[0].length + 1);
                    console.log(optsVals[0] + ":" + val);

                    var matches = xpath.find(result, "/configuration/appSettings//add[@key='" + optsVals[0] + "']")[0];
                    if (matches && matches.$) {
                        matches.$.value = val;
                    }
                } catch (e) {
                    console.log(e);
                }

            }
        }
        if (options.connStrings) {
            for (var a = 0; a < options.connStrings.length; a++) {

                try {
                    var optsVals = options.connStrings[a].split(':');
                    var val = options.connStrings[a].substring(optsVals[0].length + 1);
                    console.log(optsVals[0] + ":" + val);


                    var matches = xpath.find(result, "/configuration/connectionStrings//add[@name='" + optsVals[0] + "']")[0];
                    if (matches && matches.$) {
                        matches.$.connectionString = val;
                    }
                } catch (e) {
                    console.log(e);
                }

            }
        }

        var xml = builder.buildObject(result);


        fs.writeFile(options.src, xml, function (err) {
            if (err) {
                return console.log(err);
            }


        })



    });
});