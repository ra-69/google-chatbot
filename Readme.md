# Daily Report Bot
The application collects daily status reports.

## Prerequisites
- [NodeJS](https://nodejs.org/en)
- [ngrok](https://ngrok.com/docs/getting-started/)

## Installation
- Install node project with `npm run i`
- Add domain in [ngrok](https://dashboard.ngrok.com/domains)

## Environment variables
- To develop application locally create `.env` file structured as below
```
HOST=<ngrok proxy url like "https://crayfish-literate-poodle.ngrok-free.app">
ADMIN=<list of admins separated by ';' like "r.navarych@softteco.com;a.silchankau@softteco.com">
PARENT="projects/<your project id like magnetic-nimbus-385019>/locations/<location like us-central1>"
```
- To determine `PARENT_MSG` and `PARENT` you need to setup Google Cloud Application as described below

## Credentials file


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

## Deployment
- Install gcloud [CLI](https://cloud.google.com/sdk/docs/install)
- Run `npm run deploy` after replacing environment variables in the script to your own. Note that HOST environment variable should points to the deployment url itself.
- Set deployment url as Http endpoint URL and App Home URL in Google Chat API settings.

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

## User Guide
Daily report bot is designed to maintain regular status report collection. It might serve as an augmentation or replacement of traditional daily standup Agile ceremony or to represent some part of other status monitoring process.

### User Roles
There are two kinds of users:
- Administartors
- Fellows

Administrators can determine status report discipline and receive reports in realtime. Fellows are persons who provide reports and might review reports from others.

Administrators are configured by application environment variables setup.

### Activation Process
To activate daily report bot, click to `New chat` button in the Google Chat application and choose `DailyReportBot` in the App list.

### Commands
Communication with chat bot is performed by slush commands. Some of slush commands are available only for administrators. To see the complete command list enter `/` symbol in the chat bot prompt.

#### General Commands
- `/team` Shows each fellow's name, email and shedule time.
- `/report` Retrieves reports by fellow names and time period.
- `/timezone` Setup personal timezone to display all time related information in accordance with it.

#### Administation Commands
- `/status` Sends report requests to selected fellows.
- `/schedule` Schedule report to particular group of fellows in dedicated time interval. If schedule is specified it means that each day at particular time report collection would be activated. If schedule time is elapsed but fellow has not completed report yet, current report status is sent to adminstrators, fellow receives notification that report time is elapsed and cannot continue reporting.
- `/unschedule` Cancel report scheduling.

### Report Collection
The process of reports collection looks like as a natural dialog and consists of several sequential steps. When status report is activated chat bot sends questions like `What did you accomplished yesterday?` to particular fellow and waits for reply. After report is completed chat bot confirms it with the message `Thank you have a wonderful day!`. A collected report is sent to all admins in realtime and becomes available to review.



