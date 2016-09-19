Meteor.startup(function () {

  console.log(Meteor.absoluteUrl());

  // Cron
  SyncedCron.start();

  // SMTP
  process.env.MAIL_URL = Meteor.settings.mailURL;

  // Indexing
  Subscribers._ensureIndex({ "listId": 1, "email": 1});
  Scheduled._ensureIndex({ "listId": 1});

});
