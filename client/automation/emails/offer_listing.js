Template.offerListing.events({
	'click .delete-offer': function() {
		Meteor.call('removeOffer', this._id);
	}
})

Template.offerListing.helpers({

	productName: function() {
		return Session.get('productName');
	}

});

Template.offerListing.onRendered( function() {
 
	Meteor.call('getProductName', this.data.productId, function (err, productName) {

		Session.set('productName', productName);

	});

});