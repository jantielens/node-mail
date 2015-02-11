# Node.js Mail/Calendar Sample #

This sample is a proof-of-concept sample that uses the [Microsoft Office 365 APIs Client Libraries for Cordova Applications](https://www.nuget.org/packages/Microsoft.Office365.ClientLib.JS/) from a pure Node.js server app. The client libraries were designed to be run from Cordova-based client apps, so this solution might not work in all situations.

## Tricks used ##

- To load in the exchange.js file, which is not a Node module, I used the method described [here](http://stackoverflow.com/questions/5171213/load-vanilla-javascript-libraries-into-node-js).
- The exchange.js file uses the AJAX XMLHttpRequest object for sending requests. To get it working quickly without having to modify exchange.js, I used the node-XMLHttpRequest module.

## Required software ##

- [Microsoft Office 365 APIs Client Libraries for Cordova Applications](https://www.nuget.org/packages/Microsoft.Office365.ClientLib.JS/)
- [Formidable](https://github.com/felixge/node-formidable)
- [node-XMLHttpRequest](https://github.com/driverdan/node-XMLHttpRequest)
- [simple-oauth2](https://github.com/andreareginato/simple-oauth2)

## Running the sample ##

It's assumed that you have Node.js installed before starting.

1. Download or fork the sample project.
1. Install formidable, node-XMLHttpRequest and simple-oauth2 with npm.
1. Download the Office 365 client libraries from Nuget. Copy exchange.js and utility.js into the `.\node-modules\exchange\exchange-lib\` directory.
1. [Register the app in Azure Active Directory](https://github.com/jasonjoh/office365-azure-guides/blob/master/RegisterAnAppInAzure.md). The app should be registered as a web app with a Sign-on URL of "http://localhost:8000", and should be given permission to "Read and write access to users' mail", "Have full access to users' calendars", and "Have full access to users' contacts".
1. Edit the `.\clientId.js` file. Copy the client ID for your app obtained during app registration and paste it as the value for the `exports.clientId` variable. Copy the key you created during app registration  and paste it as the value for the `exports.clientSecret` variable. Save the file.
1. Install all required Node.js modules `npm install`
1. Start the development server: `npm start`
1. Use your browser to go to http://127.0.0.1:8000.
1. You should now be prompted to connect your Office 365 account. Click the link to do so and login with an Office 365 account.
1. You should be redirected to the home page, which should display "Welcome, <Logged in Users's Name>".
1. You can use the navigation links at the top of the page to view mail, calendar, or contacts.

## Copyright ##

Copyright (c) Microsoft. All rights reserved.

----------
Connect with me on Twitter [@JasonJohMSFT](https://twitter.com/JasonJohMSFT)

Follow the [Exchange Dev Blog](http://blogs.msdn.com/b/exchangedev/)