# Node.js Mail/Calendar Sample #

This sample is a proof-of-concept sample that uses the [Microsoft Office 365 APIs Client Libraries for Cordova Applications](https://www.nuget.org/packages/Microsoft.Office365.ClientLib.JS/) from a pure Node.js server app. The client libraries were designed to be run from Cordova-based client apps, so this isn't really a recommended solution for real-world applications.

## Required software ##

- [Microsoft Office 365 APIs Client Libraries for Cordova Applications](https://www.nuget.org/packages/Microsoft.Office365.ClientLib.JS/)
- [node-XMLHttpRequest](https://github.com/driverdan/node-XMLHttpRequest)
- [simple-oauth2](http://andreareginato.github.io/simple-oauth2/)

## Running the sample ##

It's assumed that you have Node.js installed before starting.

1. Download or fork the sample project.
1. Install node-XMLHttpRequest and simple-oauth2 with npm.
1. Download the Office 365 client libraries from Nuget. Copy exchange.js and utility.js into the `.\node-modules\exchange\exchange-lib\` directory.
1. [Register the app in Azure Active Directory](https://github.com/jasonjoh/office365-azure-guides/blob/master/RegisterAnAppInAzure.md). The app should be registered as a web app with a Sign-on URL of "http://127.0.0.1:8000", and should be given permission to "Read users' mail" and "Read users' calendars".
1. Edit the `.\authHelper.js` file. Copy the client ID for your app obtained during app registration and paste it as the value for the `id` variable. Copy the key you created during app registration  and paste it as the value for the `secret` variable. Save the file.
1. Start the development server: `node index.js`
1. Use your browser to go to http://127.0.0.1:8000.
1. You should now be prompted to connect your Office 365 account. Click the link to do so and login with an Office 365 account.
1. You should see a table listing the existing events in your Office 365 calendar.
1. You can view email in the inbox by browsing to http://127.0.0.1:8000/mail.

## Copyright ##

Copyright (c) Microsoft. All rights reserved.

----------
Connect with me on Twitter [@JasonJohMSFT](https://twitter.com/JasonJohMSFT)

Follow the [Exchange Dev Blog](http://blogs.msdn.com/b/exchangedev/)