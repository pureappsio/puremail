Template.ruleStatistics.helpers({

    sequenceName: function() {
        return Sequences.findOne(this.sequenceId).name;
    },
    deliveredEmails: function() {

        if (this.delivered) {
            return this.delivered;
        } else {
            return 0;
        }

    },
    openRate: function() {

        if (this.opened && this.delivered) {
            if (this.delivered != 0) {
                return ((this.opened / this.delivered) * 100).toFixed(2);
            } else {
                return 0;
            }
        } else {
            return 0;
        }

    },
    clickRate: function() {

        if (this.opened && this.clicked) {
            if (this.opened != 0) {
                return ((this.clicked / this.opened) * 100).toFixed(2);
            } else {
                return 0;
            }
        } else {
            return 0;
        }

    }

});
