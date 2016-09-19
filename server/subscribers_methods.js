// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

// Methods
Meteor.methods({

  removeSubscriber: function(email, listId) {

    // Remove all from list
    console.log('Deleting subscriber with email: ' + email + 'in list: ' + listId);
    Subscribers.remove({email: email, listId: listId});

  },
  removeSubscribersList: function(listId) {

    // Remove all from list
    Subscribers.remove({listId: listId});

  },
  addManualSubscriber: function(email, subscriberInterests, listId) {

    // Build object
    var subscriber = {
      email: email,
      listId: listId,
      ownerId: Meteor.user()._id,
      origin: 'blog',
      last_updated: new Date(),
      date_added: new Date()
    }

    // Insert interests
    var interests = [];
    for (i = 0; i < subscriberInterests.length; i++) {

      // Find interests ID
      var interest = Interests.findOne({name: subscriberInterests[i], ownerId: Meteor.user()._id});
      interests.push(interest);

    }
    console.log(interests);
    subscriber.interests = interests;

    // Add
    Subscribers.insert(subscriber);

  },
  refreshSubscribers: function(customers, integration) {

    console.log(integration);

    // Refresh Subscribers
    for (var i = 0; i < customers.length; i++) {

      // Check if already in list
      var criterias = {email: customers[i].email, ownerId: integration.ownerId, listId: integration.list};
      var isSubscriber = Subscribers.findOne(criterias);

      if (isSubscriber) {
        console.log('Refreshing subscriber');
        subscriber = Subscribers.findOne(criterias);

        // Update subscriber
        Subscribers.update(subscriber._id, {$set: {"ltv": customers[i].ltv}});
        Subscribers.update(subscriber._id, {$set: {"products": customers[i].products}});
        Subscribers.update(subscriber._id, {$set: {"nb_products": customers[i].nb_products}});

        // Not in sequence ?
        if (subscriber.sequenceId == null) {

          // Check if there is a new subscriber sequence
          if (Sequences.findOne({listId: integration.list, trigger: 'customers'})) {

            // Get sequence
            var newSequence = Sequences.findOne({listId: integration.list, trigger: 'customers'});

            // Get email
            var newEmail = Automations.findOne({sequenceId: newSequence._id, order: 1});

            // Add to scheduler
            var user = Meteor.users.findOne(integration.ownerId);
            Meteor.call('addAutomationEmail', newEmail, subscriber, integration.list, user);

            // Update subscriber
            Subscribers.update(subscriber._id, {$set: {"sequenceEmail": newEmail._id } });
            Subscribers.update(subscriber._id, {$set: {"sequenceId": newSequence._id } });

          }

        }

      }
      else {

        // Add new subscriber & customer
        console.log('New subscriber');
        customers[i].last_updated = new Date();
        customers[i].listId = integration.list;
        customers[i].ownerId = integration.ownerId;
        var subscriberId = Subscribers.insert(customers[i]);

        // Check if there is a new subscriber sequence
        if (Sequences.findOne({listId: integration.list, trigger: 'customers'})) {

          // Get sequence
          var newSequence = Sequences.findOne({listId: integration.list, trigger: 'customers'});

          // Get email
          var newEmail = Automations.findOne({sequenceId: newSequence._id, order: 1});

          // Add to scheduler
          var subscriber = Subscribers.findOne(subscriberId);
          var user = Meteor.users.findOne(integration.ownerId);
          Meteor.call('addAutomationEmail', newEmail, subscriber, integration.list, user);

          // Update subscriber
          Subscribers.update(subscriber._id, {$set: {"sequenceEmail": newEmail._id } });
          Subscribers.update(subscriber._id, {$set: {"sequenceId": newSequence._id } });

        }

      }

    }

  },
  updateSubscriberInterests: function(subscriber, interests) {

    // Current interests
    if (subscriber.interests) {
      currentInterests = subscriber.interests;

      // Add new interests
      for (j = 0; j < interests.length; j++) {
        var interestPresent = false;
        for (l = 0; l < currentInterests.length; l++) {
          if(interests[j].name == currentInterests[l].name) {interestPresent = true;}
        }
        if (!interestPresent) {currentInterests.push(interests[j]);}
      }
    }
    else {
      currentInterests = interests;
    }

    // Return
    subscriber.interests = currentInterests;
    return subscriber;

  },
  confirmSubscriber: function(subscriberId) {

    // Check if subscriber exists
    var subscriber = Subscribers.findOne(subscriberId);

    if (subscriber) {

      // Update
      console.log('Confirming subscriber: ');
      console.log(subscriber);
      Subscribers.update(subscriberId, {$set: {"confirmed": true}});

      // Get data
      var user = Meteor.users.findOne(subscriber.ownerId);
      var list = Lists.findOne(subscriber.listId);

      console.log('List: ');
      console.log(list);

      // Send notifications
      parameters = {
        token: Meteor.settings.pushoverToken,
        user: Meteor.settings.pushoverUser,
        message: 'New subscriber to the ' + list.name + ' email list'
      };
      HTTP.post('https://api.pushover.net/1/messages.json', {params: parameters});

      // Assign subscriber in sequence
      if (subscriber.sequenceId) {

        // Get first email of sequence
        var firstEmail = Automations.findOne({sequenceId: subscriber.sequenceId, order: 1});

        // Set email
        Subscribers.update(subscriber._id, {$set: {"sequenceEmail": firstEmail._id } });

        // Add email to scheduler
        Meteor.call('addAutomationEmail', firstEmail, subscriber, list, user);

      }

    }
  },
  addAutomationEmail: function(rule, subscriber, list, user) {

    // Calculate date
    var currentDate = new Date();
    currentDate = currentDate.getTime();

    if (rule.period == 'minutes') {
      currentDate += rule.time * 1000 * 60;
    }
    if (rule.period == 'hours') {
      currentDate += rule.time * 1000 * 60 * 60;
    }
    if (rule.period == 'days') {
      currentDate += rule.time * 1000 * 60 * 60 * 24;
    }

    var entryDate = new Date(currentDate);

    // Create new entry for scheduler
    var entry = {
      name: list.userName,
      ownerId: user._id,
      listId: subscriber.listId,
      date: entryDate,
      to: subscriber.email,
      from: list.userName + ' <' + list.brandEmail +'>',
      subject: rule.emailSubject,
      text: rule.emailText,
      ruleId: rule._id
    }

    // Sequence?
    if (rule.sequenceId) {
      entry.sequenceId = rule.sequenceId;
      entry.sequenceEmail = rule.order;
    }

    // Insert
    Scheduled.insert(entry);

  },
  addSubscriber: function(data) {

    console.log(data);

    // New subscriber
    subscriber = {
      email: data.email
    }

    // Get list & user
    var list = Lists.findOne({_id: data.list});
    var user = Meteor.users.findOne({_id: list.ownerId});

    // Process data
    if (data.interests) {

      // Check if array
      if (!(Array.isArray(data.interests))) {
        var newInterests = [];
        newInterests.push(data.interests);
        data.interests = newInterests;
      }

      // Insert interests
      var interests = [];
      for (i = 0; i < data.interests.length; i++) {
        // Find interests ID
        var interest = Interests.findOne({name: data.interests[i], ownerId: user._id});
        interests.push(interest);
      }
      subscriber.interests = interests;
    }

    if (data.origin) {
      subscriber.origin = data.origin;
    }

    if (data.sequence) {
      subscriber.sequenceId = data.sequence;
    }

    // if (data.product) {
    //   subscriber.products = [data.product];
    // }

    // Set dates
    subscriber.last_updated = new Date();
    subscriber.date_added = new Date();

    // Set list/owner
    subscriber.listId = data.list;
    subscriber.ownerId = user._id;

    // Check if already in list
    var isSubscriber = Subscribers.findOne({email: data.email, listId: data.list, ownerId: user._id});

    if (isSubscriber) {

      console.log('Updating subscriber');

      // Fuse interests
      if (subscriber.interests) {

        // Get all interests
        var previousInterests = Subscribers.findOne(isSubscriber._id).interests;
        var newInterests = subscriber.interests;

        // Combine
        var interests = newInterests;

        for (p = 0; p < previousInterests.length; p++) {
          var matchInterest = false;
          for (n = 0; n < newInterests.length; n++) {

            if (previousInterests[p]._id == newInterests[n]._id) {
              matchInterest = true;
            }

          }
          if (!matchInterest) {
            interests.push(previousInterests[p]);
          }
        }

        // Update
        Subscribers.update(isSubscriber._id, {$set: {"interests": interests} });
      }

      // Origin and date
      if (subscriber.origin) {
        Subscribers.update(isSubscriber._id, {$set: {"origin": subscriber.origin } });
      }
      Subscribers.update(isSubscriber._id, {$set: {"last_updated": new Date() } });

      // Assign to new sequence ?
      if (isSubscriber.sequenceId == null) {

        // Check for sequence for existing subscriber
        var sequences = Sequences.find({listId: isSubscriber.listId, trigger: 'subscribers'}).fetch();
        var sequenceMatch = false;

        for (i = 0; i < subscriber.interests.length; i++) {

          for (s = 0; s < sequences.length; s++) {

            if (sequences[s].interest == subscriber.interests[i].name) {

              // Match sequence
              sequenceMatch = true;
              sequenceIndex = s;

            }

          }

        }

        // If we found a sequence
        if (sequenceMatch) {

          // Get sequence
          var sequence = sequences[sequenceIndex];

          // Assign to user
          Subscribers.update(isSubscriber._id, {$set: {"sequenceId": sequence._id } });

          // Get first email
          var branchEmail = Automations.findOne({sequenceId: sequence._id, order: 1});

          // Assign email
          Subscribers.update(isSubscriber._id, {$set: {"sequenceEmail": branchEmail._id } });

          // Add to scheduler
          Meteor.call('addAutomationEmail', branchEmail, isSubscriber, list, user);

        }

      }

      return isSubscriber._id;

    }
    else {

      // Set not confirmed
      subscriber.confirmed = false;
      console.log('New subscriber: ');
      console.log(subscriber);

      // Insert
      var subscriberId = Subscribers.insert(subscriber);

      if (data.confirmed) {

        console.log('Skipping confirmation email');

      }

      else {

        // Send confirmation email
        SSR.compileTemplate('confirmationEmail', Assets.getText('confirmation_email.html'));

        if (process.env.ROOT_URL == "http://localhost:3000/") {
          host = process.env.ROOT_URL;
        }
        else {
          host = "http://" + Meteor.settings.hostURL + "/";
        }

        // Set name & brand
        name = list.userName;
        brand = list.brandName;
        if (name == brand) {
          brand = '';
        }

        // Build mail
        var helper = sendgridModule.mail;
        from_email = new helper.Email(list.brandEmail);
        to_email = new helper.Email(subscriber.email);
        subject = "Confirm your subscription to " + list.brandName;
        content = new helper.Content("text/html", SSR.render("confirmationEmail", {host: host, name: name, brand: brand, subscriberId: subscriberId}));
        mail = new helper.Mail(from_email, subject, to_email, content);
        mail.from_email.name = list.userName;

        // Send
        var requestBody = mail.toJSON();
        var request = sendgrid.emptyRequest();
        request.method = 'POST';
        request.path = '/v3/mail/send';
        request.body = requestBody;
        sendgrid.API(request, function (err, response) {
          if (response.statusCode != 202) {
            console.log(response.body);
          }
        });

      }

      // Return ID
      return subscriberId;
    }

  },
  deleteSubscriber: function(id) {

    // Delete
    Subscribers.remove(id);
  },
  importSubscriber: function(data) {

    // New subscriber
    subscriber = {
      email: data.email
    }

    // Get list & user
    var list = Lists.findOne({_id: data.list});
    var user = Meteor.users.findOne({_id: list.ownerId});

    // Process data
    if (data.interests) {

      // Check if array
      if (!(Array.isArray(data.interests))) {
        var newInterests = [];
        newInterests.push(data.interests);
        data.interests = newInterests;
      }

      // Insert interests
      var interests = [];
      for (i = 0; i < data.interests.length; i++) {
        // Find interests ID
        var interest = Interests.findOne({name: data.interests[i], ownerId: user._id});
        interests.push(interest);
      }
      subscriber.interests = interests;
    }
    if (data.origin) {
      subscriber.origin = data.origin;
    }
    if (data.nb_products) {
      subscriber.nb_products = data.nb_products;
    }
    if (data.products) {
      products = [];
      for (p = 0; p < data.products.length; p++) {
        products.push({"name": data.products[p]});
      }
      subscriber.products = products;
    }

    // Set dates
    subscriber.last_updated = new Date();
    subscriber.date_added = new Date();

    // Set list/owner
    subscriber.listId = data.list;
    subscriber.ownerId = user._id;

    // Check if already in list
    var isSubscriber = Subscribers.find({email: data.email, listId: data.list, ownerId: user._id}).fetch();

    if (isSubscriber.length > 0) {

      console.log('Updating subscriber');
      console.log(subscriber);

      if (subscriber.interests) {
        Subscribers.update({email: data.email, listId: data.list, ownerId: user._id}, {$set: {"interests": subscriber.interests} });
      }
      if (subscriber.nb_products) {
        Subscribers.update({email: data.email, listId: data.list, ownerId: user._id}, {$set: {"nb_products": subscriber.nb_products} });
      }
      if (subscriber.products) {
        Subscribers.update({email: data.email, listId: data.list, ownerId: user._id}, {$set: {"products": subscriber.products} });
      }
      if (subscriber.origin) {
        Subscribers.update({email: data.email, listId: data.list, ownerId: user._id}, {$set: {"origin": subscriber.origin } });
      }
      // Subscribers.update({email: data.email, listId: data.list, ownerId: user._id}, {$set: {"last_updated": new Date() } });
    }
    else {

      // Set confirmed
      subscriber.confirmed = true;
      console.log('Imported subscriber: ');
      console.log(subscriber);

      // Insert
      var subscriberId = Subscribers.insert(subscriber);

    }

  },
  wakeUpDyingLeads: function() {

    // Get  all users
    var users = Meteor.users.find({}).fetch();

    // Go through all users
    for (u = 0; u < users.length; u++) {

      // Get all lists from user
      var lists = Lists.find({ownerId: users[u]._id}).fetch();

      // Go through all lists
      for (l = 0; l < lists.length; l++) {

        // Check if list has a wake up sequence
        if (Sequences.findOne({listId: lists[l]._id, trigger: "dying"})) {

          // Get sequence
          var sequence = Sequences.findOne({listId: lists[l]._id, trigger: "dying"})

          // Get email
          var newEmail = Automations.findOne({sequenceId: sequence._id, order: 1});

          // Find all subscribers for this list
          var subscribers = Subscribers.find({listId: lists[l]._id}).fetch();

          // Find all subscribers that are inactive
          for (s = 0; s < subscribers.length; s++) {

            // Check if subscriber is inactive
            if (Meteor.call('isInactive', subscribers[s])) {

              // Assign the wake up sequence
              Subscribers.update(subscribers[s]._id, {$set: {"sequenceEmail": newEmail._id } });
              Subscribers.update(subscribers[s]._id, {$set: {"sequenceId": sequence._id } });

              // Send first email
              Meteor.call('addAutomationEmail', newEmail, subscribers[s], lists[l], users[u]);

            }

          }

        }

      }

    }


  },
  isInactive: function(subscriber) {

    var inactive = false;
    var timeDelay = 60 * 24 * 60 * 60 * 1000; // 60 days

    if (subscriber.sequenceId == null) {

      // Check creation date
      var today = new Date();
      var last_updated = subscriber.last_updated;
      var difference = today.getTime() - last_updated.getTime();

      if (difference > timeDelay) {

        if (subscriber.lastOpen && subscriber.lastClick) {

          // Check last click or last open date
          var today = new Date();
          var last_click = subscriber.lastOpen;
          var last_open = subscriber.lastClick;
          var differenceClick = today.getTime() - last_updated.getTime();
          var differenceOpen = today.getTime() - last_updated.getTime();

          if ((differenceClick > timeDelay) || (differenceOpen > timeDelay)) {

            // Set inactive
            inactive = true;

          }

        }

      }

    }

    return inactive;

  }

});

function cleanArray(array) {
  var i, j, len = array.length, out = [], obj = {};
  for (i = 0; i < len; i++) {
    obj[array[i]] = 0;
  }
  for (j in obj) {
    out.push(j);
  }
  return out;
}
