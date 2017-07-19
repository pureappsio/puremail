Template.emailTemplate.events({

    'click .delete': function() {

        Meteor.call('removeTemplate', this._id);

    }

});
