// Methods
Meteor.methods({

    saveTemplate: function(template) {

        console.log(template);

        EmailTemplates.insert(template);

    },
    removeTemplate: function(templateId) {

        EmailTemplates.remove(templateId);

    }

});
