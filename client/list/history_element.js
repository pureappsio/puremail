Template.historyElement.helpers({

  ruleName: function() {
    return Automations.findOne(this.ruleId).emailName;
  },
  sequenceName: function() {
    return Sequences.findOne(this.sequenceId).name;
  },
  sentDate: function() {
    return moment(this.date).fromNow();
  }

});