// Tracker
Tracker.autorun(function() {
    Meteor.subscribe('userData');
    Meteor.subscribe('allUsers');
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
    Meteor.subscribe('userNetworks');
    Meteor.subscribe('userIntegrations');
    Meteor.subscribe('userConditionalEmails');
    Meteor.subscribe('userStats');
    Meteor.subscribe('userTemplates');
});

// Imports
import 'bootstrap';
import '/node_modules/bootstrap/dist/css/bootstrap.min.css';

const Spinner = require('spin');
