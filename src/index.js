'use strict';

var AlexaSkill = require('./AlexaSkill');

var config = require('./config');

var _ = require('./lodash');

var request = require('request');

var appId = config.appId;

var UrbanMind = function () {
    AlexaSkill.call(this, appId);
};

UrbanMind.prototype = Object.create(AlexaSkill.prototype);
UrbanMind.prototype.constructor = UrbanMind;

UrbanMind.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var repromptOutput, speechOutput;

    speechOutput = {
        speech: "Welcome to the Urban Mind. You can ask me to define slang words, for example as me what is the meaning of unfriend?",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    repromptOutput = {
        speech: "For instructions on what you can say, please say help me.",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.ask(speechOutput, repromptOutput);
};

UrbanMind.prototype.intentHandlers = {
    "DefineIntent": function (intent, session, alexaResponse) {
        var termSlot = intent.slots.Term;
        var speech, speechOutput, repromptOutput;
        var definitionPointer = 0;

        var hasTerm = termSlot && termSlot.value;

        if (!hasTerm) {
            speechOutput = {
                speech: "<speak>" + "I'm sorry, I couldn't find the word you asked for." + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            alexaResponse.tell(speechOutput);
        }

        request({
            url: config.endpoint,
            method: "GET",
            json: true,
            qs: {
                term: termSlot.value
            },
            headers: {
                "Accept": "application/json"
            }
        }, function (error, response, body) {
            if (error) {
                speechOutput = {
                    speech: "<speak>" + "I'm sorry, I couldn't find the word " + termSlot.value + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };
                alexaResponse.tell(speechOutput);
            } else {
                if (body.result_type === 'no_results') {
                    speechOutput = {
                        speech: "<speak>" + "I'm sorry, I couldn't find the word: " + termSlot.value + "</speak>",
                        type: AlexaSkill.speechOutputType.SSML
                    };
                    alexaResponse.tell(speechOutput);
                } else {
                    var cleanDefinition = body.list[definitionPointer].definition.replace(/\n/g, '').replace(/\r/g, '');
                    var cleanExample = body.list[definitionPointer].example.replace(/\n/g, '').replace(/\r/g, '');
                    speech = "" +
                        "<speak>" +
                        "<p>" + termSlot.value + ":" + "<break time='0.5s'/>" + cleanDefinition + "</p>" +
                        "<p>" + "Here is an example:" + "<break time='0.5s'/>" + cleanExample + "</p>" +
                        "<p>" + "Would you like to hear another definition?" + "</p>" +
                        "</speak>";

                    session.attributes.definitions = body.list;
                    session.attributes.similarTerms = _.uniq(body.tags);
                    session.attributes.definitionPointer = definitionPointer;
                }
                speechOutput = {
                    speech: speech,
                    type: AlexaSkill.speechOutputType.SSML
                };
                repromptOutput = {
                    speech: "<speak>" + "Would you like to hear a new definition for the same word?" + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };
                alexaResponse.ask(speechOutput, repromptOutput);
            }
        });
    },
    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye, friend!";
        response.tell(speechOutput);
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye, friend!";
        response.tell(speechOutput);
    },
    "AMAZON.NoIntent": function (intent, session, response) {
        var speechOutput = "Goodbye, friend!";
        response.tell(speechOutput);
        
    },
    "AMAZON.YesIntent": function (intent, session, response) {
        var speechOutput, repromptOutput;
        var sessionDefinitions = session.attributes.definitions;
        var sessionPointer = session.attributes.definitionPointer + 1;

        console.log(sessionDefinitions, sessionDefinitions.length);

        if (Array.isArray(sessionDefinitions) && sessionDefinitions.length > 1) {
            var cleanResponse = sessionDefinitions[sessionPointer].definition.replace(/\n/g, '').replace(/\r/g, '');
            speechOutput = {
                speech: "<speak>" +
                        "<p>" + cleanResponse + "</p>" +
                        "<p>" + "Would you like to hear a new definition of the same word?" + "</p>" +
                        "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            repromptOutput = {
                speech: "<speak>" + "Would you like to hear a new definition of the same word?" + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            session.attributes.definitionPointer = sessionPointer;
            response.ask(speechOutput, repromptOutput);
        } else {
            speechOutput = {
                speech: "<speak>I gave you all the definitions for your word, I don't have anymore, sorry!.</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            response.tell(speechOutput);
        }
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "I am here to help you understand slang words from urbandictionary.com, you can ask me things like what is the meaning of unfriend. Try me!";
        var repromptText = "Ask me to define words such as unfriend, trump and so many more!";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var UrbanMind = new UrbanMind();
    UrbanMind.execute(event, context);
};
