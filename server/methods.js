Meteor.methods({

    inJsonArray: function(value, array, field) {

        var found = false;

        for (r in array) {

            if (array[r][field] == value) {
                found = true;
            }

        }

        return found;

    },
    addOffer: function(offer) {

        console.log(offer);

        return Offers.insert(offer);

    },
    removeOffer: function(offerId) {

        Offers.remove(offerId);

    },
    getLatestSubscribers: function(listId) {
        return Subscribers.find({ listId: listId }, { sort: { date_added: -1 }, limit: 100 }).fetch();
    },
    getMode: function() {

        if (Meteor.settings.mode) {
            if (Meteor.settings.mode == 'demo') {
                return 'demo';
            } else {
                return 'live';
            }
        } else {
            return 'live';
        }

    },
    validateApiKey: function(user, key) {

        if (user.apiKey == key) {
            return true;
        } else {
            return false;
        }

    },
    generateApiKey: function() {

        // Check if key exist
        if (!Meteor.user().apiKey) {

            // Generate key
            var key = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 16; i++) {
                key += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            console.log(key);

            // Update user
            Meteor.users.update(Meteor.user()._id, { $set: { apiKey: key } });
        }

    },
    setLanguage: function(listId, language) {

        // Update language
        Lists.update(listId, { $set: { language: language } });

    },
    setConfirmationEmail: function(listId, skipConfirmation) {

        // Update confirmation skip
        Lists.update(listId, { $set: { skipConfirmation: skipConfirmation } });

    },
    addInterest: function(listId, interestName) {

        // New interest
        var interest = {
            name: interestName,
            listId: listId,
            ownerId: Meteor.user()._id
        }

        // Insert
        Interests.insert(interest);

    },
    removeInterest: function(interestId) {

        // Remove
        Interests.remove(interestId);

    },
    addSegment: function(listId, segmentName) {

        // New segment
        var segment = {
            name: segmentName,
            listId: listId,
            ownerId: Meteor.user()._id
        }

        // Insert
        Segments.insert(segment);

    },
    removeSegment: function(segmentId) {

        // Remove
        Segments.remove(segmentId);

    },
    deleteList: function(id) {

        console.log('List id ' + id);

        // Remove
        Lists.remove(id);

    },
    addNewList: function(listName) {

        // Create list
        list = {
            name: listName,
            ownerId: Meteor.user()._id
        }

        // Add
        Lists.insert(list);
    },
    combineLists: function(sourceListId, targetListId) {

        // Get all subscribers from source list
        var sourceSubscribers = Subscribers.find({ listId: sourceListId }).fetch();

        // Fuse into target list
        for (i = 0; i < sourceSubscribers.length; i++) {

            var sourceEmail = sourceSubscribers[i].email;
            if (Subscribers.findOne({ email: sourceEmail, listId: targetListId })) {

                // Just fuse interests
                var targetSubscriber = Subscribers.findOne({ email: sourceEmail, listId: targetListId });
                var interestSource = sourceSubscribers[i].interests;
                var interestTarget = targetSubscriber.interests;
                var fusedInterests = interestTarget;

                for (j = 0; j < interestSource.length; j++) {

                    addInterest = true;

                    for (k = 0; k < interestTarget.length; k++) {
                        if (interestTarget[k].name == interestSource[j].name) {
                            addInterest = false;
                        }
                    }

                    if (addInterest) {
                        fusedInterests.push(interestSource[j]);
                    }

                }

                // Update subscriber in target
                Subscribers.update({ email: sourceEmail, listId: targetListId }, { $set: { 'interests': fusedInterests } });

            } else {

                // Add new subscriber to target list
                delete sourceSubscribers[i]._id;
                sourceSubscribers[i].listId = targetListId;

                Subscribers.insert(sourceSubscribers[i]);

            }

        }

        // Fuse interests
        Interests.update({ listId: sourceListId }, { $set: { listId: targetListId } });

        // Delete source list and subscribers
        Lists.remove(sourceListId);
        Subscribers.remove({ listId: sourceListId });

    },
    setBrand: function(listId, brandName, brandEmail, userName) {

        Lists.update({ _id: listId }, { $set: { "brandName": brandName } }, function(error) {
            if (error) { console.log(error); }
        });

        Lists.update({ _id: listId }, { $set: { "brandEmail": brandEmail } }, function(error) {
            if (error) { console.log(error); }
        });

        Lists.update({ _id: listId }, { $set: { "userName": userName } }, function(error) {
            if (error) { console.log(error); }
        });

    },
    setEmailPreferences: function(listId, signUpThankYou, finalThankYou, unsubscribe) {

        Lists.update({ _id: listId }, { $set: { "signUpThankYou": signUpThankYou } }, function(error) {
            if (error) { console.log(error); }
        });

        Lists.update({ _id: listId }, { $set: { "finalThankYou": finalThankYou } }, function(error) {
            if (error) { console.log(error); }
        });

        Lists.update({ _id: listId }, { $set: { "unsubscribe": unsubscribe } }, function(error) {
            if (error) { console.log(error); }
        });

    }

});
