## Overview

This is a NodeJS app that serves up a static page allowing users to submit basic travel information and receieve carbon emissions estimates.

Carbon emissions calculations and data are sourced from [Carbon Interface](https://docs.carboninterface.com/#/) API

## Getting Started

1. Run `npm install`

2. Create a new file in the root directory called `.env`
3. Head over to [Carbon Interface](https://docs.carboninterface.com/#/) and create a new account
    - Follow the instructions to generate an API key
4. Add a new entry to `.env` called "SECRET_KEY" with your API Carbon Interface API key as the value
    - ex. `SECRET_KEY="$MY_API_KEY"`
5. Start the server on port 8080 with `npm run start`
    - the static UI is served at the base path `/`
    - the endpoint for fetching estimates is `/api/v1/calculate`