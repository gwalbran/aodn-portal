Ext.namespace('Portal.visualise.animations');

Portal.visualise.animations.AnimationPlayButton = Ext.extend(Ext.Button, {

    constructor: function(config) {
        this.state = new Portal.visualise.animations.AnimationState();
        Portal.visualise.animations.AnimationPlayButton.superclass.constructor.call(this, config);
    },

    updateForState: function(state) {
        if (state == this.state.LOADING || state == this.state.PLAYING) {
            this.setIconClass('pauseButton');
            this.setTooltip(OpenLayers.i18n('pause'));
        }
        else if (state == this.state.REMOVED || state == this.state.PAUSED) {
            this.setIconClass('playButton');
            this.setTooltip(OpenLayers.i18n('play'));
            this.enable();
        }
    }
});