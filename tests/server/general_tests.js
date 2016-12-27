// General tests
describe('Offers', function() {
    it('should add a new offer @watch', function() {

        var offer = {
            listId: 'listId',
            websiteId: 'websiteId'
        }

        var result = server.call('addOffer', offer);

        var getOffer = server.execute(function() {
            return Offers.findOne({ listId: 'listId' });
        });

        expect(getOffer.listId).to.equal('listId');
    });
    it('should remove an offer @watch', function() {

        var offer = {
            listId: 'listId',
            websiteId: 'websiteId'
        }

        var offerId = server.call('addOffer', offer);
        server.call('removeOffer', offerId);

        var getOffer = server.execute(function(id) {
            return Offers.findOne(id);
        }, offerId);

        expect(getOffer).to.be.an('undefined');
    });
});
