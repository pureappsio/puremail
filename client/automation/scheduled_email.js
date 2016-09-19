Template.scheduledEmail.events({

  'click .scheduled-delete': function (event, template) {

    Meteor.call('deleteScheduled', template.data._id);

  }

});

Template.scheduledEmail.helpers({

  getListName: function() {
    list = Lists.findOne(this.listId);
    return list.name;
  },
  getEmailName: function() {
    if (Automations.findOne({sequenceId: this.sequenceId, order: this.sequenceEmail})) {
      return Automations.findOne({sequenceId: this.sequenceId, order: this.sequenceEmail}).emailName;
    }
    else {
      return this.subject;
    }
  },
  getSequenceName: function() {
    if (Sequences.findOne(this.sequenceId)) {
      return Sequences.findOne(this.sequenceId).name;
    }
    else {
      return 'Broadcast';
    }
  },
  getTo: function() {
    if (this.to) {
      return this.to;
    }
    else {
      return 'Broadcast with ' + this.recipients + ' emails';
    }
  },
  scheduledDate: function() {
    return moment(this.date).fromNow();
  }

});
