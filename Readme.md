# google-chatbot
This project covers recent development practices of a chatbot application development on google cloud platform.

# How to run emulator

https://cloud.google.com/firestore/docs/emulator

# Getting started with Google Cloud Platform firestore

https://cloud.google.com/firestore/docs/create-database-server-client-library

# Getting started with Google Cloud Functions

https://cloud.google.com/functions/docs/console-quickstart

# Getting started with Functions Framework

https://github.com/GoogleCloudPlatform/functions-framework-nodejs

# Setup default credentials
https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment

# Deploy

```
gcloud functions deploy nodejs-http-function \
--gen2 \
--runtime=nodejs22 \
--region=us-central1 \
--source=build \
--entry-point=chatBot \
--trigger-http
```

# Repository

https://github.com/googleworkspace/google-chat-samples

# Guide

https://developers.google.com/workspace/chat/tutorial-project-management



