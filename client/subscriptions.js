// Tracker
Tracker.autorun(function() {
    Meteor.subscribe('userData');
    Meteor.subscribe('userSubscribers');
    Meteor.subscribe('userLists');
    Meteor.subscribe('userSegments');
    Meteor.subscribe('userInterests');
    Meteor.subscribe('userConditions');
    Meteor.subscribe('userAutomations');
    Meteor.subscribe('userBroadcasts');
    Meteor.subscribe('userScheduled');
    Meteor.subscribe('userSequences');
    Meteor.subscribe('userOffers');
    Meteor.subscribe('userProducts');
    Meteor.subscribe('userGumroad');
    Meteor.subscribe('userIntegrations');
    Meteor.subscribe('userConditionalEmails');
    Meteor.subscribe('userStats');
});
