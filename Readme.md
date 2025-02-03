# Daily Report Bot
The application collects daily status reports.

## Prerequisites
- [NodeJS](https://nodejs.org/en)
- [ngrok](https://ngrok.com/docs/getting-started/)

## Installation
- Install node project with `npm run i`
- Add domain in [ngrok](https://dashboard.ngrok.com/domains) 

## Run locally
- Run node application `npm run dev`
- Launch ngrok `ngrok http 8080 --url <your domain>`

## Google Cloud Application Setup
The application expoits [Google Chat API](https://developers.google.com/workspace/chat/api-overview) and probably might have been installed as a production service, thus for development purposes it is recommended to maintain some isolated application in the Google Cloud. Please follow the guidance below to create and configure Google Chat Application:
- Build an Http Google Chat [app](https://developers.google.com/workspace/chat/quickstart/gcf-app)

The following slash commands should be specified:
- `/status` (id=1) to Report daily status
- `/team` (id=2) to List team members
- `/report` (id=3) to Evaluate team's report
- `/schedule` (id=4) to Enable report scheduling
- `/unschedule` (id=5) to Disable report scheduling

For development needs use your `ngrok` domain as an Http endpoint URL and App Home URL.

- Setup Google Cloud Firestore [Database](https://cloud.google.com/firestore/docs/create-database-server-client-library)

## Useful documentation
- Getting started with Google Cloud [Functions](https://cloud.google.com/functions/docs/console-quickstart)
- Getting started with Functions [Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs)
- Setup default [credentials](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)
- Google Chat [API](https://developers.google.com/workspace/chat/api-overview)
- Google chat application [samples](https://github.com/googleworkspace/google-chat-samples)
- Google chat application [Guide](https://developers.google.com/workspace/chat/tutorial-project-management)
- Getting started with Google Cloud Platform [Firestore](https://cloud.google.com/firestore/docs/create-database-server-client-library)
- How to run [emulator](https://cloud.google.com/firestore/docs/emulator)
- Setup default [credentials](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)
