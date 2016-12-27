if(Meteor.isServer) {

	Meteor.publish("userData", function () {
	  return Meteor.users.find({_id: this.userId}, {services: 1});
	});

	Meteor.publish("userSubscribers", function () {
	  return Subscribers.find({ownerId: this.userId}, {sort: {date_added: -1}, limit: 50});
	});

	Meteor.publish("userLists", function () {
		return Lists.find({ownerId: this.userId});
	});

	Meteor.publish("userSegments", function () {
		return Segments.find({ownerId: this.userId});
	});

	Meteor.publish("userInterests", function () {
		return Interests.find({ownerId: this.userId});
	});

	Meteor.publish("userAutomations", function () {
		return Automations.find({ownerId: this.userId});
	});

	Meteor.publish("userScheduled", function () {
		return Scheduled.find({ownerId: this.userId});
	});

	Meteor.publish("userSequences", function () {
		return Sequences.find({ownerId: this.userId});
	});

	Meteor.publish("userGumroad", function () {
		return GumroadAccounts.find({ownerId: this.userId});
	});

	Meteor.publish("userProducts", function () {
		return Products.find({ownerId: this.userId});
	});

	Meteor.publish("userOffers", function () {
		return Offers.find({ownerId: this.userId});
	});

	Meteor.publish("userBroadcasts", function () {
		return Broadcasts.find({ownerId: this.userId});
	});

	Meteor.publish("userStats", function () {
		return Stats.find({ownerId: this.userId}, {sort: {date_added: -1}, limit: 50});
	});

	Meteor.publish("userIntegrations", function () {
		return Integrations.find({ownerId: this.userId});
	});

	Meteor.publish("userConditionalEmails", function () {
		return ConditionalEmails.find({ownerId: this.userId});
	});

}
