/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext.namespace('Portal.details');

Portal.details.SpatialConstraintDisplayPanel = Ext.extend(Ext.Panel, {
    constructor: function(cfg) {

        var defaults = {
            width: 300
        }

        cfg = Ext.apply({}, cfg, defaults);

        this.boxDisplayPanel = new Portal.details.BoxDisplayPanel(cfg);

        var config = Ext.apply({
            layout: 'card',
            title: String.format("<b>{0}</b>", OpenLayers.i18n('spatialExtentHeading')),
            activeItem: this.boxDisplayPanel,
            items: [
                this.boxDisplayPanel
            ]
        }, cfg);

        Portal.details.SpatialConstraintDisplayPanel.superclass.constructor.call(this, config);

        var self = this;
        if (config.map) {
            config.map.events.addEventType('spatialconstraintadded');

            config.map.events.on({
                scope: config.map,
                'spatialconstraintadded': function(geometry) {
                    self.setBounds(geometry.getBounds());
                }
            });
        }
    },

    setBounds: function(bounds) {
        this.boxDisplayPanel.setBounds(bounds);
    },

    getSouthBL: function() {
        return this._getBoundingLine(this.boxDisplayPanel.southBL);
    },

    getNorthBL: function() {
        return this._getBoundingLine(this.boxDisplayPanel.northBL);
    },

    getEastBL: function() {
        return this._getBoundingLine(this.boxDisplayPanel.eastBL);
    },

    getWestBL: function() {
        return this._getBoundingLine(this.boxDisplayPanel.westBL);
    },

    _getBoundingLine: function(field) {
        return parseFloat(field.value);
    },

    _buildBoundingBox: function(config) {
        this.northBL = this._buildCoord('northBL');
        this.eastBL = this._buildCoord('eastBL');
        this.southBL = this._buildCoord('southBL');
        this.westBL = this._buildCoord('westBL');

        return [
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack:'center',
                    align: 'middle'
                },
                width: this.width,
                items: [
                    this._buildLabel('northBL'),
                    this.northBL
                ]
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                width: config.width,
                items: [
                    this._buildLabel('westBL'),
                    this.westBL,
                    {
                        xtype: 'label',
                        text: ' ',
                        flex: 1
                    },
                    this.eastBL,
                    {xtype: 'spacer', width: 5},
                    this._buildLabel('eastBL')
                ]
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'middle'
                },
                width: config.width,
                items: [
                    this._buildLabel('southBL'),
                    this.southBL
                ]
            }
        ];
    },

    _buildLabel: function(i18nKey) {
        return new Ext.form.Label({
            text: OpenLayers.i18n(i18nKey),
            width: 15
        });
    },

    _buildCoord: function(name) {
        return new Ext.form.NumberField({
            name: name,
            decimalPrecision: 2,
            width: 50,
            disabled: true
        });
    }

});
