Meteor.startup(function() {

    // Cron
    SyncedCron.start();

    // SMTP
    if (Meteor.settings.mailURL) {
        process.env.MAIL_URL = Meteor.settings.mailURL;
    }

    // Allow delete users
    Meteor.users.allow({
        remove: function() {
            return true;
        }
    });

    // Create admin
    Meteor.call('createUsers');

});
