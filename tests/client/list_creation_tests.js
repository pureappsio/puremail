describe('Manage lists', function() {

    before(function() {
        browser.url('http://localhost:3000')
            .click('.dropdown-toggle')
            .setValue('#login-email', 'marcolivier.schwartz@gmail.com')
            .setValue('#login-password', 'beyond08')
            .click('#login-buttons-password')
    });

    it('should create a new list @watch', function() {

        browser.waitForExist('#list-name', 500)
        browser.setValue('#list-name', 'New List')
        	.click('#new-list');

        var list = server.execute(function(listName) {
            return Lists.findOne({ name: listName });
        }, 'New List');

        expect(list).not.to.be.an('undefined');
    });

    // after(function() {
    //     browser.url('http://localhost:3000')
    //         .click('.dropdown-toggle')
    //     browser.waitForExist('#login-buttons-logout')
    //     browser.click('#login-buttons-logout')
    // });

});
