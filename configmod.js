#! /usr/bin/env node

var fs = require('fs');
var xml2js = require('xml2js');
var parser = require('json-parser');
var xpath = require("xml2js-xpath");

var shell = require("shelljs");
var commandLineArgs = require('command-line-args');
var optionDefinitions = [

    { name: 'src', type: String, defaultOption: true },
    { name: 'appSettings', alias: 'a', multiple: true, type: String },
    { name: 'connStrings', alias: 'c', multiple: true, type: String }
];

var options = commandLineArgs(optionDefinitions)

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();
fs.readFile(options.src, function(err, data) {
    parser.parseString(data, function(err, result) {

        //console.log(options.appSettings);
        if (options.appSettings) {
            for (var a = 0; a < options.appSettings.length; a++) {


                var optsVals = options.appSettings[a].split(':');
                console.log(optsVals);

                var matches = xpath.find(result, "/configuration/appSettings//add[@key='" + optsVals[0] + "']")[0];
                matches.$.value = optsVals[1];

            }
        }
        if (options.connStrings) {
            for (var a = 0; a < options.connStrings.length; a++) {


                var optsVals = options.connStrings[a].split(':');
                console.log(optsVals);

                var matches = xpath.find(result, "/configuration/connectionStrings//add[@name='" + optsVals[0] + "']")[0];
                matches.$.connectionString = optsVals[1];

            }
        }

        var xml = builder.buildObject(result);


        fs.writeFile(options.src, xml, function(err) {
            if (err) {
                return console.log(err);
            }


        })



    });
});