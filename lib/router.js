Router.configure({
  layoutTemplate: 'layout'
});

// Main route
Router.route('/', function () {

  this.wait(Meteor.subscribe('userLists'));

  if (this.ready()) {
     this.render('lists');
   } else {
     this.render('loading');
   }
});

// Routes
Router.route('/lists', {
  name: 'lists',
  data: function() {

    this.wait(Meteor.subscribe('userLists'));

    if (this.ready()) {
       this.render('lists');
     } else {
       this.render('loading');
     }
  }

});

Router.route('/combineLists', {name: 'combineLists'});

Router.route('/generator', {name: 'generator'});
Router.route('/subscribeTest', {name: 'subscribeTest'});

Router.route('/settings', {name: 'settings'});

Router.route('/broadcast', {name: 'broadcast'});
Router.route('/addToSequence', {name: 'addToSequence'});
Router.route('/automation', {name: 'automation'});
Router.route('/scheduled', {name: 'scheduled'});

Router.route('/listsreport', {name: 'listsReport'});

Router.route('/usage', {
  name: 'usage',
  data: function() {

    this.wait(Meteor.subscribe('userLists'));
    this.wait(Meteor.subscribe('userSubscribers'));

    if (this.ready()) {
       this.render('usage');
     } else {
       this.render('loading');
     }
  }
});

Router.route('/analytics', {
  name: 'analytics',
  data: function() {

    this.wait(Meteor.subscribe('userLists'));
    this.wait(Meteor.subscribe('userSubscribers'));

    if (this.ready()) {
       this.render('analytics');
     } else {
       this.render('loading');
     }
  }
});

// List settings
Router.route('/lists/:_id', {
    name: 'list',
    data: function() { return Lists.findOne(this.params._id); }
});

// List subscribers
Router.route('/lists/:_id/subscribers', {
    name: 'listSubscribers',
    data: function() {

      // Get list
      var list = Lists.findOne(this.params._id);

      // Wait
      this.wait(Meteor.subscribe('userLists'));
      this.wait(Meteor.subscribe('userSubscribers', {listId: this.params._id}));

      // Render
      if (this.ready()) {
         this.render('listSubscribers', {data: list});
       } else {
         this.render('loading');
       }
    }
});

// List automation
Router.route('/lists/:_id/automation', {
    name: 'listAutomation',
    data: function() {

      // Get list
      var list = Lists.findOne(this.params._id);

      // Wait
      this.wait(Meteor.subscribe('userLists'));
      this.wait(Meteor.subscribe('userSubscribers', {listId: this.params._id}));
      this.wait(Meteor.subscribe('userAutomations'));

      // Render
      if (this.ready()) {
         this.render('automation', {data: list});
       } else {
         this.render('loading');
       }
    }
});

// List stats
Router.route('/lists/:_id/statistics', {
    name: 'listStatistics',
    data: function() {

      // Get list
      var list = Lists.findOne(this.params._id);

      // Wait
      this.wait(Meteor.subscribe('userLists'));
      this.wait(Meteor.subscribe('userSubscribers', {listId: this.params._id}));
      this.wait(Meteor.subscribe('userAutomations'));

      // Render
      if (this.ready()) {
         this.render('listStatistics', {data: list});
       } else {
         this.render('loading');
       }
    }
});

// Subscriber details
Router.route('/subscribers/:_id', {
    name: 'subscriberDetails',
    data: function() { return Subscribers.findOne(this.params._id); }
});

// List import
Router.route('/lists/:_id/import', {
    name: 'listImport',
    data: function() { return Lists.findOne(this.params._id); }
});

// Broadcast details
Router.route('/broadcasts/:_id', {
    name: 'broadcastData',
    data: function() { return Broadcasts.findOne(this.params._id); }
});

// Edit rule
Router.route('/rules/:_id', {
    name: 'editRule',
    data: function() { return Automations.findOne(this.params._id); }
});

// Edit sequence emails
Router.route('/sequences/emails/:_id', {
    name: 'editSequenceEmails',
    data: function() { return Sequences.findOne(this.params._id); }
});

// Edit sequence
Router.route('/sequences/edit/:_id', {
    name: 'editSequence',
    data: function() { return Sequences.findOne(this.params._id); }
});

// Edit sequence
Router.route('/sequences/:_id', {
    name: 'sequenceDetails',
    data: function() { return Sequences.findOne(this.params._id); }
});

Router.route( "/subscribe", { where: "server" } ).post( function() {

  // Get data
  var data = this.request.body;
  console.log(data);

  if (data.confirmed) {

    // Call function
    var subscriber = Meteor.call('addSubscriber', data);
    Meteor.call('confirmSubscriber', subscriber);

    // Get user for this subscriber
    var subscriber = Subscribers.findOne(subscriber);
    var list = Lists.findOne(subscriber.listId);

    // Get destination
    var destination;
    if (subscriber.sequenceId) {

      // Get destination
      var sequence = Sequences.findOne(subscriber.sequenceId);
      if (sequence && sequence.thankYou) {
        if (sequence.thankYou != "") {
          destination = sequence.thankYou;
        }
        else {
          destination = list.finalThankYou;
        }
      }
      else {
        destination = list.finalThankYou;
      }
    }
    else {
      destination = list.finalThankYou;
    }

    // Send response
    this.response.writeHead(302, {
      'Location': destination
    });
    this.response.end();

  }
  else {

    // Call function
    Meteor.call('addSubscriber', data);

    // Get list for this subscriber
    var list = Lists.findOne(data.list);

    // Send response
    this.response.writeHead(302, {
      'Location': list.signUpThankYou
    });
    this.response.end();

  }

});

Router.route( "/confirm", { where: "server" } ).get( function() {

  // Get data
  var subscriberId = this.params.query.s;

  // Call function
  Meteor.defer(function () {
    Meteor.call('confirmSubscriber', subscriberId);
  });

  // Get user for this subscriber
  var subscriber = Subscribers.findOne(subscriberId);
  var list = Lists.findOne(subscriber.listId);

  // Get destination
  var destination;
  if (subscriber.sequenceId) {

    // Get destination
    var sequence = Sequences.findOne(subscriber.sequenceId);
    if (sequence && sequence.thankYou) {
      if (sequence.thankYou != "") {
        destination = sequence.thankYou;
      }
      else {
        destination = list.finalThankYou;
      }
    }
    else {
      destination = list.finalThankYou;
    }
  }
  else {
    destination = list.finalThankYou;
  }

  // Send response
  this.response.writeHead(302, {
    'Location': destination
  });
  this.response.end();

});

Router.route( "/unsubscribe", { where: "server" } ).get( function() {

  // Get data
  var subscriber = this.params.query.s;

  // Get user for this subscriber
  var subscriber = Subscribers.findOne(subscriber);
  var list = Lists.findOne(subscriber.listId);

  // Call function
  Meteor.call('deleteSubscriber', subscriber);

  // Send response
  this.response.writeHead(302, {
    'Location': list.unsubscribe
  });
  this.response.end();

});

Router.route( "/api/subscribe", { where: "server" } ).post( function() {

  // Get data
  var data = this.request.body;
  // console.log(data);

  // Call function
  if (data.email) {
    Meteor.call('importSubscriber', data);
  }

  // Send response
  json = {
    imported: true
  };
  this.response.setHeader('Content-Type', 'application/json');
  this.response.end(JSON.stringify(json));

});

Router.route( "/api/products", { where: "server" } ).post( function() {

  // Get data
  var data = this.request.body;
  // console.log(data);

  // Call function
  Meteor.call('importProducts', data);

  // Send response
  json = {
    imported: true
  };
  this.response.setHeader('Content-Type', 'application/json');
  this.response.end(JSON.stringify(json));

});

Router.route("/api/stats", { where: "server" } ).post( function() {

  // Get data
  var data = this.request.body;
  console.log('Event received: ');
  console.log(data);

  // Call function
  Meteor.call('processEvents', data);

  // Send response
  json = {
    received: true
  };
  this.response.setHeader('Content-Type', 'application/json');
  this.response.end(JSON.stringify(json));

});

Router.route("/api/subscribers", { where: "server" } ).get( function() {

  // Get data
  var listId = this.params.query.list;
  if (this.params.query.from && this.params.query.to) {

    // Get boundaries
    var from = new Date(this.params.query.from);
    var to = new Date(this.params.query.to);

    var subscribers = Subscribers.find({listId: listId, date_added: {$gte: from, $lte: to}}).fetch();
  }
  else {
    var subscribers = Subscribers.find({listId: listId}).fetch();
  }

  // Send response
  json = {
    subscribers: subscribers.length,
    listId: listId
  };
  this.response.setHeader('Content-Type', 'application/json');
  this.response.end(JSON.stringify(json));

});