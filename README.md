#UrbanMind - UrbanDicionary for Alexa

## AWS Lambda Setup
1. Go to AWS Lambda
2. Click on the 'Create a Lambda Function'
3. Select 'Blank Function'
4. Select 'Alexa Skills Kit' as the trigger, click next
5. Name the Lambda Function "UrbanEcho".
6. Select the 'Runtime' as `Node.js 4.3`
7. Go to the the root directory of this repository and run `./gradlew clean buildUrbanEcho` in command line.
8. Select 'Code entry type' as "Upload a .ZIP file" and then upload the file `build/distribution/urbanecho-0.0.1.zip` to Lambda.
9. Keep the Handler as `index.handler`
10. Create a basic execution role and click create (or choose an existing)
11. Click "Next" and click "Create Function".
12. Copy the ARN from the top right to be used later in the Alexa Skill Setup.

## Alexa Skill Setup
1. Go to [Alexa Developer Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "UrbanEcho" as the skill name and "urban dictionary" as the invocation name (or any other name)
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from AWS Lambda and click next
4. Copy the custom slot types from the customSlotTypes folder. The name of the file is the name of the custom slot type, and the values in the file are the values for the custom slot. (This file only contains some of the words from UrbanDictionary, see Notes below for more information)
5. Copy and paste the IntentSchema from `/speechAssets/customSlotTypes/IntentSchema.json`.
6. Copy the Sample Utterances from the included `/speechAssets/SampleUtterances.txt`. Click Next.
7. Go back to the building section of this skill, go to `/src/config.json` and paste the appId (this is the ID of the Alexa Skill NOT the Lambda ARN), then go back to AWS Lambda and reupload this new zip.
8. Go to the [Alexa Skills](http://echo.amazon.com/#skills) and you can enable/disable this skill.

##Notes
The custom slot types only contains some words from urban dictionary but this skill will also pick up words that are not in the custom slot types and attempt to search for it on UrbanDictionary. Depending on the complexity of the word Alexa might or might not understand it, therefore to improve the understandability of the word for Alexa you can scrape a list of words from UrbanDictionary. I have created a Java program, called [Urban Scraper](https://github.com/loop/Urban-Scraper) that will scrape all the words from A-Z so you can copy and paste it into different custom slot types.

But I have tested this skill with words not in the custom slot types and the definition came back perfectly good.

I have attempted to release this in to the Alexa Skill Store but was rejected by Amazon for the following reason:

>1. We provide our customers with a family-friendly environment and do not permit adult content in skills at this time. Please remove the adult content and resubmit for certification.
>
>We provide our customers with a family-friendly environment and do not permit adult content in skills at this time. Please remove the adult content and resubmit for certification.

UrbanMind code extended from the [Node.js Alexa Skills Kit Samples](https://github.com/amzn/alexa-skills-kit-js) from Amazon.