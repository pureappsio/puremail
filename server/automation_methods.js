// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

var cheerio = Npm.require("cheerio");

Meteor.methods({

    deleteCondition: function(conditionId) {

        Conditions.remove(conditionId);

    },
    addCondition: function(condition) {

        console.log(condition);

        Conditions.insert(condition);

    },
    updateConditionalEmail: function(email) {

        // Edit 
        ConditionalEmails.update(email._id, { $set: email });

    },
    saveConditionalEmail: function(email) {

        // Save 
        console.log(email);
        ConditionalEmails.insert(email);

    },
    deleteConditionalEmail: function(emailId) {

        ConditionalEmails.remove(emailId);

    },
    changeEmailOrder: function(email, orderChange) {

        // Change by default
        changeOrder = true;

        // Get all emails from sequence
        var emails = Automations.find({ sequenceId: email.sequenceId }).fetch();

        // Get max order
        var maxOrder = 1;
        for (i = 0; i < emails.length; i++) {
            maxOrder = Math.max(maxOrder, emails[i].order);
        }

        // Cases when no action is done
        if (email.order == 1 && orderChange == -1) {
            changeOrder = false;
        }
        if (email.order == maxOrder && orderChange == 1) {
            changeOrder = false;
        }

        // Do change
        if (changeOrder) {

            if (orderChange == 1) {

                // Get ID of email to change
                otherEmail = Automations.findOne({
                    sequenceId: email.sequenceId,
                    order: (email.order + 1)
                });

                // Change order of current email
                Automations.update(email._id, { $inc: { order: 1 } })

                // Change order of other emails
                Automations.update(otherEmail._id, { $inc: { order: -1 } });

            }

            if (orderChange == -1) {

                // Get ID of email to change
                otherEmail = Automations.findOne({
                    sequenceId: email.sequenceId,
                    order: (email.order - 1)
                });

                // Change order of current email
                Automations.update(email._id, { $inc: { order: -1 } })

                // Change order of other emails
                Automations.update(otherEmail._id, { $inc: { order: 1 } });

            }

        }

    },
    deleteScheduled: function(id) {

        // Remove rule
        Scheduled.remove(id);

    },
    clearScheduled: function() {

        // Remove all
        Scheduled.remove({ ownerId: Meteor.user()._id });

    },
    addConditionalEmail: function(newEmail, subscriber) {

        console.log('Conditional email, checking if branching');

        // Get data
        var list = Lists.findOne(subscriber.listId);
        var user = Meteor.users.findOne(subscriber.ownerId);

        // Don't branch by default
        var branchToSequence = false;

        // Conditions
        conditions = Conditions.find({emailId: newEmail._id}).fetch();
        console.log('Conditions: ');
        console.log(conditions);

        // Check if we branch
        for (c = 0; c < conditions.length; c++) {

            if (conditions[c].criteria == 'bought') {

                var purchasedProducts = Meteor.call('getPurchasedProducts', subscriber);

                if (purchasedProducts.length > 0) {
                    for (p = 0; p < purchasedProducts.length; p++) {
                        if (purchasedProducts[p] == conditions[c].parameter) {
                            branchToSequence = true;
                        }
                    }
                }

            }

            if (conditions[c].criteria == 'notbought') {

                branchToSequence = true;

                var purchasedProducts = Meteor.call('getPurchasedProducts', subscriber);

                if (purchasedProducts.length > 0) {

                    for (p = 0; p < purchasedProducts.length; p++) {
                        if (purchasedProducts[p] == conditions[c].parameter) {
                            branchToSequence = false;
                        }
                    }
                }

            }

        }

        // Apply conditions
        if (branchToSequence) {

            console.log('Branching to other sequence');

            if (newEmail.branchDestination == 'end') {

                console.log('Ending there');

                // Update subscriber with no sequence
                Subscribers.update(subscriber._id, { $set: { "sequenceEmail": null } });
                Subscribers.update(subscriber._id, { $set: { "sequenceId": null } });

            } else {

                // Get new sequence
                var branchSequence = Sequences.findOne(newEmail.branchDestination);

                // Get email
                var branchEmail = Automations.findOne({ sequenceId: branchSequence._id, order: 1 });

                // Add to scheduler
                Meteor.call('addAutomationEmail', branchEmail, subscriber, list, user);

                // Update subscriber
                Subscribers.update(subscriber._id, { $set: { "sequenceEmail": branchEmail._id } });
                Subscribers.update(subscriber._id, { $set: { "sequenceId": branchSequence._id } });

            }

        } else {

            console.log('Do not branch, going to next in sequence');

            // Add to scheduler
            Meteor.call('addAutomationEmail', newEmail, subscriber, list, user);

            // Update subscriber
            Subscribers.update(subscriber._id, { $set: { "sequenceEmail": newEmail._id } });

        }

    },
    moveToNextSequence: function(scheduled) {

        var sequence = Sequences.findOne(scheduled.sequenceId);

        // Get data
        var list = Lists.findOne(scheduled.listId);
        var subscriber = Subscribers.findOne({ listId: scheduled.listId, email: scheduled.to });
        var user = Meteor.users.findOne(scheduled.ownerId);

        // Check if simple destination or branch
        if (sequence.destination.action) {

            console.log('Simple move to next sequence');

            // Simple destination
            Meteor.call('branchSequence', sequence.destination, subscriber, list, user);

        } else {

            console.log('Branching to other sequence based on subscriber');

            // Branching
            var destinations = sequence.destination;

            // console.log('Destinations: ');
            // console.log(destinations);

            // Match subscriber with destination
            var matchIndex = -1;
            for (d = 0; d < destinations.length; d++) {

                if (destinations[d].criteria == 'interested') {

                    console.log('Checking interests');

                    for (k = 0; k < subscriber.tags.length; k++) {

                        if (subscriber.tags[k] == destinations[d].parameter) {
                            matchIndex = d;
                            break;
                        }
                        if (matchIndex != -1) {
                            break;
                        }
                    }

                }

                if (destinations[d].criteria == 'are') {

                    console.log('Checking status');
                    console.log(subscriber.status);

                    if (destinations[d].parameter == subscriber.status) {
                        matchIndex = d;
                    }

                }
                if (matchIndex != -1) {
                    break;
                }
            }

            // Apply action
            if (matchIndex == -1) {

                console.log('No next sequence found, stopping there');

                // Update subscriber with no sequence
                Subscribers.update(subscriber._id, { $set: { "sequenceEmail": null } });
                Subscribers.update(subscriber._id, { $set: { "sequenceId": null } });

            } else {

                console.log('Branching to: ');
                console.log(destinations[matchIndex]);

                // Apply branching
                Meteor.call('branchSequence', destinations[matchIndex], subscriber, list, user);

            }

        }

    },
    addNextAutomationEmail: function(scheduled) {

        console.log('Adding new automation email');
        // console.log(scheduled);

        // Get data
        var list = Lists.findOne(scheduled.listId);
        var subscriber = Subscribers.findOne({ listId: scheduled.listId, email: scheduled.to });
        var user = Meteor.users.findOne(scheduled.ownerId);

        // Move to next order in sequence
        order = scheduled.sequenceEmail + 1;

        // Check if next email is in sequence
        if (Automations.findOne({ sequenceId: scheduled.sequenceId, order: order })) {

            // Get email
            var newEmail = Automations.findOne({ sequenceId: scheduled.sequenceId, order: order });

            // Conditional email ?
            if (Conditions.findOne({emailId: newEmail._id})) {

                // Plan conditional email
                Meteor.call('addConditionalEmail', newEmail, subscriber);

            } else {

                console.log('Normal email, going to next email');
                // console.log(newEmail);

                // Add to scheduler
                Meteor.call('addAutomationEmail', newEmail, subscriber, list, user);

                // Update subscriber
                Subscribers.update(subscriber._id, { $set: { "sequenceEmail": newEmail._id } });

            }

        } else {

            // Move to next sequence
            Meteor.call('moveToNextSequence', scheduled);
        }

    },
    sendAutomationEmail: function(scheduled) {

        var subscriber = Subscribers.findOne({ listId: scheduled.listId, email: scheduled.to, ownerId: scheduled.ownerId });

        // console.log('Subscriber: ')
        // console.log(subscriber);

        if (subscriber) {

            var list = Lists.findOne(scheduled.listId);

            // console.log('List: ')
            // console.log(list);

            // Compile
            SSR.compileTemplate('automationEmail', Assets.getText('automation_email.html'));

            // Get host
            host = Meteor.absoluteUrl();

            // Add unsubscribe data
            if (list.language) {
                if (list.language == 'en') {
                    unsubscribeText = "Unsubscribe";
                }
                if (list.language == 'fr') {
                    unsubscribeText = "Se désinscrire";
                }
            } else {
                unsubscribeText = "Unsubscribe";
            }
            scheduled.text += "<p><a style='color: gray;' href='" + host + "unsubscribe?s=" + subscriber._id + "'>" + unsubscribeText + "</a></p>";

            // Send
            parameters = {
                host: host,
                name: list.userName,
                brand: list.brandName,
                subscriberId: subscriber._id,
                text: scheduled.text
            };

            if (Meteor.call('validateEmail', scheduled.to)) {

                console.log('Sending email to ' + scheduled.to + ' of list ' + list.name);

                // Check if subscriber has offers
                if (Offers.findOne({ subscriberId: subscriber._id })) {

                    // Load raw HTML
                    $ = cheerio.load(scheduled.text);

                    // Process links
                    $('a').each(function(i, elem) {
                        // Check if it's not the unsubscribe link
                        if (($(elem)[0].attribs.href).indexOf('unsubscribe') == -1) {
                            $(elem)[0].attribs.href += '?subscriber=' + subscriber._id;
                        }
                    });

                    scheduled.text = $.html();

                }

                // Build mail
                var helper = sendgridModule.mail;
                from_email = new helper.Email(list.brandEmail);
                to_email = new helper.Email(scheduled.to);
                subject = scheduled.subject;
                content = new helper.Content("text/html", scheduled.text);
                mail = new helper.Mail(from_email, subject, to_email, content);

                mail.from_email.name = list.userName;

                // Arguments
                custom_arg = new helper.CustomArgs("subscriberId", subscriber._id)
                mail.addCustomArg(custom_arg);

                if (scheduled.ruleId) {
                    custom_arg = new helper.CustomArgs("ruleId", scheduled.ruleId);
                    mail.addCustomArg(custom_arg);
                }
                if (scheduled.sequenceId) {
                    custom_arg = new helper.CustomArgs("sequenceId", scheduled.sequenceId);
                    mail.addCustomArg(custom_arg);
                }
                if (scheduled.broadcastId) {
                    custom_arg = new helper.CustomArgs("broadcastId", scheduled.broadcastId);
                    mail.addCustomArg(custom_arg);
                }

                // Add Google Analytics data
                // tracking_settings = new helper.TrackingSettings()
                // if (subscriber.origin) {
                //     if (subscriber.origin == 'landing') {
                //         source = "facebook";
                //     }
                //     if (subscriber.origin == 'blog') {
                //         source = "blog";
                //     }
                // } else {
                //     source = "blog";
                // }
                // ganalytics = new helper.Ganalytics(true, source, "email");
                // tracking_settings.setGanalytics(ganalytics)
                // mail.addTrackingSettings(tracking_settings)

                // Send
                var requestBody = mail.toJSON()
                    // console.log(requestBody);
                var request = sendgrid.emptyRequest()
                request.method = 'POST'
                request.path = '/v3/mail/send'
                request.body = requestBody

                // Send
                if (Meteor.settings.mode != 'demo') {
                    sendgrid.API(request, function(err, response) {
                        if (response.statusCode != 202) {
                            console.log('Automation email sent!');
                        }
                    });
                }

                // Remove
                Scheduled.remove(scheduled._id);

                // Add next email in sequence for automation emails
                if (scheduled.sequenceEmail && scheduled.sequenceId) {

                    Meteor.call('addNextAutomationEmail', scheduled);
                }

            } else {
                console.log('Invalid email');

                // Remove
                Scheduled.remove(scheduled._id);

            }

        } else {

            // Remove because subscriber doesn't exist
            console.log('Subscriber does not exist, deleting email');
            Scheduled.remove(scheduled._id);

        }

    },
    branchSequence: function(destination, subscriber, list, user) {

        if (destination.action == 'go') {

            // Get new sequence
            var newSequence = Sequences.findOne(destination.destination);

            // Get email
            var newEmail = Automations.findOne({ sequenceId: newSequence._id, order: 1 });

            // Add to scheduler
            Meteor.call('addAutomationEmail', newEmail, subscriber, list, user);

            // Update subscriber
            Subscribers.update(subscriber._id, { $set: { "sequenceEmail": newEmail._id } });
            Subscribers.update(subscriber._id, { $set: { "sequenceId": newSequence._id } });

        }
        if (destination.action == 'end') {

            // Update subscriber with no sequence
            Subscribers.update(subscriber._id, { $set: { "sequenceEmail": null } });
            Subscribers.update(subscriber._id, { $set: { "sequenceId": null } });

        }

    },
    deleteRule: function(id) {

        // Remove rule
        Automations.remove(id);

    },
    updateRule: function(email) {

        // Update rule
        console.log(email);
        Automations.update(email._id, { $set: email });

    },
    saveRule: function(rule) {

        // Save rule
        Automations.insert(rule);

    },
    processPing: function(data) {

        console.log(data);

        // Find user
        var user = Meteor.users.findOne({ "services.gumroad.id": data.seller_id });
        //console.log(user);

        // Existing customer ?
        var customers = Customers.find({ email: data.email }).fetch();

        if (customers.length == 0) {
            console.log('New customer');
        } else {
            console.log('Customer exists');
        }

        // Call automation rules
        var rules = Automations.find({ owner: user._id }).fetch();

        for (j = 0; j < rules.length; j++) {

            if (rules[j].criteria == 'bought' && rules[j].product == 'any') {

                // Calculate date
                var currentDate = new Date();
                currentDate = currentDate.getTime();

                if (rules[j].period == 'minutes') {
                    currentDate += rules[j].time * 1000 * 60;
                }
                if (rules[j].period == 'hours') {
                    currentDate += rules[j].time * 1000 * 60 * 60;
                }
                if (rules[j].period == 'days') {
                    currentDate += rules[j].time * 1000 * 60 * 60 * 24;
                }

                var entryDate = new Date(currentDate);

                // Create new entry in scheduler
                var entry = {
                    name: user.services.gumroad.userName,
                    owner: rules[j].owner,
                    date: entryDate,
                    to: data.email,
                    from: user.profile.userName + ' <' + user.profile.brandEmail + '>',
                    subject: rules[r].emailSubject,
                    text: rules[r].emailText
                }

                Scheduled.insert(entry);

            }

        }

    },
    simulateSale: function() {

        // Prepare data
        var parameters = {
            sale_id: "3hesog",
            order_number: "3498d9gdf",
            seller_id: "bHzYIhOXnA6MCharDa7_QA==",
            product_id: "35435345",
            product_permalink: "http://someproduct.co",
            email: "fernando-godoy12@hotmail.com",
            full_name: "John Smith",
            purchaser_id: "35fgdg3",
            price: 2900
        };

        // Make request
        HTTP.post('http://localhost:3000/ping', { data: parameters });

    },
    validateEmail: function(email) {
        var re = /\S+@\S+\.\S+/;
        var result = re.test(email);
        return result;
    }

});
