Meteor.startup(function () {

  // Cron
  SyncedCron.start();

  // SMTP
  if (Meteor.settings.mailURL) {
  	process.env.MAIL_URL = Meteor.settings.mailURL;
  }
  
});
