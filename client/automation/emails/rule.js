Template.rule.events({

  'click .delete-rule': function (event, template) {

    Meteor.call('deleteRule', template.data._id);

  },
  'click .plus': function (event, template) {

    Meteor.call('changeEmailOrder', template.data, 1);

  },
  'click .minus': function (event, template) {

    Meteor.call('changeEmailOrder', template.data, -1);

  }

});

Template.rule.helpers({

  isConditional: function() {
    if (this.conditions) {
      return 'c';
    }
  },
  sequenceName: function() {
    return Sequences.findOne(this.sequenceId).name;
  },
  generateDescription: function() {

    var description = "";
    if (this.triggers) {

      for (i = 0; i < this.triggers.length; i++) {

        trigger = this.triggers[i];

        if (trigger.criteria == 'subscribed') {
          list = Lists.findOne(trigger.option);
          description += 'For people who subscribed to ' + list.name;
        }
        if (trigger.criteria == 'interest') {
          description += ' and are interested in ' + trigger.option;
        }
        if (trigger.criteria == 'origin') {
          description += ' and are coming from ' + trigger.option;
        }

      }
    }
    return description;

  }

});
