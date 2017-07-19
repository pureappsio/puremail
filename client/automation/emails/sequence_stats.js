Template.sequenceStats.helpers({

    sequenceName: function() {
        return this.name;
    },
    openRate: function() {
        return (this.openRate).toFixed(2);
    },
    clickRate: function() {
        return (this.clickRate).toFixed(2);
    }

});
