Template.registerHelper("isAdmin", function() {

    if (Meteor.user()) {

        if (Meteor.user().role == 'admin') {
            return true;
        }
    }

});

Template.registerHelper("isAppUser", function() {

    if (Meteor.user()) {

        if (Meteor.user().role == 'appuser' || Meteor.user().role == 'admin') {
            return true;
        }
    }

});
